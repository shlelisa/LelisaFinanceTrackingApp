"use client";

import { useState, useEffect } from "react";
import { getStoredFavorites, addStoredTransaction } from "@/lib/storage/localStorage";
import type { FavoriteExpense } from "@/lib/types/transaction";
import Money from "@/components/Money";
import { Coffee, Car, Utensils, Zap, Plus } from "lucide-react";

export default function FavoritesWidget({ onTransactionAdded }: { onTransactionAdded?: () => void }) {
  const [favorites, setFavorites] = useState<FavoriteExpense[]>([]);
  const [loggedMsg, setLoggedMsg] = useState<string | null>(null);

  useEffect(() => {
    setFavorites(getStoredFavorites());
  }, []);

  const handleQuickAdd = (fav: FavoriteExpense) => {
    try {
      addStoredTransaction({
        type: "expense",
        amount: fav.amount,
        category: fav.category,
        description: `Quick Expense: ${fav.name}`,
        date: new Date().toISOString(),
      });
      setLoggedMsg(`Logged ${fav.name}!`);
      setTimeout(() => setLoggedMsg(null), 2500);
      if (onTransactionAdded) onTransactionAdded();
    } catch (e) {
      console.error("Quick add failed", e);
    }
  };

  if (favorites.length === 0) return null;

  return (
    <div className="rounded-xl border bg-card p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Favorites (1-Tap Quick Add)
        </h3>
        {loggedMsg && (
          <span className="text-xs font-semibold text-emerald-600 animate-in fade-in">
            {loggedMsg}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {favorites.map((fav) => (
          <button
            key={fav._id}
            onClick={() => handleQuickAdd(fav)}
            className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-primary/10 hover:border-primary"
          >
            <div
              className="flex size-6 items-center justify-center rounded-md text-white text-[10px]"
              style={{ backgroundColor: fav.color || "#3b82f6" }}
            >
              <Plus className="size-3" />
            </div>
            <span>{fav.name}</span>
            <span className="font-bold text-muted-foreground">
              <Money amount={fav.amount} currency="USD" />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
