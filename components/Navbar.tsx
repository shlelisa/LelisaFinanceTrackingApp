"use client";

import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";

const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Transactions", href: "/transactions" },
  { label: "Reports", href: "/reports" },
  { label: "Budgets", href: "/budgets" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage || !isAuthenticated) return null;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <span
            className="cursor-pointer text-lg font-bold text-primary"
            onClick={() => router.push("/dashboard")}
          >
            FinanceApp
          </span>
          <nav className="flex gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => router.push(link.href)}
                className={`cursor-pointer rounded-md px-3 py-1.5 text-sm transition-colors ${
                  pathname === link.href
                    ? "bg-primary-lighter text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/profile")}
            className="flex size-8 items-center justify-center rounded-full bg-primary-lighter text-xs font-bold text-primary"
          >
            L
          </button>
          <button
            onClick={() => router.push("/logout")}
            className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
