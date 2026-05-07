import { formatEther } from "@/lib/format";
import { useNetworkStore } from "@/store/networkStore";
import { cn } from "@/lib/utils";

interface BalanceDisplayProps {
  balance?: bigint;
  isLoading?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function BalanceDisplay({ balance, isLoading, className, size = "md" }: BalanceDisplayProps) {
  const network = useNetworkStore((s) => s.currentNetwork());
  const symbol = network.nativeCurrency.symbol;

  const sizeClass = {
    sm: "text-base",
    md: "text-2xl",
    lg: "text-4xl",
  }[size];

  if (isLoading) {
    return (
      <div className={cn("animate-pulse h-8 w-32 bg-muted rounded", className)} />
    );
  }

  return (
    <span className={cn("font-bold tabular-nums", sizeClass, className)}>
      {balance !== undefined ? formatEther(balance) : "—"}{" "}
      <span className="text-muted-foreground font-normal">{symbol}</span>
    </span>
  );
}
