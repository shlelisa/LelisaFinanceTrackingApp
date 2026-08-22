"use client";

import { useState, useEffect } from "react";
import { getStoredDebts, deleteStoredDebt, updateStoredDebt } from "@/lib/storage/localStorage";
import type { Debt } from "@/lib/types/debt";
import DebtForm from "@/components/DebtForm";
import Money from "@/components/Money";
import { useTranslation } from "@/hooks/useTranslation";
import { Plus, HandCoins, Landmark, ArrowUpRight, ArrowDownLeft, Trash2, Edit2, Check } from "lucide-react";

export default function DebtPage() {
  const { t } = useTranslation();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

  const loadDebts = () => {
    setDebts(getStoredDebts());
  };

  useEffect(() => {
    loadDebts();
  }, []);

  const handleDelete = (id: string) => {
    if (confirm(t("debt.delete_confirm"))) {
      deleteStoredDebt(id);
      loadDebts();
    }
  };

  const handleMarkSettled = (debt: Debt) => {
    updateStoredDebt(debt._id, { remainingBalance: 0 });
    loadDebts();
  };

  const totalLent = debts
    .filter((d) => d.type === "lent")
    .reduce((sum, d) => sum + d.remainingBalance, 0);

  const totalBorrowed = debts
    .filter((d) => d.type === "borrowed" || d.type === "loan")
    .reduce((sum, d) => sum + d.remainingBalance, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("debt.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("debt.subtitle")}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingDebt(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
        >
          <Plus className="size-4" />
          {t("debt.add")}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("debt.money_lent")}
            </div>
            <div className="mt-1 text-2xl font-black text-emerald-600">
              <Money amount={totalLent} currency="USD" />
            </div>
          </div>
          <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
            <ArrowUpRight className="size-5" />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("debt.total_owed")}
            </div>
            <div className="mt-1 text-2xl font-black text-amber-600">
              <Money amount={totalBorrowed} currency="USD" />
            </div>
          </div>
          <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
            <ArrowDownLeft className="size-5" />
          </div>
        </div>
      </div>

      {/* Debt Cards List */}
      <div className="grid gap-4 sm:grid-cols-2">
        {debts.map((d) => {
          const isSettled = d.remainingBalance <= 0;
          const isLent = d.type === "lent";

          return (
            <div
              key={d._id}
              className={`rounded-xl border bg-card p-5 shadow-xs transition-all ${
                isSettled ? "opacity-60 bg-muted/30" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex size-10 items-center justify-center rounded-lg ${
                      isLent
                        ? "bg-emerald-500/10 text-emerald-600"
                        : d.type === "loan"
                        ? "bg-blue-500/10 text-blue-600"
                        : "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    {d.type === "loan" ? <Landmark className="size-5" /> : <HandCoins className="size-5" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{d.person}</h3>
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        isLent ? "text-emerald-600" : "text-amber-600"
                      }`}
                    >
                      {d.type === "lent" ? t("debt.type_lent") : d.type === "loan" ? t("debt.type_loan") : t("debt.type_borrowed")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingDebt(d);
                      setIsFormOpen(true);
                    }}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Edit2 className="size-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(d._id)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 border-t pt-3 text-xs">
                <div>
                  <span className="text-muted-foreground">{t("debt.original_total")}</span>
                  <div className="font-semibold text-foreground">
                    <Money amount={d.totalAmount} currency={d.currency} />
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">{t("debt.remaining")}</span>
                  <div className={`font-bold ${isSettled ? "text-muted-foreground" : "text-foreground"}`}>
                    <Money amount={d.remainingBalance} currency={d.currency} />
                  </div>
                </div>
              </div>

              {d.notes && <p className="mt-2 text-xs text-muted-foreground italic">"{d.notes}"</p>}

              {!isSettled && (
                <div className="mt-4 flex justify-end pt-2">
                  <button
                    onClick={() => handleMarkSettled(d)}
                    className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/10"
                  >
                    <Check className="size-3.5" /> {t("debt.mark_settled")}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {debts.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            {t("debt.no_records")}
          </div>
        )}
      </div>

      {isFormOpen && (
        <DebtForm
          debt={editingDebt}
          onClose={() => setIsFormOpen(false)}
          onSuccess={loadDebts}
        />
      )}
    </div>
  );
}
