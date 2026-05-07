import { openDB, type IDBPDatabase } from "idb";
import { privateKeyToAddress } from "viem/accounts";
import { encrypt, decrypt, type EncryptedBlob } from "./encrypt";
import { derivePrivateKey } from "./derive";
import { IDB_DB_NAME, IDB_KEYRING_KEY } from "@/lib/constants";

export interface AccountEntry {
  index: number;
  address: `0x${string}`;
  label: string;
}

interface KeyringData {
  mnemonic: string;
  accounts: AccountEntry[];
}

interface StoredKeyring {
  blob: EncryptedBlob;
  accounts: AccountEntry[];
}

export class Keyring {
  private db: IDBPDatabase | null = null;
  private mnemonic: string | null = null;
  private privateKeys = new Map<`0x${string}`, `0x${string}`>();
  private currentPassword: string | null = null;

  async init() {
    this.db = await openDB(IDB_DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("keyring")) {
          db.createObjectStore("keyring");
        }
      },
    });
  }

  async exists(): Promise<boolean> {
    if (!this.db) await this.init();
    const val = await this.db!.get("keyring", IDB_KEYRING_KEY);
    return val !== undefined;
  }

  get isLocked(): boolean {
    return this.mnemonic === null;
  }

  async create(mnemonic: string, password: string): Promise<AccountEntry[]> {
    if (!this.db) await this.init();
    const accounts: AccountEntry[] = [];
    const firstPk = derivePrivateKey(mnemonic, 0);
    const firstAddress = privateKeyToAddress(firstPk);
    accounts.push({ index: 0, address: firstAddress, label: "Account 1" });

    const data: KeyringData = { mnemonic, accounts };
    const blob = await encrypt(JSON.stringify(data), password);
    const stored: StoredKeyring = { blob, accounts };
    await this.db!.put("keyring", stored, IDB_KEYRING_KEY);

    this.mnemonic = mnemonic;
    this.currentPassword = password;
    this.privateKeys.set(firstAddress, firstPk);
    return accounts;
  }

  async unlock(password: string): Promise<AccountEntry[]> {
    if (!this.db) await this.init();
    const stored: StoredKeyring = await this.db!.get("keyring", IDB_KEYRING_KEY);
    if (!stored) throw new Error("No keyring found");

    const plaintext = await decrypt(stored.blob, password);
    const data: KeyringData = JSON.parse(plaintext);
    this.mnemonic = data.mnemonic;
    this.currentPassword = password;

    for (const account of data.accounts) {
      const pk = derivePrivateKey(data.mnemonic, account.index);
      this.privateKeys.set(account.address, pk);
    }

    return data.accounts;
  }

  lock() {
    this.mnemonic = null;
    this.currentPassword = null;
    this.privateKeys.clear();
  }

  getAccounts(): AccountEntry[] {
    if (this.isLocked) return [];
    return Array.from(this.privateKeys.entries()).map(([address], i) => ({
      index: i,
      address,
      label: `Account ${i + 1}`,
    }));
  }

  getPrivateKey(address: `0x${string}`): `0x${string}` {
    if (this.isLocked) throw new Error("Keyring is locked");
    const pk = this.privateKeys.get(address);
    if (!pk) throw new Error("Account not found");
    return pk;
  }

  getMnemonic(): string {
    if (this.isLocked) throw new Error("Keyring is locked");
    return this.mnemonic!;
  }

  async addAccount(): Promise<AccountEntry> {
    if (this.isLocked || !this.currentPassword) throw new Error("Keyring is locked");
    if (!this.db) await this.init();

    const nextIndex = this.privateKeys.size;
    const pk = derivePrivateKey(this.mnemonic!, nextIndex);
    const address = privateKeyToAddress(pk);
    const entry: AccountEntry = { index: nextIndex, address, label: `Account ${nextIndex + 1}` };
    this.privateKeys.set(address, pk);

    const stored: StoredKeyring = await this.db!.get("keyring", IDB_KEYRING_KEY);
    const accounts = [...stored.accounts, entry];
    const data: KeyringData = { mnemonic: this.mnemonic!, accounts };
    const blob = await encrypt(JSON.stringify(data), this.currentPassword);
    await this.db!.put("keyring", { blob, accounts }, IDB_KEYRING_KEY);

    return entry;
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    if (!this.db) await this.init();
    const stored: StoredKeyring = await this.db!.get("keyring", IDB_KEYRING_KEY);
    const plaintext = await decrypt(stored.blob, oldPassword);
    const newBlob = await encrypt(plaintext, newPassword);
    await this.db!.put("keyring", { ...stored, blob: newBlob }, IDB_KEYRING_KEY);
    this.currentPassword = newPassword;
  }
}

export const keyring = new Keyring();
