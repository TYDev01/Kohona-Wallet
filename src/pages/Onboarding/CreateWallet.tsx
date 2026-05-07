import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createMnemonic } from "@/keyring/mnemonic";

interface CreateWalletProps {
  onNext: (mnemonic: string) => void;
}

export function CreateWallet({ onNext }: CreateWalletProps) {
  const [mnemonic, setMnemonic] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setMnemonic(createMnemonic());
  }, []);

  const words = mnemonic.split(" ");

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Your Secret Phrase</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Write down these 12 words in order and keep them somewhere safe. Never share them with anyone.
        </p>
      </div>

      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="flex gap-2 pt-4 pb-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-300">
            Anyone with your secret phrase can access your wallet. Never reveal it online or to anyone.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-2">
        {words.map((word, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm"
          >
            <span className="text-muted-foreground text-xs w-4 text-right">{i + 1}.</span>
            <span className="font-mono font-medium">{word}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => setMnemonic(createMnemonic())}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Regenerate
        </Button>
      </div>

      <div className="flex gap-3 mt-2">
        <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>
          Back
        </Button>
        <Button className="flex-1" onClick={() => onNext(mnemonic)} disabled={!mnemonic}>
          I've written it down
        </Button>
      </div>
    </div>
  );
}
