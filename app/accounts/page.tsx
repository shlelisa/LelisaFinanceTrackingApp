"use client";

import { useState, useEffect } from "react";
import { getStoredAccounts, deleteStoredAccount } from "@/lib/storage/localStorage";
import type { Account } from "@/lib/types/account";
import AccountForm from "@/components/AccountForm";
import Money from "@/components/Money";
import { useTranslation } from "@/hooks/useTranslation";
import { Plus, Wallet, Building2, CreditCard, Smartphone, Trash2, Edit2 } from "lucide-react";

export default function AccountsPage() {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const loadAccounts = () => {
    setAccounts(getStoredAccounts());
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleDelete = (id: string) => {
    if (confirm(t("accounts.delete_confirm"))) {
      deleteStoredAccount(id);
      loadAccounts();
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "bank":
        return Building2;
      case "credit_card":
        return CreditCard;
      case "mobile_money":
        return Smartphone;
      default:
        return Wallet;
    }
  };

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("accounts.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("accounts.subtitle")}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingAccount(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
        >
          <Plus className="size-4" />
          {t("accounts.add")}
        </button>
      </div>

      {/* Net Worth Summary */}
      <div className="rounded-xl border bg-card p-6 shadow-xs">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("accounts.net_worth")}
        </div>
        <div className="mt-2 text-3xl font-black tracking-tight text-foreground">
          <Money amount={totalBalance} />
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.map((acc) => {
          const IconComp = getAccountIcon(acc.type);
          return (
            <div
              key={acc._id}
              className="relative overflow-hidden rounded-xl border bg-card p-5 shadow-xs transition-all hover:shadow-md"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: acc.color || "#3b82f6" }}
              />
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex size-10 items-center justify-center rounded-lg text-white shadow-xs"
                    style={{ backgroundColor: acc.color || "#3b82f6" }}
                  >
                    <IconComp className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{acc.name}</h3>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {acc.type.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingAccount(acc);
                      setIsFormOpen(true);
                    }}
                    className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Edit2 className="size-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(acc._id)}
                    className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              <div className="mt-6 border-t pt-3">
                <div className="text-xs text-muted-foreground">{t("accounts.current_balance")}</div>
                <div className="text-xl font-bold text-foreground">
                  <Money amount={acc.balance} currency={acc.currency} />
                </div>
              </div>
            </div>
          );
        })}

        {accounts.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            {t("accounts.no_accounts")}          </div>
        )}
      </div>

      {isFormOpen && (
        <AccountForm
          account={editingAccount}
          onClose={() => setIsFormOpen(false)}
          onSuccess={loadAccounts}
        />
      )}
    </div>
  );
}
