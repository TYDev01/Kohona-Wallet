import { parseEther, createWalletClient, http, type Address, type Hash } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { getPublicClient } from "./client";
import { NETWORKS } from "./networks";
import { estimateGasFees } from "./gas";

export class EVMAdapter {
  private chainId: number;

  constructor(chainId: number) {
    this.chainId = chainId;
  }

  async getBalance(address: Address): Promise<bigint> {
    const client = getPublicClient(this.chainId);
    return client.getBalance({ address });
  }

  async estimateGas(from: Address, to: Address, value: bigint, data?: `0x${string}`): Promise<bigint> {
    const client = getPublicClient(this.chainId);
    return client.estimateGas({ account: from, to, value, data });
  }

  async sendTransaction(
    privateKey: `0x${string}`,
    to: Address,
    value: bigint,
    data?: `0x${string}`
  ): Promise<Hash> {
    const account = privateKeyToAccount(privateKey);
    const net = NETWORKS[this.chainId];
    const walletClient = createWalletClient({
      account,
      chain: {
        id: net.chainId,
        name: net.name,
        nativeCurrency: net.nativeCurrency,
        rpcUrls: { default: { http: [net.rpcUrl] } },
      },
      transport: http(net.rpcUrl),
    });

    const fees = await estimateGasFees(this.chainId);

    return walletClient.sendTransaction({
      account,
      to,
      value,
      data,
      maxFeePerGas: fees.maxFeePerGas,
      maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
    });
  }

  async waitForTransaction(hash: Hash) {
    const client = getPublicClient(this.chainId);
    return client.waitForTransactionReceipt({ hash });
  }
}

export function parseEtherValue(amount: string): bigint {
  return parseEther(amount);
}
