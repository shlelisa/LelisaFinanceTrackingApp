"use client";

import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "Transactions", href: "/transactions", icon: "💳" },
  { label: "Reports", href: "/reports", icon: "📈" },
  { label: "Budgets", href: "/budgets", icon: "🎯" },
  { label: "Profile", href: "/profile", icon: "👤" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);

  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage || !isAuthenticated) return null;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile hamburger */}
      <button
        className="fixed left-4 top-3 z-50 flex size-9 items-center justify-center rounded-lg border bg-background text-lg md:hidden"
        onClick={() => setOpen(!open)}
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r bg-card transition-transform md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-14 items-center gap-2 border-b px-5">
          <span className="text-xl">💰</span>
          <span
            className="cursor-pointer text-lg font-bold text-primary"
            onClick={() => { router.push("/dashboard"); setOpen(false); }}
          >
            FinanceApp
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 px-3 py-4">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <button
                key={link.href}
                onClick={() => { router.push(link.href); setOpen(false); }}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground font-medium shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className="text-base">{link.icon}</span>
                {link.label}
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
            <span className="text-base">🚪</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
