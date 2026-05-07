import {
  createPublicClient,
  createWalletClient,
  http,
  type PublicClient,
  type WalletClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { NETWORKS } from "./networks";

const publicClientCache = new Map<number, PublicClient>();

function chainConfig(chainId: number) {
  const net = NETWORKS[chainId];
  if (!net) throw new Error(`Unknown chainId: ${chainId}`);
  return {
    id: net.chainId,
    name: net.name,
    nativeCurrency: net.nativeCurrency,
    rpcUrls: { default: { http: [net.rpcUrl] } },
  } as const;
}

export function getPublicClient(chainId: number): PublicClient {
  if (publicClientCache.has(chainId)) {
    return publicClientCache.get(chainId)!;
  }
  const net = NETWORKS[chainId];
  if (!net) throw new Error(`Unknown chainId: ${chainId}`);
  const client = createPublicClient({
    chain: chainConfig(chainId),
    transport: http(net.rpcUrl),
  });
  publicClientCache.set(chainId, client);
  return client;
}

export function getWalletClient(privateKey: `0x${string}`, chainId: number): WalletClient {
  const account = privateKeyToAccount(privateKey);
  return createWalletClient({
    account,
    chain: chainConfig(chainId),
    transport: http(NETWORKS[chainId].rpcUrl),
  });
}

export function clearClientCache() {
  publicClientCache.clear();
}
