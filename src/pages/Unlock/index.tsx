import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { keyring } from "@/keyring/keyring";
import { useWalletStore } from "@/store/walletStore";

export default function Unlock() {
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const setAccounts = useWalletStore((s) => s.setAccounts);
  const setStatus = useWalletStore((s) => s.setStatus); // needed after successful unlock

  const handleUnlock = async () => {
    if (!password) return;
    setLoading(true);
    setError("");
    try {
      const accounts = await keyring.unlock(password);
      setAccounts(accounts);
      setStatus("unlocked");
      navigate("/");
    } catch {
      setError("Incorrect password. Please try again.");
      toast.error("Incorrect password");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = () => {
    navigate("/onboarding/import");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-6">
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-2xl bg-primary p-4">
          <Lock className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold">Unlock Wallet</h1>
        <p className="text-sm text-muted-foreground text-center">
          Enter your password to access your wallet.
        </p>
      </div>

      <div className="w-full max-w-xs flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
              placeholder="Enter your password"
              className="pr-10"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <Button
          size="lg"
          className="w-full"
          onClick={handleUnlock}
          disabled={!password || loading}
        >
          {loading ? "Unlocking…" : "Unlock"}
        </Button>

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>

        <Button
          variant="outline"
          size="lg"
          className="w-full gap-2"
          onClick={handleImport}
        >
          <Download className="h-4 w-4" />
          Import a Different Wallet
        </Button>
      </div>
    </div>
  );
}
