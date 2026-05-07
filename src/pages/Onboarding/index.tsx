import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateWallet } from "./CreateWallet";
import { ConfirmSeed } from "./ConfirmSeed";
import { SetPassword } from "./SetPassword";

type Step = "welcome" | "create" | "confirm" | "password";

export default function Onboarding() {
  const [step, setStep] = useState<Step>("welcome");
  const [mnemonic, setMnemonic] = useState("");
  const navigate = useNavigate();

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

  if (step === "password") {
    return (
      <SetPassword
        mnemonic={mnemonic}
        onBack={() => setStep("confirm")}
        onDone={() => navigate("/")}
      />
    );
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
        <Button size="lg" className="w-full" onClick={() => setStep("create")}>
          Create New Wallet
        </Button>
      </div>
    </div>
  );
}
