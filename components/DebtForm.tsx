"use client";

import { useState } from "react";
import { addStoredDebt, updateStoredDebt } from "@/lib/storage/localStorage";
import type { Debt, DebtType } from "@/lib/types/debt";
import { CURRENCIES } from "@/lib/constants";
import { X } from "lucide-react";

interface DebtFormProps {
  debt?: Debt | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DebtForm({ debt, onClose, onSuccess }: DebtFormProps) {
  const [type, setType] = useState<DebtType>(debt?.type || "lent");
  const [person, setPerson] = useState(debt?.person || "");
  const [totalAmount, setTotalAmount] = useState(debt?.totalAmount !== undefined ? String(debt.totalAmount) : "");
  const [remainingBalance, setRemainingBalance] = useState(
    debt?.remainingBalance !== undefined ? String(debt.remainingBalance) : ""
  );
  const [currency, setCurrency] = useState(debt?.currency || "USD");
  const [interestRate, setInterestRate] = useState(debt?.interestRate !== undefined ? String(debt.interestRate) : "");
  const [dueDate, setDueDate] = useState(debt?.dueDate || "");
  const [notes, setNotes] = useState(debt?.notes || "");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!person.trim()) {
      setError("Please specify the person or institution name");
      return;
    }
    const numTotal = parseFloat(totalAmount);
    if (isNaN(numTotal) || numTotal <= 0) {
      setError("Please enter a valid total amount");
      return;
    }
    const numRemaining = remainingBalance ? parseFloat(remainingBalance) : numTotal;

    try {
      if (debt) {
        updateStoredDebt(debt._id, {
          type,
          person,
          totalAmount: numTotal,
          remainingBalance: numRemaining,
          currency,
          interestRate: interestRate ? parseFloat(interestRate) : undefined,
          dueDate: dueDate || undefined,
          notes,
        });
      } else {
        addStoredDebt({
          type,
          person,
          totalAmount: numTotal,
          remainingBalance: numRemaining,
          currency,
          interestRate: interestRate ? parseFloat(interestRate) : undefined,
          dueDate: dueDate || undefined,
          notes,
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save debt record");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-lg font-bold text-foreground">
            {debt ? "Edit Record" : "Add Money Borrowed / Lent / Loan"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Record Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType("lent")}
                className={`rounded-lg border py-2 text-xs font-semibold transition-colors ${
                  type === "lent"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                Money Lent
              </button>
              <button
                type="button"
                onClick={() => setType("borrowed")}
                className={`rounded-lg border py-2 text-xs font-semibold transition-colors ${
                  type === "borrowed"
                    ? "border-amber-500 bg-amber-500/10 text-amber-600"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                Borrowed
              </button>
              <button
                type="button"
                onClick={() => setType("loan")}
                className={`rounded-lg border py-2 text-xs font-semibold transition-colors ${
                  type === "loan"
                    ? "border-blue-500 bg-blue-500/10 text-blue-600"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                Bank Loan
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Person / Entity Name
            </label>
            <input
              type="text"
              placeholder="e.g. John Doe, Bank of Abyssinia"
              value={person}
              onChange={(e) => setPerson(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Total Amount
              </label>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Remaining Balance
              </label>
              <input
                type="number"
                step="any"
                placeholder="Same as total"
                value={remainingBalance}
                onChange={(e) => setRemainingBalance(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Interest %
              </label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 5"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Notes / Purpose
            </label>
            <textarea
              rows={2}
              placeholder="Reason, agreement terms..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {debt ? "Update Record" : "Create Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
