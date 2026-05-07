import { Coins } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BalanceDisplay } from "@/components/wallet/BalanceDisplay";
import { useWallet } from "@/hooks/useWallet";
import { useBalance } from "@/hooks/useBalance";

export function AssetList() {
  const { currentAddress, currentChainId, currentNetwork } = useWallet();
  const { data: balance, isLoading, isError, refetch } = useBalance(currentAddress, currentChainId);

  return (
    <div className="px-4 pb-4">
      <h2 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
        Assets
      </h2>
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Coins className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{currentNetwork.nativeCurrency.name}</p>
              <p className="text-xs text-muted-foreground">{currentNetwork.nativeCurrency.symbol}</p>
            </div>
            <BalanceDisplay balance={balance} isLoading={isLoading} isError={isError} onRetry={refetch} size="sm" />
          </div>
          <Separator />
          <div className="flex items-center justify-center p-4 text-xs text-muted-foreground">
            Token imports coming soon
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
