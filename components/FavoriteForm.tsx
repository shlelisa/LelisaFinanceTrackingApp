"use client";

import { useMemo, useState } from "react";
import {
  addStoredFavorite,
  updateStoredFavorite,
  getAllKnownCategoryNames,
} from "@/lib/storage/localStorage";
import type { FavoriteExpense } from "@/lib/types/transaction";
import { CURRENCIES } from "@/lib/constants";
import { useAppCurrency } from "@/hooks/useAppCurrency";
import { X } from "lucide-react";

const CHIP_COLORS = [
  "#f59e0b",
  "#3b82f6",
  "#10b981",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
];

function pickColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return CHIP_COLORS[Math.abs(hash) % CHIP_COLORS.length];
}

const NEW_CATEGORY = "__new__";

interface FavoriteFormProps {
  favorite?: FavoriteExpense | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FavoriteForm({ favorite, onClose, onSuccess }: FavoriteFormProps) {
  const { currency: appCurrency } = useAppCurrency();
  const [name, setName] = useState(favorite?.name || "");
  const [amount, setAmount] = useState(
    favorite?.amount !== undefined ? String(favorite.amount) : "",
  );
  const [currency, setCurrency] = useState(favorite?.currency || appCurrency);
  const [category, setCategory] = useState(favorite?.category || "");
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState("");

  const categoryOptions = useMemo(
    () => getAllKnownCategoryNames("expense").sort((a, b) => a.localeCompare(b)),
    [],
  );

  const effectiveCategory = isNewCategory ? newCategory.trim() : category;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a name for this favorite.");
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || !Number.isFinite(numAmount)) {
      setError("Please enter a valid amount greater than zero.");
      return;
    }
    if (!effectiveCategory) {
      setError("Please select or create a category.");
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        amount: numAmount,
        currency,
        category: effectiveCategory,
        color: favorite?.color || pickColor(name.trim()),
      };
      if (favorite) {
        updateStoredFavorite(favorite._id, payload);
      } else {
        addStoredFavorite(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save favorite");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-lg font-bold text-foreground">
            {favorite ? "Edit Favorite" : "Add New Favorite"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
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
              Name
            </label>
            <input
              type="text"
              placeholder="e.g. Coffee, Taxi Ride"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Category
            </label>
            {!isNewCategory ? (
              <select
                value={category}
                onChange={(e) => {
                  if (e.target.value === NEW_CATEGORY) {
                    setIsNewCategory(true);
                  } else {
                    setCategory(e.target.value);
                  }
                }}
                className={`w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary ${!category && error ? "border-destructive" : ""}`}
              >
                <option value="" disabled>
                  Select a category…
                </option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value={NEW_CATEGORY}>+ Create new category…</option>
              </select>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New category name"
                  autoFocus
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsNewCategory(false);
                    setNewCategory("");
                  }}
                  className="shrink-0 rounded-lg border px-3 text-xs font-medium text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Amount
              </label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
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
              {favorite ? "Save Changes" : "Add Favorite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
