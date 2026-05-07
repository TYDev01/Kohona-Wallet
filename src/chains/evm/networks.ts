export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  blockExplorer: string;
  isTestnet?: boolean;
}

const env = import.meta.env;

export const NETWORKS: Record<number, NetworkConfig> = {
  1: {
    chainId: 1,
    name: "Ethereum",
    rpcUrl: env.VITE_RPC_ETHEREUM || "https://eth.llamarpc.com",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    blockExplorer: "https://etherscan.io",
  },
  137: {
    chainId: 137,
    name: "Polygon",
    rpcUrl: env.VITE_RPC_POLYGON || "https://polygon.llamarpc.com",
    nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
    blockExplorer: "https://polygonscan.com",
  },
  42161: {
    chainId: 42161,
    name: "Arbitrum One",
    rpcUrl: env.VITE_RPC_ARBITRUM || "https://arbitrum.llamarpc.com",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    blockExplorer: "https://arbiscan.io",
  },
  8453: {
    chainId: 8453,
    name: "Base",
    rpcUrl: env.VITE_RPC_BASE || "https://base.llamarpc.com",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    blockExplorer: "https://basescan.org",
  },
  11155111: {
    chainId: 11155111,
    name: "Sepolia",
    rpcUrl: env.VITE_RPC_SEPOLIA || "https://ethereum-sepolia-rpc.publicnode.com",
    nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
    blockExplorer: "https://sepolia.etherscan.io",
    isTestnet: true,
  },
};

export const DEFAULT_NETWORK = NETWORKS[1];
