"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export default function UserDropdown() {
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

  const u = user as Record<string, string> | null;
  const initial = (u?.fullName ?? "U").charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-sm transition-shadow hover:shadow-md"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-48 overflow-hidden rounded-xl border bg-card py-1 shadow-lg">
          <div className="border-b px-4 py-3">
            <p className="text-sm font-medium">{u?.fullName ?? "User"}</p>
            <p className="text-xs text-muted-foreground">{u?.email ?? ""}</p>
          </div>
          <button
            onClick={() => { router.push("/profile"); setOpen(false); }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            👤 Profile
          </button>
          <button
            onClick={() => { router.push("/profile"); setOpen(false); }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            ⚙️ Settings
          </button>
          <div className="border-t" />
          <button
            onClick={() => { logout(); router.push("/login"); setOpen(false); }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
}
