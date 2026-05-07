import { getPublicClient } from "./client";

export interface GasFees {
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  gasPrice: bigint;
}

export async function estimateGasFees(chainId: number): Promise<GasFees> {
  const client = getPublicClient(chainId);

  const [block, gasPrice] = await Promise.all([
    client.getBlock({ blockTag: "latest" }),
    client.getGasPrice(),
  ]);

  const baseFee = block.baseFeePerGas ?? gasPrice;
  const maxPriorityFeePerGas = BigInt("1500000000"); // 1.5 Gwei tip
  const maxFeePerGas = baseFee * 2n + maxPriorityFeePerGas;

  return { maxFeePerGas, maxPriorityFeePerGas, gasPrice };
}

export async function getGasPrice(chainId: number): Promise<bigint> {
  const client = getPublicClient(chainId);
  return client.getGasPrice();
}
