import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { isAddress, parseEther } from "viem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useWallet } from "@/hooks/useWallet";
import { useGasPrice } from "@/hooks/useGasPrice";
import { EVMAdapter } from "@/chains/evm/adapter";
import { keyring } from "@/keyring/keyring";
import { formatGasPrice } from "@/lib/format";

export default function Send() {
  const navigate = useNavigate();
  const { currentAddress, currentChainId, currentNetwork } = useWallet();
  const { data: gasPrice } = useGasPrice(currentChainId);
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const toValid = to.length > 0 && isAddress(to);
  const amountValid = parseFloat(amount) > 0;
  const canSend = toValid && amountValid && !loading && !!currentAddress;

  const handleSend = async () => {
    if (!canSend || !currentAddress) return;
    setLoading(true);
    try {
      const pk = keyring.getPrivateKey(currentAddress);
      const adapter = new EVMAdapter(currentChainId);
      const hash = await adapter.sendTransaction(pk, to as `0x${string}`, parseEther(amount));
      toast.success(`Transaction sent: ${hash.slice(0, 10)}…`);
      navigate("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Transaction failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">Send</h1>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Recipient Address</Label>
          <Input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="0x..."
            className={to && !toValid ? "border-destructive" : ""}
          />
          {to && !toValid && (
            <p className="text-xs text-destructive">Invalid Ethereum address</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Amount ({currentNetwork.nativeCurrency.symbol})</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            min="0"
            step="0.0001"
          />
        </div>

        {gasPrice && (
          <Card className="bg-muted/40">
            <CardContent className="flex justify-between items-center py-3 px-4">
              <span className="text-sm text-muted-foreground">Gas Price</span>
              <span className="text-sm font-medium">{formatGasPrice(gasPrice)}</span>
            </CardContent>
          </Card>
        )}
      </div>

      <Button size="lg" className="w-full" disabled={!canSend} onClick={handleSend}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          "Send"
        )}
      </Button>
    </div>
  );
}
