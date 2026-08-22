"use client";

import { useState } from "react";
import { addStoredBill, updateStoredBill, getAllKnownCategoryNames } from "@/lib/storage/localStorage";
import type { Bill } from "@/lib/types/bill";
import { CURRENCIES } from "@/lib/constants";
import { getPreferredCurrency } from "@/lib/currency";
import { X } from "lucide-react";

interface BillFormProps {
  bill?: Bill | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BillForm({ bill, onClose, onSuccess }: BillFormProps) {
  const [name, setName] = useState(bill?.name || "");
  const [category, setCategory] = useState(bill?.category || "Utilities");
  const [amount, setAmount] = useState(bill?.amount !== undefined ? String(bill.amount) : "");
  const [currency, setCurrency] = useState(bill?.currency || getPreferredCurrency());
  const [dueDate, setDueDate] = useState(bill?.dueDate || new Date().toISOString().split("T")[0]);
  const [repeatMonthly, setRepeatMonthly] = useState(bill?.repeatMonthly ?? true);
  const [reminderEnabled, setReminderEnabled] = useState(bill?.reminderEnabled ?? true);
  const [notes, setNotes] = useState(bill?.notes || "");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a bill name (e.g. Electricity, Water, Rent)");
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid bill amount");
      return;
    }

    try {
      if (bill) {
        updateStoredBill(bill._id, {
          name,
          category,
          amount: numAmount,
          currency,
          dueDate,
          repeatMonthly,
          reminderEnabled,
          notes,
        });
      } else {
        addStoredBill({
          name,
          category,
          amount: numAmount,
          currency,
          dueDate,
          repeatMonthly,
          status: "unpaid",
          reminderEnabled,
          notes,
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save bill");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-lg font-bold text-foreground">{bill ? "Edit Bill" : "Track New Bill"}</h2>
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
              Bill Title
            </label>
            <input
              type="text"
              placeholder="e.g. Internet Subscription, Rent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
              >
                {getAllKnownCategoryNames("expense").map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Amount
              </label>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
          </div>

          <div className="flex items-center gap-4 py-1">
            <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={repeatMonthly}
                onChange={(e) => setRepeatMonthly(e.target.checked)}
                className="rounded-sm border-primary text-primary focus:ring-primary"
              />
              Repeat Monthly
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="rounded-sm border-primary text-primary focus:ring-primary"
              />
              Enable Reminder
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Account number, payment details..."
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
              {bill ? "Save Bill" : "Add Bill"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
