import { formatUnits } from "viem";

export function truncateAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatEther(wei: bigint, decimals = 6): string {
  const val = formatUnits(wei, 18);
  const num = parseFloat(val);
  if (num === 0) return "0";
  if (num < 0.000001) return "< 0.000001";
  return num.toFixed(decimals).replace(/\.?0+$/, "");
}

export function formatTokenAmount(amount: bigint, decimals: number, displayDecimals = 4): string {
  const val = formatUnits(amount, decimals);
  const num = parseFloat(val);
  if (num === 0) return "0";
  if (num < Math.pow(10, -displayDecimals)) return `< ${Math.pow(10, -displayDecimals)}`;
  return num.toFixed(displayDecimals).replace(/\.?0+$/, "");
}

export function formatGasPrice(wei: bigint): string {
  const gwei = formatUnits(wei, 9);
  return `${parseFloat(gwei).toFixed(2)} Gwei`;
}

export function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
