import { useState } from "react";
import { useNavigate, Routes, Route, Navigate } from "react-router-dom";
import { Wallet, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateWallet } from "./CreateWallet";
import { ConfirmSeed } from "./ConfirmSeed";
import { SetPassword } from "./SetPassword";
import ImportChoice from "./Import";
import SeedPhraseImport from "./Import/SeedPhrase";
import PrivateKeyImport from "./Import/PrivateKey";
import KeystoreImport from "./Import/Keystore";

// ─── Create-wallet sub-flow (step state, no sub-routes) ─────────────────────

type CreateStep = "create" | "confirm" | "password";

function CreateFlow({ onDone }: { onDone: () => void }) {
  const navigate = useNavigate();
  const [step, setStep] = useState<CreateStep>("create");
  const [mnemonic, setMnemonic] = useState("");

  if (step === "create") {
    return (
      <CreateWallet
        onNext={(m) => {
          setMnemonic(m);
          setStep("confirm");
        }}
      />
    );
  }
  if (step === "confirm") {
    return (
      <ConfirmSeed
        mnemonic={mnemonic}
        onNext={() => setStep("password")}
        onBack={() => setStep("create")}
      />
    );
  }
  return (
    <SetPassword
      mnemonic={mnemonic}
      onBack={() => setStep("confirm")}
      onDone={onDone}
    />
  );
}

// ─── Landing page ────────────────────────────────────────────────────────────

function OnboardingLanding() {
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);

  if (showCreate) {
    return <CreateFlow onDone={() => navigate("/")} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-2xl bg-primary p-4">
          <Wallet className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold">Konoha</h1>
        <p className="text-muted-foreground max-w-xs">
          A secure, non-custodial wallet for Ethereum and EVM-compatible networks.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button size="lg" className="w-full" onClick={() => setShowCreate(true)}>
          Create New Wallet
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="w-full gap-2"
          onClick={() => navigate("/onboarding/import")}
        >
          <Download className="h-4 w-4" />
          Import Existing Wallet
        </Button>
      </div>
    </div>
  );
}

// ─── Root export: handles /onboarding/* sub-routes ───────────────────────────

export default function Onboarding() {
  return (
    <Routes>
      <Route index element={<OnboardingLanding />} />
      <Route path="import" element={<ImportChoice />} />
      <Route path="import/seed-phrase" element={<SeedPhraseImport />} />
      <Route path="import/private-key" element={<PrivateKeyImport />} />
      <Route path="import/keystore" element={<KeystoreImport />} />
      <Route path="*" element={<Navigate to="/onboarding" replace />} />
    </Routes>
  );
}
