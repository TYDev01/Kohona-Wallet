import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SetPassword } from "../SetPassword";
import { keyring } from "@/keyring/keyring";
import { cn } from "@/lib/utils";

type Step = "upload" | "password";

export default function KeystoreImport() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [keystoreJson, setKeystoreJson] = useState("");
  const [fileName, setFileName] = useState("");
  const [keystorePassword, setKeystorePassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      setKeystoreJson((ev.target?.result as string) ?? "");
    };
    reader.readAsText(file);
  };

  const handleVerify = async () => {
    if (!keystoreJson || !keystorePassword) return;
    setVerifying(true);
    setError("");
    try {
      const { Wallet } = await import("@ethereumjs/wallet");
      await Wallet.fromV3(keystoreJson, keystorePassword);
      setStep("password");
    } catch {
      setError("Incorrect password or invalid keystore file.");
    } finally {
      setVerifying(false);
    }
  };

  const canVerify = keystoreJson.length > 0 && keystorePassword.length > 0;

  if (step === "password") {
    return (
      <SetPassword
        onCreate={(encPassword) =>
          keyring.importFromKeystore(keystoreJson, keystorePassword, encPassword)
        }
        onBack={() => setStep("upload")}
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
          <h1 className="text-2xl font-bold">Keystore File</h1>
          <p className="text-sm text-muted-foreground">Import using a JSON keystore (V3)</p>
        </div>
      </div>

      {/* File upload */}
      <div className="flex flex-col gap-2">
        <Label>Keystore File (.json)</Label>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-sm transition-colors hover:bg-accent/30",
            keystoreJson ? "border-primary/40 bg-primary/5" : "border-border"
          )}
        >
          <Upload className="h-6 w-6 text-muted-foreground" />
          {fileName ? (
            <span className="font-medium text-primary">{fileName}</span>
          ) : (
            <span className="text-muted-foreground">Click to select a .json keystore file</span>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {/* Keystore password */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="ksPw">Keystore Password</Label>
        <div className="relative">
          <Input
            id="ksPw"
            type={showPw ? "text" : "password"}
            value={keystorePassword}
            onChange={(e) => {
              setKeystorePassword(e.target.value);
              setError("");
            }}
            placeholder="Password used to encrypt the keystore"
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
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <Button
        size="lg"
        className="w-full"
        disabled={!canVerify || verifying}
        onClick={handleVerify}
      >
        {verifying ? "Verifying…" : "Unlock Keystore"}
      </Button>
    </div>
  );
}
