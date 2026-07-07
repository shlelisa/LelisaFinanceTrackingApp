"use client";

import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import UserDropdown from "./UserDropdown";

export default function TopBar() {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage || !isAuthenticated) return null;

  return (
    <div className="flex h-14 items-center justify-end border-b bg-background/80 px-6 backdrop-blur-sm">
      <UserDropdown />
    </div>
  );
}
