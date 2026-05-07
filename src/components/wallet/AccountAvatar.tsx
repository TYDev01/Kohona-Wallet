import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface AccountAvatarProps {
  address: string;
  size?: number;
  className?: string;
}

function addressToColor(address: string, offset: number): string {
  let hash = 0;
  const str = address.toLowerCase() + offset;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 65%, 55%)`;
}

export function AccountAvatar({ address, size = 40, className }: AccountAvatarProps) {
  const colors = useMemo(() => {
    const clean = address.toLowerCase().replace("0x", "");
    return Array.from({ length: 4 }, (_, i) => addressToColor(clean, i * 7));
  }, [address]);

  const half = size / 2;
  const quarter = size / 4;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("rounded-full flex-shrink-0", className)}
    >
      <rect x={0} y={0} width={half} height={half} fill={colors[0]} />
      <rect x={half} y={0} width={half} height={half} fill={colors[1]} />
      <rect x={0} y={half} width={half} height={half} fill={colors[2]} />
      <rect x={half} y={half} width={half} height={half} fill={colors[3]} />
      <circle cx={half} cy={half} r={quarter} fill={colors[0]} opacity={0.6} />
    </svg>
  );
}
