"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import UserDropdown from "./UserDropdown";
import AdminUserSelector from "./AdminUserSelector";
import VoiceTransactionModal from "./VoiceTransactionModal";
import { Menu, Mic } from "lucide-react";

export default function TopBar() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const pathname = usePathname();
  const [voiceOpen, setVoiceOpen] = useState(false);
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage || !isAuthenticated) return null;

  // Formatting route title for mobile topbar
  const routeTitleMap: Record<string, string> = {
    "/dashboard": t("nav.dashboard"),
    "/accounts": t("nav.accounts"),
    "/transactions": t("nav.transactions"),
    "/bills": t("nav.bills"),
    "/debt": t("nav.debt"),
    "/reports": t("nav.reports"),
    "/budgets": t("nav.budgets"),
    "/goals": t("nav.goals"),
    "/categories": t("nav.categories"),
    "/recurring": t("nav.recurring"),
    "/calendar": t("nav.calendar"),
    "/notifications": t("nav.notifications"),
    "/profile": t("nav.profile"),
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
