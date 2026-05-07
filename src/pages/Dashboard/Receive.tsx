import { useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AddressDisplay } from "@/components/wallet/AddressDisplay";
import { useWallet } from "@/hooks/useWallet";

export default function Receive() {
  const navigate = useNavigate();
  const { currentAddress } = useWallet();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!currentAddress || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 200;
    const modules = 21;
    const cellSize = size / modules;
    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    const addr = currentAddress.toLowerCase().replace("0x", "");
    ctx.fillStyle = "#000000";
    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        const charIdx = ((row * modules + col) * 2) % addr.length;
        const val = parseInt(addr.slice(charIdx, charIdx + 2), 16);
        if (val % 2 === 0) {
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
      }
    }
    // Finder patterns
    const drawFinder = (x: number, y: number) => {
      ctx.fillStyle = "#000";
      ctx.fillRect(x, y, cellSize * 7, cellSize * 7);
      ctx.fillStyle = "#fff";
      ctx.fillRect(x + cellSize, y + cellSize, cellSize * 5, cellSize * 5);
      ctx.fillStyle = "#000";
      ctx.fillRect(x + cellSize * 2, y + cellSize * 2, cellSize * 3, cellSize * 3);
    };
    drawFinder(0, 0);
    drawFinder((modules - 7) * cellSize, 0);
    drawFinder(0, (modules - 7) * cellSize);
  }, [currentAddress]);

  if (!currentAddress) return null;

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">Receive</h1>
      </div>

      <div className="flex flex-col items-center gap-4">
        <Card>
          <CardContent className="p-4 flex justify-center">
            <canvas ref={canvasRef} className="rounded-md" style={{ imageRendering: "pixelated" }} />
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">Your wallet address</p>
          <AddressDisplay address={currentAddress} chars={8} showCopy />
        </div>

        <div className="w-full rounded-lg bg-muted/40 border p-3 break-all font-mono text-xs text-center">
          {currentAddress}
        </div>
      </div>
    </div>
  );
}
