import { NavLink } from "react-router-dom";
import { Wallet, Send, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Wallet, label: "Assets" },
  { to: "/send", icon: Send, label: "Send" },
  { to: "/receive", icon: QrCode, label: "Receive" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md border-t bg-background flex items-center justify-around h-16 z-10">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 px-4 py-2 text-xs transition-colors",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )
          }
        >
          <Icon className="h-5 w-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
