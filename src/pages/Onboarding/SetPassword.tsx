import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { keyring } from "@/keyring/keyring";
import { useWalletStore } from "@/store/walletStore";

interface SetPasswordProps {
  mnemonic: string;
  onBack: () => void;
  onDone: () => void;
}

export function SetPassword({ mnemonic, onBack, onDone }: SetPasswordProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const setAccounts = useWalletStore((s) => s.setAccounts);
  const setStatus = useWalletStore((s) => s.setStatus);

  const isValid = password.length >= 8 && password === confirm;

  const handleCreate = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      const accounts = await keyring.create(mnemonic, password);
      setAccounts(accounts);
      setStatus("unlocked");
      toast.success("Wallet created successfully!");
      onDone();
    } catch (err) {
      toast.error("Failed to create wallet. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Set a Password</h1>
        <p className="text-sm text-muted-foreground mt-1">
          This password encrypts your wallet on this device. You'll need it to unlock the app.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password (min 8 characters)</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm">Confirm Password</Label>
          <Input
            id="confirm"
            type={showPw ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat password"
          />
          {confirm && password !== confirm && (
            <p className="text-xs text-destructive">Passwords do not match</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 mt-2">
        <Button variant="outline" className="flex-1" onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button
          className="flex-1"
          disabled={!isValid || loading}
          onClick={handleCreate}
        >
          {loading ? "Creating…" : "Create Wallet"}
        </Button>
      </div>
    </div>
  );
}
