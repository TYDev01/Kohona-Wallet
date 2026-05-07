import { Badge } from "@/components/ui/badge";
import { useNetworkStore } from "@/store/networkStore";
import { cn } from "@/lib/utils";

interface NetworkBadgeProps {
  className?: string;
}

export function NetworkBadge({ className }: NetworkBadgeProps) {
  const network = useNetworkStore((s) => s.currentNetwork());
  const isTestnet = network.isTestnet;

  return (
    <Badge
      variant={isTestnet ? "secondary" : "default"}
      className={cn("text-xs", className)}
    >
      {network.name}
    </Badge>
  );
}
