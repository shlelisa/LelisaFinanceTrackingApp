"use client";

import { useState } from "react";
import { getStoredFavorites, addStoredTransaction, deleteStoredFavorite } from "@/lib/storage/localStorage";
import type { FavoriteExpense } from "@/lib/types/transaction";
import { computeFavoritesStats, type FavoriteStat } from "@/lib/storage/financeLogic";
import { getPreferredCurrency } from "@/lib/currency";
import { useLiveData } from "@/hooks/useLiveData";
import { useTranslation } from "@/hooks/useTranslation";
import Money from "@/components/Money";
import FavoriteForm from "@/components/FavoriteForm";
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown, Star } from "lucide-react";

export default function FavoritesWidget({ onTransactionAdded }: { onTransactionAdded?: () => void }) {
  const { t } = useTranslation();
  const [favorites, setFavorites] = useState<FavoriteExpense[]>([]);
  const [stats, setStats] = useState<Record<string, FavoriteStat>>({});
  const [loggedMsg, setLoggedMsg] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FavoriteExpense | null>(null);
  const [deleting, setDeleting] = useState<FavoriteExpense | null>(null);

  useLiveData(() => {
    setFavorites(getStoredFavorites());
    setStats(computeFavoritesStats());
  }, []);

  const refresh = () => {
    setFavorites(getStoredFavorites());
    setStats(computeFavoritesStats());
    if (onTransactionAdded) onTransactionAdded();
  };

  const handleQuickAdd = (fav: FavoriteExpense) => {
    try {
      addStoredTransaction({
        type: "expense",
        amount: fav.amount,
        currency: fav.currency || getPreferredCurrency(),
        category: fav.category,
        description: `Quick Expense: ${fav.name}`,
        date: new Date().toISOString(),
      });
      setLoggedMsg(t("favorites.logged", { name: fav.name }));
      setTimeout(() => setLoggedMsg(null), 2500);
    } catch (e) {
      console.error("Quick add failed", e);
    }
  };

  const handleConfirmDelete = () => {
    if (!deleting) return;
    try {
      deleteStoredFavorite(deleting._id);
    } catch (e) {
      console.error("Delete failed", e);
    }
    setDeleting(null);
  };

  return (
    <>
      <div className="rounded-xl border bg-card p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-2">
            <Star className="size-4 text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("favorites.title")}
              <span className="ml-1.5 font-medium normal-case tracking-normal text-muted-foreground/70">
                ({t("favorites.subtitle")})
              </span>
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {loggedMsg && (
              <span className="text-xs font-semibold text-emerald-600 animate-in fade-in">
                {loggedMsg}
              </span>
            )}
            <button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="size-3.5" />
              {t("favorites.add_new")}
            </button>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center gap-1 py-6 text-center">
            <p className="text-sm font-medium text-foreground">{t("favorites.empty")}</p>
            <p className="text-xs text-muted-foreground">{t("favorites.empty_hint")}</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {favorites.map((fav) => {
              const stat = stats[fav._id];
              return (
                <div
                  key={fav._id}
                  className="group flex items-center gap-2 rounded-lg border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/5"
                >
                  <button
                    onClick={() => handleQuickAdd(fav)}
                    title={t("favorites.subtitle")}
                    className="flex items-center gap-2"
                  >
                    <span
                      className="flex size-6 items-center justify-center rounded-md text-white"
                      style={{ backgroundColor: fav.color || "#3b82f6" }}
                    >
                      <Plus className="size-3" />
                    </span>
                    <span>{fav.name}</span>
                    <span className="font-bold text-muted-foreground">
                      <Money amount={fav.amount} showConversion={false} />
                    </span>
                    {stat && stat.changePct !== null && (
                      <span
                        className={`flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-bold ${
                          stat.changePct > 0
                            ? "bg-error/10 text-error"
                            : stat.changePct < 0
                              ? "bg-success/10 text-success"
                              : "bg-muted text-muted-foreground"
                        }`}
                        title={t("favorites.vs_last_month")}
                      >
                        {stat.changePct >= 0 ? (
                          <TrendingUp className="size-3" />
                        ) : (
                          <TrendingDown className="size-3" />
                        )}
                        {stat.changePct > 0 ? "+" : ""}
                        {stat.changePct}%
                      </span>
                    )}
                  </button>
                  <span className="flex items-center gap-0.5 opacity-40 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => {
                        setEditing(fav);
                        setFormOpen(true);
                      }}
                      title={t("common.edit")}
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Pencil className="size-3" />
                    </button>
                    <button
                      onClick={() => setDeleting(fav)}
                      title={t("common.delete")}
                      className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {formOpen && (
        <FavoriteForm
          favorite={editing}
          onClose={() => setFormOpen(false)}
          onSuccess={refresh}
        />
      )}

      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95">
            <h2 className="text-base font-bold text-foreground">{t("favorites.delete_title")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("favorites.delete_message", { name: deleting.name })}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setDeleting(null)}
                className="rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white hover:bg-destructive/90"
              >
                {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
