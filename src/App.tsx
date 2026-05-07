import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/layout/AppShell";
import Onboarding from "@/pages/Onboarding";
import Unlock from "@/pages/Unlock";
import Dashboard from "@/pages/Dashboard";
import Send from "@/pages/Dashboard/Send";
import Receive from "@/pages/Dashboard/Receive";
import { keyring } from "@/keyring/keyring";
import { useWalletStore } from "@/store/walletStore";
import { QUERY_STALE_TIME } from "@/lib/constants";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIME,
      retry: 1,
    },
  },
});

function AppRoutes() {
  const status = useWalletStore((s) => s.status);
  const setStatus = useWalletStore((s) => s.setStatus);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    keyring.exists().then((exists) => {
      if (!exists) {
        setStatus("uninitialized");
      } else if (keyring.isLocked) {
        setStatus("locked");
      }
      setChecking(false);
    });
  }, [setStatus]);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (status === "uninitialized") {
    return (
      <Routes>
        {/* Onboarding owns /onboarding/* including all import sub-routes */}
        <Route path="/onboarding/*" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  if (status === "locked") {
    return (
      <Routes>
        <Route path="/unlock" element={<Unlock />} />
        {/* Allow import flows even when locked so the user can replace the wallet */}
        <Route path="/onboarding/*" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/unlock" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/send" element={<Send />} />
        <Route path="/receive" element={<Receive />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
        <Toaster position="top-center" richColors />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
