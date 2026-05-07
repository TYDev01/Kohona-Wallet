import { RefreshCw } from "lucide-react";
import { formatEther } from "@/lib/format";
import { useNetworkStore } from "@/store/networkStore";
import { cn } from "@/lib/utils";

interface BalanceDisplayProps {
  balance?: bigint;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function BalanceDisplay({
  balance,
  isLoading,
  isError,
  onRetry,
  className,
  size = "md",
}: BalanceDisplayProps) {
  const network = useNetworkStore((s) => s.currentNetwork());
  const symbol = network.nativeCurrency.symbol;

  const sizeClass = {
    sm: "text-base",
    md: "text-2xl",
    lg: "text-4xl",
  }[size];

  if (isLoading) {
    return <div className={cn("animate-pulse h-8 w-32 bg-muted rounded", className)} />;
  }

  if (isError) {
    return (
      <span className={cn("flex items-center gap-1.5 text-muted-foreground", className)}>
        <span className={cn("font-bold", sizeClass)}>—</span>
        <span className="font-normal text-sm">{symbol}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            title="Retry"
            className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        )}
      </span>
    );
  }

  return (
    <span className={cn("font-bold tabular-nums", sizeClass, className)}>
      {balance !== undefined ? formatEther(balance) : "—"}{" "}
      <span className="text-muted-foreground font-normal">{symbol}</span>
    </span>
  );
}
