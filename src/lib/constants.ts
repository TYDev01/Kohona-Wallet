export const APP_NAME = "Konoha";

export const CHAIN_IDS = {
  MAINNET: 1,
  POLYGON: 137,
  ARBITRUM: 42161,
  BASE: 8453,
  SEPOLIA: 11155111,
} as const;

export const DEFAULT_CHAIN_ID = CHAIN_IDS.MAINNET;

export const IDB_DB_NAME = "evm-wallet";
export const IDB_KEYRING_KEY = "keyring";

export const BIP44_ETH_PATH = (index: number) =>
  `m/44'/60'/0'/0/${index}` as const;

export const QUERY_STALE_TIME = 30_000;
export const QUERY_REFETCH_INTERVAL = 15_000;
