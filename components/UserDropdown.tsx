"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { User, LogOut, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Badge } from "@/components/ui/badge";

export default function UserDropdown() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fullName = user?.fullName ?? t("user.guest");
  const email = user?.email ?? "";
  const isAdmin = user?.role === "admin" || email === "admin@gmail.com";
  const initial = fullName.charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex size-9 items-center justify-center rounded-full text-sm font-bold shadow-sm transition-all hover:shadow-md ${
          isAdmin
            ? "bg-gradient-to-br from-amber-500 to-amber-600 text-white ring-2 ring-amber-500/30"
            : "bg-primary text-primary-foreground"
        }`}
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-52 overflow-hidden rounded-xl border bg-card py-1 shadow-lg">
          <div className="border-b px-4 py-3">
            <div className="flex items-center justify-between gap-1">
              <p className="text-sm font-medium text-foreground truncate">{fullName}</p>
              {isAdmin && (
                <Badge variant="outline" className="border-amber-500/50 bg-amber-500/10 text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 gap-1 px-1.5 py-0">
                  <ShieldCheck className="size-3" /> Admin
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
          </div>
          <button
            onClick={() => { router.push("/profile"); setOpen(false); }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <User className="size-4" /> {t("user.profile")}
          </button>
          <div className="border-t" />
          <button
            onClick={() => { logout(); router.push("/login"); setOpen(false); }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground text-error hover:bg-error/10"
          >
            <LogOut className="size-4" /> {t("user.logout")}
          </button>
        </div>
      )}
    </div>
  );
}
