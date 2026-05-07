import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { privateKeyToAddress } from "viem/accounts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SetPassword } from "../SetPassword";
import { isValidMnemonic } from "@/keyring/mnemonic";
import { derivePrivateKey } from "@/keyring/derive";
import { keyring } from "@/keyring/keyring";
import { getPublicClient } from "@/chains/evm/client";
import { useNetworkStore } from "@/store/networkStore";
import { truncateAddress, formatEther } from "@/lib/format";
import { cn } from "@/lib/utils";

interface DerivedAccount {
  index: number;
  address: `0x${string}`;
  balance: bigint | null;
  balanceLoading: boolean;
  balanceError: boolean;
}

type Step = "enter" | "select" | "password";

const PAGE_SIZE = 5;

export default function SeedPhraseImport() {
  const navigate = useNavigate();
  const chainId = useNetworkStore((s) => s.currentChainId);

  const [step, setStep] = useState<Step>("enter");
  const [phrase, setPhrase] = useState("");
  const [accounts, setAccounts] = useState<DerivedAccount[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingFirst, setLoadingFirst] = useState(false);

  const phraseValid = isValidMnemonic(phrase.trim());

  // ── Derive + fetch balances for a batch of indices ──────────────────────────
  const deriveAndFetch = useCallback(
    async (indices: number[]): Promise<DerivedAccount[]> => {
      const client = getPublicClient(chainId);
      const derived = indices.map((index) => {
        const pk = derivePrivateKey(phrase.trim(), index);
        return { index, address: privateKeyToAddress(pk) };
      });

      const placeholders: DerivedAccount[] = derived.map(({ index, address }) => ({
        index,
        address,
        balance: null,
        balanceLoading: true,
        balanceError: false,
      }));

      // Fetch balances without blocking display
      const results = await Promise.allSettled(
        derived.map(({ address }) => client.getBalance({ address }))
      );

      return placeholders.map((acct, i) => {
        const result = results[i];
        if (result.status === "fulfilled") {
          return { ...acct, balance: result.value, balanceLoading: false };
        }
        return { ...acct, balanceLoading: false, balanceError: true };
      });
    },
    [phrase, chainId]
  );

  const handleContinue = async () => {
    setLoadingFirst(true);
    const batch = await deriveAndFetch(Array.from({ length: PAGE_SIZE }, (_, i) => i));
    setAccounts(batch);
    // Auto-select index 0
    setSelected(new Set([0]));
    setLoadingFirst(false);
    setStep("select");
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const nextStart = accounts.length;
    const indices = Array.from({ length: PAGE_SIZE }, (_, i) => nextStart + i);
    const batch = await deriveAndFetch(indices);
    setAccounts((prev) => [...prev, ...batch]);
    setLoadingMore(false);
  };

  const toggleSelect = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // ── Step: enter phrase ───────────────────────────────────────────────────────
  if (step === "enter") {
    return (
      <div className="flex flex-col gap-6 p-6 min-h-screen">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/onboarding/import")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Seed Phrase</h1>
            <p className="text-sm text-muted-foreground">Enter your recovery phrase</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <textarea
            className={cn(
              "w-full min-h-[120px] rounded-md border bg-background px-3 py-2 text-sm font-mono resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground",
              phrase && !phraseValid && "border-destructive"
            )}
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder="Enter your 12 or 24 word seed phrase, separated by spaces…"
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
          />
          {phrase && !phraseValid && (
            <p className="text-xs text-destructive">
              Invalid seed phrase — check word count and spelling.
            </p>
          )}
          {phrase && phraseValid && (
            <p className="text-xs text-green-600">Valid seed phrase ✓</p>
          )}
        </div>

        <Button
          size="lg"
          className="w-full"
          disabled={!phraseValid || loadingFirst}
          onClick={handleContinue}
        >
          {loadingFirst ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deriving accounts…
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    );
  }

  // ── Step: select accounts ────────────────────────────────────────────────────
  if (step === "select") {
    return (
      <div className="flex flex-col gap-4 p-6 min-h-screen">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setStep("enter")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Select Accounts</h1>
            <p className="text-sm text-muted-foreground">
              Choose which accounts to import
            </p>
          </div>
        </div>

        <div className="rounded-lg border overflow-hidden">
          {accounts.map((acct, i) => (
            <div key={acct.index}>
              {i > 0 && <Separator />}
              <button
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50",
                  selected.has(acct.index) && "bg-accent/30"
                )}
                onClick={() => toggleSelect(acct.index)}
              >
                {/* Checkbox */}
                <div
                  className={cn(
                    "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors",
                    selected.has(acct.index)
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-input bg-background"
                  )}
                >
                  {selected.has(acct.index) && (
                    <svg viewBox="0 0 12 12" className="h-3 w-3 fill-current">
                      <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Account {acct.index + 1}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {truncateAddress(acct.address)}
                  </p>
                </div>

                {/* Balance */}
                <div className="text-right text-sm flex-shrink-0">
                  {acct.balanceLoading ? (
                    <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                  ) : acct.balanceError ? (
                    <span className="text-xs text-muted-foreground">Unavailable</span>
                  ) : (
                    <span className="font-medium tabular-nums">
                      {formatEther(acct.balance!)}
                    </span>
                  )}
                </div>
              </button>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          className="w-full"
          disabled={loadingMore}
          onClick={handleLoadMore}
        >
          {loadingMore ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading…
            </>
          ) : (
            `Load more (${accounts.length}–${accounts.length + PAGE_SIZE - 1})`
          )}
        </Button>

        <Button
          size="lg"
          className="w-full"
          disabled={selected.size === 0}
          onClick={() => setStep("password")}
        >
          Import {selected.size > 0 ? `${selected.size} account${selected.size > 1 ? "s" : ""}` : ""}
        </Button>
      </div>
    );
  }

  // ── Step: set password ───────────────────────────────────────────────────────
  return (
    <SetPassword
      onCreate={(password) =>
        keyring.importFromMnemonic(phrase.trim(), Array.from(selected).sort((a, b) => a - b), password)
      }
      onBack={() => setStep("select")}
      onDone={() => navigate("/")}
    />
  );
}
