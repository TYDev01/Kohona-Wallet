import {
  createPublicClient,
  createWalletClient,
  http,
  type PublicClient,
  type WalletClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { NETWORKS } from "./networks";

const publicClientCache = new Map<string, PublicClient>();

function cacheKey(chainId: number, rpcUrl: string) {
  return `${chainId}::${rpcUrl}`;
}

function chainConfig(net: ReturnType<typeof getNetwork>) {
  return {
    id: net.chainId,
    name: net.name,
    nativeCurrency: net.nativeCurrency,
    rpcUrls: { default: { http: [net.rpcUrl] } },
  } as const;
}

function getNetwork(chainId: number) {
  const net = NETWORKS[chainId];
  if (!net) throw new Error(`Unknown chainId: ${chainId}`);
  return net;
}

export function getPublicClient(chainId: number): PublicClient {
  const net = getNetwork(chainId);
  const key = cacheKey(chainId, net.rpcUrl);
  if (publicClientCache.has(key)) return publicClientCache.get(key)!;
  const client = createPublicClient({
    chain: chainConfig(net),
    transport: http(net.rpcUrl),
  });
  publicClientCache.set(key, client);
  return client;
}

export function getWalletClient(privateKey: `0x${string}`, chainId: number): WalletClient {
  const net = getNetwork(chainId);
  const account = privateKeyToAccount(privateKey);
  return createWalletClient({
    account,
    chain: chainConfig(net),
    transport: http(net.rpcUrl),
  });
}

export function clearClientCache() {
  publicClientCache.clear();
}
