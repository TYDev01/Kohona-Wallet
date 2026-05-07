import { useState, useMemo } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmSeedProps {
  mnemonic: string;
  onNext: () => void;
  onBack: () => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function ConfirmSeed({ mnemonic, onNext, onBack }: ConfirmSeedProps) {
  const words = useMemo(() => mnemonic.split(" "), [mnemonic]);
  const shuffled = useMemo(() => shuffle(words.map((w, i) => ({ word: w, idx: i }))), [words]);
  const [selected, setSelected] = useState<Array<{ word: string; idx: number }>>([]);

  const toggleWord = (item: { word: string; idx: number }) => {
    if (selected.find((s) => s.idx === item.idx)) {
      setSelected((s) => s.filter((x) => x.idx !== item.idx));
    } else {
      setSelected((s) => [...s, item]);
    }
  };

  const isCorrect = selected.length === words.length &&
    selected.every((s, i) => s.idx === i);

  const hasError = selected.length > 0 && !words.slice(0, selected.length).every((w, i) => selected[i]?.word === w);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Confirm Your Phrase</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select the words in the correct order to verify you've saved your seed phrase.
        </p>
      </div>

      <div className="min-h-[80px] flex flex-wrap gap-2 rounded-lg border bg-muted/30 p-3">
        {selected.map((item, i) => {
          const correct = item.word === words[i];
          return (
            <span
              key={item.idx}
              onClick={() => toggleWord(item)}
              className={cn(
                "cursor-pointer inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-sm font-mono font-medium border",
                correct
                  ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/40 dark:border-green-800 dark:text-green-300"
                  : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300"
              )}
            >
              <span className="text-xs opacity-60">{i + 1}.</span>
              {item.word}
            </span>
          );
        })}
        {selected.length === 0 && (
          <span className="text-sm text-muted-foreground self-center">Select words below…</span>
        )}
      </div>

      {isCorrect && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle2 className="h-4 w-4" />
          Perfect! Your seed phrase is correct.
        </div>
      )}
      {hasError && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <XCircle className="h-4 w-4" />
          Wrong order — tap a word to remove it.
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {shuffled.map((item) => {
          const isSelected = selected.some((s) => s.idx === item.idx);
          return (
            <button
              key={item.idx}
              onClick={() => !isSelected && toggleWord(item)}
              disabled={isSelected}
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm font-mono font-medium transition-colors",
                isSelected
                  ? "opacity-30 cursor-not-allowed bg-muted"
                  : "bg-background hover:bg-accent cursor-pointer"
              )}
            >
              {item.word}
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 mt-2">
        <Button variant="outline" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button className="flex-1" disabled={!isCorrect} onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  );
}
