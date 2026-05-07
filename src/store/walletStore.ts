import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AccountEntry } from "@/keyring/keyring";

type WalletStatus = "uninitialized" | "locked" | "unlocked";

interface WalletState {
  status: WalletStatus;
  accounts: AccountEntry[];
  currentAddress: `0x${string}` | null;

  setStatus: (status: WalletStatus) => void;
  setAccounts: (accounts: AccountEntry[]) => void;
  setCurrentAddress: (address: `0x${string}`) => void;
  addAccount: (account: AccountEntry) => void;
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
