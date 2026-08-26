"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { ensureSalaryIncome } from "@/lib/storage/localStorage";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Auto-credit any due monthly salary income once the session is confirmed.
  // Idempotent (per-month ledger), safe to run on every page navigation.
  useEffect(() => {
    if (isAuthenticated) {
      try {
        ensureSalaryIncome();
      } catch (e) {
        console.error("Salary auto-credit failed", e);
      }
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
