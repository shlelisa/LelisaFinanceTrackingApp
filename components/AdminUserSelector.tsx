"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getRegisteredUsersList, getAdminTargetUserId, setAdminTargetUserId } from "@/lib/storage/localStorage";
import type { User } from "@/lib/types/api";
import { Users, Check, ChevronDown, ShieldCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminUserSelector() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("all");
  const [openMenu, setOpenMenu] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === "admin" || user?.email === "admin@gmail.com";

  useEffect(() => {
    if (!isAdmin) return;
    setUsers(getRegisteredUsersList());
    setSelectedUserId(getAdminTargetUserId());

    const handleFilterChange = () => {
      setSelectedUserId(getAdminTargetUserId());
      queryClient.invalidateQueries();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpenMenu(false);
      }
    };

    window.addEventListener("admin-user-filter-changed", handleFilterChange);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("admin-user-filter-changed", handleFilterChange);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAdmin, queryClient]);

  if (!isAdmin) return null;

  const handleSelectUser = (id: string) => {
    setSelectedUserId(id);
    setAdminTargetUserId(id);
    setOpenMenu(false);
    queryClient.invalidateQueries();
  };

  const selectedUserObj = users.find((u) => u.id === selectedUserId);
  const selectedLabel = selectedUserId === "all"
    ? "All Users"
    : selectedUserObj?.fullName || "Selected User";

  return (
    <div ref={ref} className="relative">
      
      {/* Trigger Button - Fully responsive */}
      <button
        onClick={() => setOpenMenu(!openMenu)}
        className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 transition-all hover:bg-amber-500/20 active:scale-95 shadow-xs"
        aria-label="Filter Data By User"
      >
        <Users className="size-4 shrink-0 text-amber-500" />
        
        {/* Label visible on all screens, compact on mobile */}
        <span className="max-w-[80px] xs:max-w-[120px] sm:max-w-[180px] truncate text-left">
          <span className="hidden md:inline text-muted-foreground mr-1">User:</span>
          {selectedLabel}
        </span>
        
        <ChevronDown className={`size-3.5 transition-transform duration-200 ${openMenu ? "rotate-180" : ""}`} />
      </button>

      {/* Touch-friendly Responsive Dropdown Menu */}
      {openMenu && (
        <div className="absolute right-0 top-11 z-50 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-xl backdrop-blur-md animate-in fade-in-0 zoom-in-95">
          <div className="border-b px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <ShieldCheck className="size-3.5" /> Admin User Scope
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Select a registered user to view their specific financial records.
            </p>
          </div>

          <div className="max-h-60 overflow-y-auto py-1 space-y-0.5">
            {/* Option: All Users */}
            <button
              onClick={() => handleSelectUser("all")}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                selectedUserId === "all"
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-sm">🌐</span>
                <div className="text-left truncate">
                  <p className="font-semibold truncate">All Users (Combined)</p>
                  <p className="text-[10px] text-muted-foreground truncate">View records from all registered users</p>
                </div>
              </div>
              {selectedUserId === "all" && <Check className="size-4 shrink-0 text-amber-500" />}
            </button>

            {/* List of Registered Users */}
            {users.map((u) => {
              const isSelected = selectedUserId === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => handleSelectUser(u.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                    isSelected
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                      {u.fullName.charAt(0).toUpperCase()}
                    </span>
                    <div className="text-left truncate">
                      <p className="font-semibold truncate">{u.fullName}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                    </div>
                  </div>
                  {isSelected && <Check className="size-4 shrink-0 text-amber-500" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
