"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import UserDropdown from "./UserDropdown";
import AdminUserSelector from "./AdminUserSelector";
import VoiceTransactionModal from "./VoiceTransactionModal";
import { Menu, Mic, Sparkles } from "lucide-react";

export default function TopBar() {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [voiceOpen, setVoiceOpen] = useState(false);
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage || !isAuthenticated) return null;

  // Formatting route title for mobile topbar
  const routeTitleMap: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/accounts": "Accounts",
    "/transactions": "Transactions",
    "/bills": "Bills & Subscriptions",
    "/debt": "Debt & Loans",
    "/reports": "Reports",
    "/budgets": "Budgets",
    "/goals": "Savings Goals",
    "/categories": "Categories",
    "/recurring": "Recurring Items",
    "/calendar": "Calendar",
    "/notifications": "Notifications",
    "/profile": "Profile & Settings",
  };

  const title = routeTitleMap[pathname] || "LelisaFin";

  const handleMobileSidebarToggle = () => {
    window.dispatchEvent(new Event("toggle-mobile-sidebar"));
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/80 px-4 sm:px-6 backdrop-blur-md transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={handleMobileSidebarToggle}
            className="flex size-9 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
            aria-label="Toggle Navigation Sidebar"
          >
            <Menu className="size-5" />
          </button>
          <span className="text-base font-bold text-foreground md:hidden">{title}</span>
          <span className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground md:block">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Voice AI Button */}
          <button
            onClick={() => setVoiceOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border bg-primary/10 px-2.5 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary/20"
            title="Speak Natural Voice Command"
          >
            <Mic className="size-3.5" />
            <span className="hidden sm:inline">Voice AI</span>
          </button>

          <AdminUserSelector />
          <UserDropdown />
        </div>
      </header>

      <VoiceTransactionModal open={voiceOpen} onClose={() => setVoiceOpen(false)} />
    </>
  );
}
