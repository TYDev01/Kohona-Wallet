import { openDB, type IDBPDatabase } from "idb";
import { privateKeyToAddress } from "viem/accounts";
import type { Hex } from "viem";
import { encrypt, decrypt, type EncryptedBlob } from "./encrypt";
import { derivePrivateKey } from "./derive";
import { isValidMnemonic } from "./mnemonic";
import { IDB_DB_NAME, IDB_KEYRING_KEY } from "@/lib/constants";

export interface AccountEntry {
  index?: number;   // present for HD-derived accounts
  address: Hex;
  label: string;
  imported: boolean;
}

interface StoredImportedKey {
  address: Hex;
  privateKey: string; // hex without 0x, stored only in encrypted blob
}

interface KeyringData {
  mnemonic?: string;
  accounts: AccountEntry[];
  importedKeys: StoredImportedKey[];
}

interface StoredKeyring {
  blob: EncryptedBlob;
  accounts: AccountEntry[]; // unencrypted metadata (no keys)
}

export class Keyring {
  private db: IDBPDatabase | null = null;
  private mnemonic: string | null = null;
  private currentPassword: string | null = null;
  private privateKeys = new Map<Hex, Hex>(); // address -> private key

  private async getDb(): Promise<IDBPDatabase> {
    if (!this.db) {
      this.db = await openDB(IDB_DB_NAME, 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains("keyring")) {
            db.createObjectStore("keyring");
          }
        },
      });
    }
    return this.db;
  }

  private async load(): Promise<StoredKeyring | undefined> {
    const db = await this.getDb();
    return db.get("keyring", IDB_KEYRING_KEY);
  }

  private async save(data: KeyringData, password: string): Promise<void> {
    const db = await this.getDb();
    const blob = await encrypt(JSON.stringify(data), password);
    const stored: StoredKeyring = { blob, accounts: data.accounts };
    await db.put("keyring", stored, IDB_KEYRING_KEY);
  }

  async exists(): Promise<boolean> {
    const stored = await this.load();
    return stored !== undefined;
  }

  get isLocked(): boolean {
    return this.mnemonic === null && this.privateKeys.size === 0;
  }

  // ─── Create (new wallet) ────────────────────────────────────────────────────

  async create(mnemonic: string, password: string): Promise<AccountEntry[]> {
    const pk = derivePrivateKey(mnemonic, 0);
    const address = privateKeyToAddress(pk);
    const accounts: AccountEntry[] = [
      { index: 0, address, label: "Account 1", imported: false },
    ];
    const data: KeyringData = { mnemonic, accounts, importedKeys: [] };
    await this.save(data, password);
    this.mnemonic = mnemonic;
    this.currentPassword = password;
    this.privateKeys.set(address, pk);
    return accounts;
  }

  // ─── Unlock ─────────────────────────────────────────────────────────────────

  async unlock(password: string): Promise<AccountEntry[]> {
    const stored = await this.load();
    if (!stored) throw new Error("No keyring found");
    const plaintext = await decrypt(stored.blob, password);
    const data: KeyringData = JSON.parse(plaintext);

    this.mnemonic = data.mnemonic ?? null;
    this.currentPassword = password;

    for (const account of data.accounts) {
      if (!account.imported && account.index !== undefined && data.mnemonic) {
        const pk = derivePrivateKey(data.mnemonic, account.index);
        this.privateKeys.set(account.address, pk);
      }
    }
    for (const imp of data.importedKeys ?? []) {
      this.privateKeys.set(imp.address, `0x${imp.privateKey}` as Hex);
    }

    return data.accounts;
  }

  // ─── Lock ───────────────────────────────────────────────────────────────────

  lock(): void {
    this.mnemonic = null;
    this.currentPassword = null;
    this.privateKeys.clear();
  }

  // ─── Accessors ──────────────────────────────────────────────────────────────

  getAccounts(): AccountEntry[] {
    if (this.isLocked) return [];
    return Array.from(this.privateKeys.keys()).map((address, i) => ({
      index: i,
      address,
      label: `Account ${i + 1}`,
      imported: false,
    }));
  }

  getPrivateKey(address: Hex): Hex {
    if (this.isLocked) throw new Error("Keyring is locked");
    const pk = this.privateKeys.get(address);
    if (!pk) throw new Error("Account not found");
    return pk;
  }

  getMnemonic(): string {
    if (this.isLocked) throw new Error("Keyring is locked");
    if (!this.mnemonic) throw new Error("No mnemonic — wallet was imported via private key");
    return this.mnemonic;
  }

  // ─── Import: Seed Phrase ─────────────────────────────────────────────────────

  async importFromMnemonic(
    mnemonic: string,
    selectedIndices: number[],
    password: string
  ): Promise<AccountEntry[]> {
    if (!isValidMnemonic(mnemonic)) throw new Error("Invalid mnemonic");
    if (selectedIndices.length === 0) throw new Error("No accounts selected");

    const accounts: AccountEntry[] = selectedIndices.map((idx) => {
      const pk = derivePrivateKey(mnemonic, idx);
      const address = privateKeyToAddress(pk);
      return { index: idx, address, label: `Account ${idx + 1}`, imported: false };
    });

    const data: KeyringData = { mnemonic, accounts, importedKeys: [] };
    await this.save(data, password);

    this.mnemonic = mnemonic;
    this.currentPassword = password;
    for (const account of accounts) {
      const pk = derivePrivateKey(mnemonic, account.index!);
      this.privateKeys.set(account.address, pk);
    }
    return accounts;
  }

  // ─── Import: Private Key ─────────────────────────────────────────────────────

  async importFromPrivateKey(privateKey: Hex, password: string): Promise<AccountEntry[]> {
    const address = privateKeyToAddress(privateKey);
    const accounts: AccountEntry[] = [
      { address, label: "Imported Account", imported: true },
    ];
    const importedKeys: StoredImportedKey[] = [
      { address, privateKey: privateKey.slice(2) }, // strip 0x
    ];
    const data: KeyringData = { accounts, importedKeys };
    await this.save(data, password);

    this.currentPassword = password;
    this.privateKeys.set(address, privateKey);
    return accounts;
  }

  // ─── Import: Keystore ────────────────────────────────────────────────────────

  async importFromKeystore(
    keystoreJson: string,
    keystorePassword: string,
    encryptionPassword: string
  ): Promise<AccountEntry[]> {
    const { Wallet } = await import("@ethereumjs/wallet");
    const wallet = await Wallet.fromV3(keystoreJson, keystorePassword);
    const privateKey = `0x${wallet.getPrivateKeyString().replace("0x", "")}` as Hex;
    return this.importFromPrivateKey(privateKey, encryptionPassword);
  }

  // ─── Derive next account (HD wallets only) ───────────────────────────────────

  async deriveNextAccount(): Promise<AccountEntry> {
    if (this.isLocked || !this.currentPassword) throw new Error("Keyring is locked");
    if (!this.mnemonic) throw new Error("No mnemonic — cannot derive more accounts");

    const stored = await this.load();
    if (!stored) throw new Error("No keyring found");

    const plaintext = await decrypt(stored.blob, this.currentPassword);
    const data: KeyringData = JSON.parse(plaintext);

    const maxIndex = data.accounts
      .filter((a) => !a.imported && a.index !== undefined)
      .reduce((m, a) => Math.max(m, a.index!), -1);
    const nextIndex = maxIndex + 1;

    const pk = derivePrivateKey(this.mnemonic, nextIndex);
    const address = privateKeyToAddress(pk);
    const entry: AccountEntry = {
      index: nextIndex,
      address,
      label: `Account ${nextIndex + 1}`,
      imported: false,
    };

    data.accounts.push(entry);
    await this.save(data, this.currentPassword);
    this.privateKeys.set(address, pk);
    return entry;
  }

  // ─── Change password ─────────────────────────────────────────────────────────

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    const stored = await this.load();
    if (!stored) throw new Error("No keyring found");
    const plaintext = await decrypt(stored.blob, oldPassword);
    const data: KeyringData = JSON.parse(plaintext);
    await this.save(data, newPassword);
    this.currentPassword = newPassword;
  }
}

export const keyring = new Keyring();
