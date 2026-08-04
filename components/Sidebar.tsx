"use client";

import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getNotifications } from "@/lib/notifications";
import {
  LayoutDashboard,
  CreditCard,
  BarChart3,
  Target,
  User,
  LogOut,
  Menu,
  Trophy,
  RefreshCw,
  Bell,
  CalendarDays,
} from "lucide-react";

const navItems = [
  { key: "nav.dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "nav.transactions", href: "/transactions", icon: CreditCard },
  { key: "nav.reports", href: "/reports", icon: BarChart3 },
  { key: "nav.budgets", href: "/budgets", icon: Target },
  { key: "nav.goals", href: "/goals", icon: Trophy },
  { key: "nav.recurring", href: "/recurring", icon: RefreshCw },
  { key: "nav.calendar", href: "/calendar", icon: CalendarDays },
  { key: "nav.notifications", href: "/notifications", icon: Bell },
  { key: "nav.profile", href: "/profile", icon: User },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setUnreadCount(getNotifications().filter((n) => !n.read).length);
    const interval = setInterval(() => {
      setUnreadCount(getNotifications().filter((n) => !n.read).length);
    }, 5000);

    const handleToggle = () => setOpen((prev) => !prev);
    window.addEventListener("toggle-mobile-sidebar", handleToggle);

    return () => {
      clearInterval(interval);
      window.removeEventListener("toggle-mobile-sidebar", handleToggle);
    };
  }, []);

  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage || !isAuthenticated) return null;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r bg-card transition-transform md:static md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Logo */}
        <div className="flex h-14 items-center gap-2.5 border-b px-5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-light font-black text-white text-sm shadow-sm">
            L
          </div>
          <span
            className="cursor-pointer text-lg font-bold text-primary"
            onClick={() => {
              router.push("/dashboard");
              setOpen(false);
            }}
          >
            {t("app.name")}
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 px-3 py-4">
          {navItems.map((link) => {
            const active = pathname === link.href;
            return (
              <button
                key={link.href}
                onClick={() => {
                  router.push(link.href);
                  setOpen(false);
                }}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${active
                    ? "bg-primary text-primary-foreground font-medium shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
              >
                <link.icon className="size-4" />
                <span className="flex-1 text-left">{t(link.key)}</span>
                {link.href === "/notifications" && unreadCount > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom section */}
        <div className="border-t px-3 py-4">
          <button
            onClick={() => router.push("/logout")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="size-4" />
            {t("nav.logout")}
          </button>
        </div>
      </aside>
    </>
  );
}
