import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { NetworkBadge } from "@/components/wallet/NetworkBadge";
import { AccountAvatar } from "@/components/wallet/AccountAvatar";
import { AddressDisplay } from "@/components/wallet/AddressDisplay";
import { useWallet } from "@/hooks/useWallet";

export function AppShell() {
  const { currentAddress } = useWallet();

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background">
      <header className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          {currentAddress && (
            <>
              <AccountAvatar address={currentAddress} size={32} />
              <AddressDisplay address={currentAddress} chars={4} showCopy={false} />
            </>
          )}
        </div>
        <NetworkBadge />
      </header>

      <main className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
