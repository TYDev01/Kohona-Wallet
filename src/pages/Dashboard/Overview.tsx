import { AccountAvatar } from "@/components/wallet/AccountAvatar";
import { AddressDisplay } from "@/components/wallet/AddressDisplay";
import { BalanceDisplay } from "@/components/wallet/BalanceDisplay";
import { NetworkBadge } from "@/components/wallet/NetworkBadge";
import { useWallet } from "@/hooks/useWallet";
import { useBalance } from "@/hooks/useBalance";

export function Overview() {
  const { currentAddress, currentChainId } = useWallet();
  const { data: balance, isLoading } = useBalance(currentAddress, currentChainId);

  if (!currentAddress) return null;

  return (
    <div className="flex flex-col items-center gap-4 py-8 px-4">
      <AccountAvatar address={currentAddress} size={64} />

      <div className="flex flex-col items-center gap-1">
        <AddressDisplay address={currentAddress} chars={6} />
        <NetworkBadge />
      </div>

      <div className="mt-2">
        <BalanceDisplay balance={balance} isLoading={isLoading} size="lg" />
      </div>
    </div>
  );
}
