import { HDKey } from "@scure/bip32";
import { privateKeyToAddress } from "viem/accounts";
import { mnemonicToSeed } from "./mnemonic";

function toHex(bytes: Uint8Array): `0x${string}` {
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `0x${hex}` as `0x${string}`;
}

export function derivePrivateKey(mnemonic: string, index = 0): `0x${string}` {
  const seed = mnemonicToSeed(mnemonic);
  const root = HDKey.fromMasterSeed(seed);
  const path = `m/44'/60'/0'/0/${index}`;
  const child = root.derive(path);
  if (!child.privateKey) throw new Error("Failed to derive private key");
  return toHex(child.privateKey);
}

export function deriveAddress(mnemonic: string, index = 0): `0x${string}` {
  const pk = derivePrivateKey(mnemonic, index);
  return privateKeyToAddress(pk);
}
