import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Hex } from "viem";

export type Account = {
  address: Hex;
  index?: number;   // present for HD-derived accounts
  label: string;
  imported: boolean; // true for private-key / keystore imports
};

type WalletStatus = "uninitialized" | "locked" | "unlocked";

interface WalletState {
  status: WalletStatus;
  accounts: Account[];
  currentAddress: Hex | null;

  setStatus: (status: WalletStatus) => void;
  setAccounts: (accounts: Account[]) => void;
  setCurrentAddress: (address: Hex) => void;
  setActiveAccount: (address: Hex) => void;
  addAccount: (account: Account) => void;
  reset: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      status: "uninitialized",
      accounts: [],
      currentAddress: null,

      setStatus: (status) => set({ status }),
      setAccounts: (accounts) =>
        set({ accounts, currentAddress: accounts[0]?.address ?? null }),
      setCurrentAddress: (address) => set({ currentAddress: address }),
      setActiveAccount: (address) => set({ currentAddress: address }),
      addAccount: (account) =>
        set((s) => ({ accounts: [...s.accounts, account] })),
      reset: () => set({ status: "uninitialized", accounts: [], currentAddress: null }),
    }),
    {
      name: "wallet-store",
      partialize: (s) => ({
        accounts: s.accounts,
        currentAddress: s.currentAddress,
      }),
    }
  )
);
