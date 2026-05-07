import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import { getPublicClient } from "@/chains/evm/client";
import { QUERY_STALE_TIME, QUERY_REFETCH_INTERVAL } from "@/lib/constants";

export function useBalance(address: Address | null, chainId: number) {
  return useQuery({
    queryKey: ["balance", chainId, address],
    queryFn: async () => {
      if (!address) return 0n;
      const client = getPublicClient(chainId);
      return client.getBalance({ address });
    },
    enabled: !!address,
    staleTime: QUERY_STALE_TIME,
    refetchInterval: QUERY_REFETCH_INTERVAL,
  });
}
