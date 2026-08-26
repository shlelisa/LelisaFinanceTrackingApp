"use client";

import { useState, useEffect } from "react";
import { getStoredBills, toggleBillPaidStatus, deleteStoredBill } from "@/lib/storage/localStorage";
import type { Bill } from "@/lib/types/bill";
import BillForm from "@/components/BillForm";
import Money from "@/components/Money";
import { useTranslation } from "@/hooks/useTranslation";
import { Plus, CheckCircle2, Circle, Clock, Trash2, Edit2, AlertCircle } from "lucide-react";

export default function BillsPage() {
  const { t } = useTranslation();
  const [bills, setBills] = useState<Bill[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  const loadBills = () => {
    setBills(getStoredBills());
  };

  useEffect(() => {
    loadBills();
  }, []);

  const handleToggleStatus = (id: string) => {
    toggleBillPaidStatus(id);
    loadBills();
  };

  const handleDelete = (id: string) => {
    if (confirm(t("bills.delete_confirm"))) {
      deleteStoredBill(id);
      loadBills();
    }
  };

  const totalUnpaid = bills
    .filter((b) => b.status === "unpaid")
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("bills.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("bills.subtitle")}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingBill(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
        >
          <Plus className="size-4" />
          {t("bills.add")}
        </button>
      </div>

      {/* Summary Card */}
      <div className="rounded-xl border bg-card p-6 shadow-xs flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("bills.total_unpaid")}
          </div>
          <div className="mt-1 text-2xl font-black text-destructive">
            <Money amount={totalUnpaid} />
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-600">
          <AlertCircle className="size-4" />
          <span>{t("bills.pending", { count: bills.filter((b) => b.status === "unpaid").length })}</span>
        </div>
      </div>

      {/* Bills List */}
      <div className="grid gap-3">
        {bills.map((bill) => {
          const isPaid = bill.status === "paid";
          const isOverdue = !isPaid && new Date(bill.dueDate) < new Date();

          return (
            <div
              key={bill._id}
              className={`flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-xs transition-all sm:flex-row sm:items-center sm:justify-between ${
                isPaid ? "opacity-75 border-muted" : isOverdue ? "border-destructive/40 bg-destructive/5" : ""
              }`}
            >
              <div className="flex min-w-0 items-center gap-4">
                <button
                  onClick={() => handleToggleStatus(bill._id)}
                  className="shrink-0 rounded-full transition-transform hover:scale-110"
                >
                  {isPaid ? (
                    <CheckCircle2 className="size-6 text-emerald-500 fill-emerald-500/20" />
                  ) : (
                    <Circle className="size-6 text-muted-foreground hover:text-primary" />
                  )}
                </button>
                <div className="min-w-0">
                  <h3 className={`truncate font-semibold text-foreground ${isPaid ? "line-through text-muted-foreground" : ""}`}>
                    {bill.name}
                  </h3>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="rounded bg-muted px-2 py-0.5 font-medium">{bill.category}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" /> {t("bills.due", { date: bill.dueDate })}
                    </span>
                    {bill.repeatMonthly && (
                      <span className="text-[10px] font-semibold uppercase text-primary">{t("bills.monthly")}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className="text-right">
                  <div className="font-bold text-foreground">
                    <Money amount={bill.amount} currency={bill.currency} />
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase ${
                      isPaid ? "text-emerald-600" : isOverdue ? "text-destructive" : "text-amber-600"
                    }`}
                  >
                    {isPaid ? t("bills.paid") : isOverdue ? t("bills.overdue") : t("bills.unpaid")}
                  </span>
                </div>

                <div className="flex items-center gap-1 border-l pl-2">
                  <button
                    onClick={() => {
                      setEditingBill(bill);
                      setIsFormOpen(true);
                    }}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Edit2 className="size-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(bill._id)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {bills.length === 0 && (
          <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            {t("bills.no_bills")}
          </div>
        )}
      </div>

      {isFormOpen && (
        <BillForm
          bill={editingBill}
          onClose={() => setIsFormOpen(false)}
          onSuccess={loadBills}
        />
      )}
    </div>
  );
}
