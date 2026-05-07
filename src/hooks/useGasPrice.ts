import { useQuery } from "@tanstack/react-query";
import { getGasPrice } from "@/chains/evm/gas";
import { QUERY_STALE_TIME, QUERY_REFETCH_INTERVAL } from "@/lib/constants";

export function useGasPrice(chainId: number) {
  return useQuery({
    queryKey: ["gasPrice", chainId],
    queryFn: () => getGasPrice(chainId),
    staleTime: QUERY_STALE_TIME,
    refetchInterval: QUERY_REFETCH_INTERVAL,
  });
}
