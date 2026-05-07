import { create } from "zustand";
import { persist } from "zustand/middleware";
import { NETWORKS, DEFAULT_NETWORK, type NetworkConfig } from "@/chains/evm/networks";
import { DEFAULT_CHAIN_ID } from "@/lib/constants";

interface NetworkState {
  currentChainId: number;
  customNetworks: Record<number, NetworkConfig>;

  currentNetwork: () => NetworkConfig;
  allNetworks: () => NetworkConfig[];
  setNetwork: (chainId: number) => void;
  addCustomNetwork: (network: NetworkConfig) => void;
  removeCustomNetwork: (chainId: number) => void;
}

export const useNetworkStore = create<NetworkState>()(
  persist(
    (set, get) => ({
      currentChainId: DEFAULT_CHAIN_ID,
      customNetworks: {},

      currentNetwork: () => {
        const { currentChainId, customNetworks } = get();
        return NETWORKS[currentChainId] ?? customNetworks[currentChainId] ?? DEFAULT_NETWORK;
      },
      allNetworks: () => {
        const { customNetworks } = get();
        return [...Object.values(NETWORKS), ...Object.values(customNetworks)];
      },
      setNetwork: (chainId) => set({ currentChainId: chainId }),
      addCustomNetwork: (network) =>
        set((s) => ({
          customNetworks: { ...s.customNetworks, [network.chainId]: network },
        })),
      removeCustomNetwork: (chainId) =>
        set((s) => {
          const rest = { ...s.customNetworks };
          delete rest[chainId];
          return { customNetworks: rest };
        }),
    }),
    { name: "network-store" }
  )
);
