import { useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, FileJson, AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const methods = [
  {
    to: "/onboarding/import/seed-phrase",
    icon: AlignLeft,
    title: "Seed Phrase",
    description: "Import using a 12 or 24 word recovery phrase",
  },
  {
    to: "/onboarding/import/private-key",
    icon: KeyRound,
    title: "Private Key",
    description: "Import using a 0x-prefixed hex private key",
  },
  {
    to: "/onboarding/import/keystore",
    icon: FileJson,
    title: "Keystore File",
    description: "Import using an encrypted JSON keystore file",
  },
];

export default function ImportChoice() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate("/onboarding")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Import Wallet</h1>
          <p className="text-sm text-muted-foreground">Choose how you'd like to import</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {methods.map(({ to, icon: Icon, title, description }) => (
          <Card
            key={to}
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => navigate(to)}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">{title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180 flex-shrink-0" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
