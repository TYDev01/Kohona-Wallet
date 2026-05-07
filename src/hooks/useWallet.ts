import { useWalletStore } from "@/store/walletStore";
import { useNetworkStore } from "@/store/networkStore";

export function useWallet() {
  const status = useWalletStore((s) => s.status);
  const accounts = useWalletStore((s) => s.accounts);
  const currentAddress = useWalletStore((s) => s.currentAddress);
  const setStatus = useWalletStore((s) => s.setStatus);
  const setAccounts = useWalletStore((s) => s.setAccounts);
  const setCurrentAddress = useWalletStore((s) => s.setCurrentAddress);
  const addAccount = useWalletStore((s) => s.addAccount);
  const reset = useWalletStore((s) => s.reset);

  const currentChainId = useNetworkStore((s) => s.currentChainId);
  const currentNetwork = useNetworkStore((s) => s.currentNetwork());
  const setNetwork = useNetworkStore((s) => s.setNetwork);

  return {
    status,
    accounts,
    currentAddress,
    currentChainId,
    currentNetwork,
    isLocked: status === "locked",
    isUnlocked: status === "unlocked",
    isUninitialized: status === "uninitialized",
    setStatus,
    setAccounts,
    setCurrentAddress,
    addAccount,
    reset,
    setNetwork,
  };
}
