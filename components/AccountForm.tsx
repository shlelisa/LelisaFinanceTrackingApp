"use client";

import { useState } from "react";
import { addStoredAccount, updateStoredAccount } from "@/lib/storage/localStorage";
import type { Account, AccountType } from "@/lib/types/account";
import { CURRENCIES } from "@/lib/constants";
import { X, Wallet, Building2, CreditCard, Smartphone, Landmark } from "lucide-react";

interface AccountFormProps {
  account?: Account | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ACCOUNT_TYPES: { type: AccountType; label: string; icon: any }[] = [
  { type: "cash", label: "Cash / Physical Wallet", icon: Wallet },
  { type: "bank", label: "Bank Account", icon: Building2 },
  { type: "credit_card", label: "Credit Card", icon: CreditCard },
  { type: "mobile_money", label: "Mobile Money (Telebirr/M-Pesa)", icon: Smartphone },
  { type: "wallet", label: "Digital Wallet", icon: Landmark },
];

const COLORS = ["#10b981", "#3b82f6", "#ef4444", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4", "#64748b"];

export default function AccountForm({ account, onClose, onSuccess }: AccountFormProps) {
  const [name, setName] = useState(account?.name || "");
  const [type, setType] = useState<AccountType>(account?.type || "cash");
  const [balance, setBalance] = useState(account?.balance !== undefined ? String(account.balance) : "0");
  const [currency, setCurrency] = useState(account?.currency || "USD");
  const [color, setColor] = useState(account?.color || "#3b82f6");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter an account name");
      return;
    }

    const numBalance = parseFloat(balance);
    if (isNaN(numBalance)) {
      setError("Please enter a valid balance amount");
      return;
    }

    try {
      if (account) {
        updateStoredAccount(account._id, {
          name,
          type,
          balance: numBalance,
          currency,
          color,
          icon: type === "bank" ? "Building2" : type === "credit_card" ? "CreditCard" : type === "mobile_money" ? "Smartphone" : "Wallet",
        });
      } else {
        addStoredAccount({
          name,
          type,
          balance: numBalance,
          currency,
          color,
          icon: type === "bank" ? "Building2" : type === "credit_card" ? "CreditCard" : type === "mobile_money" ? "Smartphone" : "Wallet",
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save account");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-lg font-bold text-foreground">
            {account ? "Edit Account" : "Add New Account"}
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
              Account Name
            </label>
            <input
              type="text"
              placeholder="e.g. Commercial Bank Checking"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ACCOUNT_TYPES.map((item) => {
                const IconComponent = item.icon;
                const isSelected = type === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setType(item.type)}
                    className={`flex items-center gap-2 rounded-lg border p-2.5 text-xs text-left transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <IconComponent className="size-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Balance
              </label>
              <input
                type="number"
                step="any"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
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

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Theme Color
            </label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`size-7 rounded-full transition-transform ${
                    color === c ? "scale-125 ring-2 ring-primary ring-offset-2" : "hover:scale-110"
                  }`}
                />
              ))}
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
              {account ? "Update Account" : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
