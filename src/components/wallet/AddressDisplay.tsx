import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { truncateAddress } from "@/lib/format";
import { cn } from "@/lib/utils";

interface AddressDisplayProps {
  address: string;
  chars?: number;
  className?: string;
  showCopy?: boolean;
}

export function AddressDisplay({ address, chars = 4, className, showCopy = true }: AddressDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="font-mono text-sm">{truncateAddress(address, chars)}</span>
      {showCopy && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{copied ? "Copied!" : "Copy address"}</TooltipContent>
        </Tooltip>
      )}
    </span>
  );
}
