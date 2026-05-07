import { useState } from "react";
import { Eye, EyeOff, Copy, Check, KeyRound, AlertTriangle, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AccountAvatar } from "./AccountAvatar";
import { keyring } from "@/keyring/keyring";
import type { Account } from "@/store/walletStore";
import { cn } from "@/lib/utils";

interface AccountDetailsProps {
  account: Account;
  open: boolean;
  onClose: () => void;
}

type KeyStep = "idle" | "confirm" | "revealed";

export function AccountDetails({ account, open, onClose }: AccountDetailsProps) {
  const [copied, setCopied] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);
  const [keyStep, setKeyStep] = useState<KeyStep>("idle");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [privateKey, setPrivateKey] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleClose = () => {
    setKeyStep("idle");
    setPassword("");
    setPrivateKey("");
    setError("");
    setShowKey(false);
    onClose();
  };

  const handleCopyAddress = async () => {
    await navigator.clipboard.writeText(account.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyKey = async () => {
    await navigator.clipboard.writeText(privateKey);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  };

  const handleReveal = async () => {
    if (!password) return;
    setVerifying(true);
    setError("");
    try {
      const ok = await keyring.verifyPassword(password);
      if (!ok) {
        setError("Incorrect password.");
        return;
      }
      const pk = keyring.getPrivateKey(account.address);
      setPrivateKey(pk);
      setKeyStep("revealed");
    } catch {
      setError("Could not retrieve key. Make sure the wallet is unlocked.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Account Details</DialogTitle>
        </DialogHeader>

        {/* Avatar + address */}
        <div className="flex flex-col items-center gap-3 py-2">
          <AccountAvatar address={account.address} size={56} />
          <div className="flex items-center gap-1.5">
            <p className="font-medium">{account.label}</p>
            {account.imported && (
              <Badge variant="secondary" className="text-xs">Imported</Badge>
            )}
          </div>
          <div className="w-full rounded-lg border bg-muted/40 px-3 py-2 text-xs font-mono text-center break-all">
            {account.address}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleCopyAddress}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy Address"}
          </Button>
        </div>

        <Separator />

        {/* Export private key section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Export Private Key</span>
          </div>

          {keyStep === "idle" && (
            <>
              <p className="text-xs text-muted-foreground">
                Your private key grants full access to this account. Never share it with anyone.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setKeyStep("confirm")}
              >
                Show Private Key
              </Button>
            </>
          )}

          {keyStep === "confirm" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-3">
                <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  Anyone with this key has full control of this account. Keep it secret.
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="reveal-pw" className="text-xs">
                  Confirm your password
                </Label>
                <div className="relative">
                  <Input
                    id="reveal-pw"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleReveal()}
                    placeholder="Enter password"
                    className="pr-10 h-9 text-sm"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => { setKeyStep("idle"); setPassword(""); setError(""); }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  disabled={!password || verifying}
                  onClick={handleReveal}
                >
                  {verifying ? "Verifying…" : "Reveal"}
                </Button>
              </div>
            </div>
          )}

          {keyStep === "revealed" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3">
                <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-xs text-destructive">
                  Never share this key. Store it securely offline.
                </p>
              </div>
              <div className="relative">
                <div
                  className={cn(
                    "rounded-md border bg-muted/40 px-3 py-2 font-mono text-xs break-all leading-relaxed",
                    !showKey && "blur-sm select-none cursor-pointer"
                  )}
                  onClick={() => setShowKey(true)}
                >
                  {privateKey}
                </div>
                {!showKey && (
                  <div
                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    onClick={() => setShowKey(true)}
                  >
                    <span className="rounded-full bg-background border px-3 py-1 text-xs font-medium shadow-sm flex items-center gap-1">
                      <Eye className="h-3 w-3" /> Click to reveal
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={handleCopyKey}
                >
                  {keyCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {keyCopied ? "Copied!" : "Copy Key"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                  onClick={() => { setKeyStep("idle"); setPrivateKey(""); setShowKey(false); }}
                >
                  <X className="h-3.5 w-3.5" /> Hide
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
