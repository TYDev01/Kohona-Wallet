import { type Address } from "viem";
import { getPublicClient } from "./client";

export interface TokenInfo {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
}

export interface TokenBalance extends TokenInfo {
  balance: bigint;
}

const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "name",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;

export async function getTokenBalance(
  chainId: number,
  tokenAddress: Address,
  walletAddress: Address
): Promise<bigint> {
  const client = getPublicClient(chainId);
  return client.readContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [walletAddress],
  }) as Promise<bigint>;
}

export async function getTokenInfo(chainId: number, tokenAddress: Address): Promise<TokenInfo> {
  const client = getPublicClient(chainId);

  const [symbol, name, decimals] = await Promise.all([
    client.readContract({ address: tokenAddress, abi: ERC20_ABI, functionName: "symbol" }),
    client.readContract({ address: tokenAddress, abi: ERC20_ABI, functionName: "name" }),
    client.readContract({ address: tokenAddress, abi: ERC20_ABI, functionName: "decimals" }),
  ]);

  return { address: tokenAddress, symbol: symbol as string, name: name as string, decimals: decimals as number };
}

export async function getTokenBalances(
  chainId: number,
  tokens: TokenInfo[],
  walletAddress: Address
): Promise<TokenBalance[]> {
  const balances = await Promise.all(
    tokens.map((token) => getTokenBalance(chainId, token.address, walletAddress))
  );
  return tokens.map((token, i) => ({ ...token, balance: balances[i] }));
}
