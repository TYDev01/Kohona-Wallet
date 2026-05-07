import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { isHex } from "viem";
import { privateKeyToAddress } from "viem/accounts";
import type { Hex } from "viem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SetPassword } from "../SetPassword";
import { keyring } from "@/keyring/keyring";
import { truncateAddress } from "@/lib/format";

function isValidPrivateKey(value: string): value is Hex {
  return /^0x[0-9a-fA-F]{64}$/.test(value) && isHex(value);
}

type Step = "enter" | "password";

export default function PrivateKeyImport() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("enter");
  const [privateKey, setPrivateKey] = useState("");

  const valid = isValidPrivateKey(privateKey);
  const derivedAddress = valid ? privateKeyToAddress(privateKey as Hex) : null;

  if (step === "password") {
    return (
      <SetPassword
        onCreate={(password) => keyring.importFromPrivateKey(privateKey as Hex, password)}
        onBack={() => setStep("enter")}
        onDone={() => navigate("/")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate("/onboarding/import")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Private Key</h1>
          <p className="text-sm text-muted-foreground">Import using a hex private key</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="pk">Private Key</Label>
        <Input
          id="pk"
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value.trim())}
          placeholder="0x..."
          className={privateKey && !valid ? "border-destructive font-mono" : "font-mono"}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
        />
        {privateKey && !valid && (
          <p className="text-xs text-destructive">
            Must be a 0x-prefixed 64-character hex string.
          </p>
        )}
      </div>

      {derivedAddress && (
        <div className="rounded-lg border bg-muted/30 p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Derived address</span>
            <Badge variant="secondary">Imported</Badge>
          </div>
          <p className="font-mono text-sm break-all">{derivedAddress}</p>
          <p className="text-xs text-muted-foreground">
            {truncateAddress(derivedAddress, 6)}
          </p>
        </div>
      )}

      <Button
        size="lg"
        className="w-full"
        disabled={!valid}
        onClick={() => setStep("password")}
      >
        Continue
      </Button>
    </div>
  );
}
