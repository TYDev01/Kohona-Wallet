import { useState } from "react";
import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { NetworkBadge } from "@/components/wallet/NetworkBadge";
import { AccountAvatar } from "@/components/wallet/AccountAvatar";
import { AddressDisplay } from "@/components/wallet/AddressDisplay";
import { AccountDetails } from "@/components/wallet/AccountDetails";
import { useWallet } from "@/hooks/useWallet";

export function AppShell() {
  const { currentAddress, accounts } = useWallet();
  const [detailsOpen, setDetailsOpen] = useState(false);

  const currentAccount = accounts.find((a) => a.address === currentAddress);

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background">
      <header className="flex items-center justify-between px-4 py-3 border-b">
        <button
          className="flex items-center gap-2 rounded-md px-1 py-0.5 hover:bg-accent/50 transition-colors"
          onClick={() => setDetailsOpen(true)}
          disabled={!currentAddress}
          title="Account details"
        >
          {currentAddress && (
            <>
              <AccountAvatar address={currentAddress} size={32} />
              <AddressDisplay address={currentAddress} chars={4} showCopy={false} />
            </>
          )}
        </button>
        <NetworkBadge />
      </header>

      <main className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </main>

      <BottomNav />

      {currentAccount && (
        <AccountDetails
          account={currentAccount}
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
        />
      )}
    </div>
  );
}
