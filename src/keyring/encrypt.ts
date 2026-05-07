const PBKDF2_ITERATIONS = 210_000;
const SALT_LENGTH = 32;
const IV_LENGTH = 12;

function randomBytes(length: number): ArrayBuffer {
  const buf = new ArrayBuffer(length);
  crypto.getRandomValues(new Uint8Array(buf));
  return buf;
}

async function deriveKey(password: string, salt: ArrayBuffer): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export interface EncryptedBlob {
  salt: string;
  iv: string;
  ciphertext: string;
}

export async function encrypt(plaintext: string, password: string): Promise<EncryptedBlob> {
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  const key = await deriveKey(password, salt);
  const enc = new TextEncoder();
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plaintext)
  );
  return {
    salt: bufToHex(salt),
    iv: bufToHex(iv),
    ciphertext: bufToHex(cipherBuffer),
  };
}

export async function decrypt(blob: EncryptedBlob, password: string): Promise<string> {
  const salt = hexToBuf(blob.salt);
  const iv = hexToBuf(blob.iv);
  const ciphertext = hexToBuf(blob.ciphertext);
  const key = await deriveKey(password, salt);
  const decBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  return new TextDecoder().decode(decBuffer);
}

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuf(hex: string): ArrayBuffer {
  const buf = new ArrayBuffer(hex.length / 2);
  const view = new Uint8Array(buf);
  for (let i = 0; i < hex.length; i += 2) {
    view[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return buf;
}
