import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import { getTokenBalances, type TokenInfo } from "@/chains/evm/tokens";
import { QUERY_STALE_TIME, QUERY_REFETCH_INTERVAL } from "@/lib/constants";

export function useTokenBalances(address: Address | null, chainId: number, tokens: TokenInfo[]) {
  return useQuery({
    queryKey: ["tokenBalances", chainId, address, tokens.map((t) => t.address)],
    queryFn: async () => {
      if (!address || tokens.length === 0) return [];
      return getTokenBalances(chainId, tokens, address);
    },
    enabled: !!address && tokens.length > 0,
    staleTime: QUERY_STALE_TIME,
    refetchInterval: QUERY_REFETCH_INTERVAL,
  });
}
