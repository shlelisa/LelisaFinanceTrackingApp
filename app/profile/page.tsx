"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useUpdateProfile, useUpdatePreferences } from "@/hooks/useProfile";
import { useRates } from "@/hooks/useRates";
import {
  useExchangeRates,
  useUpsertExchangeRate,
  useDeleteExchangeRate,
} from "@/hooks/useExchangeRates";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Save, Loader2, RefreshCw, Pencil, Trash2, Check, X } from "lucide-react";

const DARK_MODE_KEY = "dark_mode";

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const router = useRouter();
  const { data: profile, isLoading } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const updatePrefsMutation = useUpdatePreferences();

  const [dark, setDark] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editing, setEditing] = useState(false);
  const [currency, setCurrency] = useState("ETB");
  const [language, setLanguage] = useState("English");

  useEffect(() => {
    const stored = localStorage.getItem(DARK_MODE_KEY);
    const isDark = stored === "true" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  useEffect(() => {
    if (profile) {
      setEditName(profile.fullName ?? "");
      setEditPhone(profile.phone ?? "");
      setCurrency(profile.preferences?.currency ?? "ETB");
      setLanguage(profile.preferences?.language ?? "English");
      if (profile.preferences?.theme) {
        const isDarkPref = profile.preferences.theme === "dark";
        setDark(isDarkPref);
        document.documentElement.classList.toggle("dark", isDarkPref);
        localStorage.setItem(DARK_MODE_KEY, String(isDarkPref));
      }
    }
  }, [profile]);

  const toggleDark = (checked: boolean) => {
    setDark(checked);
    document.documentElement.classList.toggle("dark", checked);
    localStorage.setItem(DARK_MODE_KEY, String(checked));
    updatePrefsMutation.mutate({ theme: checked ? "dark" : "light" });
  };

  const handleSaveProfile = async () => {
    await updateProfileMutation.mutateAsync({ fullName: editName, phone: editPhone });
    setEditing(false);
  };

  const handleCurrencyChange = (value: string) => {
    setCurrency(value);
    updatePrefsMutation.mutate({ currency: value });
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    updatePrefsMutation.mutate({ language: value });
  };

  const initial = (profile?.fullName ?? user?.fullName ?? "U").charAt(0).toUpperCase();

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
        <h1 className="text-2xl font-semibold text-primary">{t("profile.title")}</h1>

        <Card>
          <CardHeader>
            <CardTitle>{t("profile.account_info")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="flex size-20 items-center justify-center rounded-full bg-primary-lighter text-3xl font-bold text-primary">
              {initial}
            </div>
            <div className="flex flex-1 flex-col gap-3">
              <div>
                <Label>{t("profile.full_name")}</Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  readOnly={!editing}
                  className={editing ? "border-primary" : ""}
                />
              </div>
              <div>
                <Label>{t("profile.email")}</Label>
                <Input value={profile?.email ?? ""} readOnly />
              </div>
              <div>
                <Label>{t("profile.phone")}</Label>
                <Input
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  readOnly={!editing}
                  className={editing ? "border-primary" : ""}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          {editing ? (
            <>
              <Button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? t("common.saving") : <><Save className="mr-1 size-4" /> {t("common.save")}</>}
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)}>{t("common.cancel")}</Button>
            </>
          ) : (
            <Button onClick={() => setEditing(true)}>{t("profile.edit")}</Button>
          )}
            <Button variant="outline">{t("profile.change_password")}</Button>
        </div>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>{t("profile.preferences")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t("common.dark_mode")}</span>
              <Switch checked={dark} onCheckedChange={toggleDark} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t("common.currency")}</span>
              <select
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
              >
                <option value="ETB">{t("profile.currency_etb")}</option>
                <option value="USD">{t("profile.currency_usd")}</option>
                <option value="EUR">{t("profile.currency_eur")}</option>
                <option value="GBP">{t("profile.currency_gbp")}</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t("common.language")}</span>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
              >
                <option value="English">English</option>
                <option value="Amharic">አማርኛ</option>
                <option value="Oromo">Afaan Oromoo</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("profile.exchange_rates")}</CardTitle>
            <RefreshCw className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <EditableRates />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm(t("profile.delete_account_confirm"))) {
                logout();
                router.push("/login");
              }
            }}
            >
            {t("profile.delete_account")}
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function EditableRates() {
  const { t } = useTranslation();
  const { data: liveRates, isLoading: liveLoading } = useRates();
  const { data: userRates, isLoading: userLoading } = useExchangeRates();
  const upsertMutation = useUpsertExchangeRate();
  const deleteMutation = useDeleteExchangeRate();

  const currencies = [
    { code: "USD", name: t("profile.us_dollar") },
    { code: "EUR", name: t("profile.euro") },
    { code: "GBP", name: t("profile.british_pound") },
  ];

  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const liveRate = (code: string) => liveRates?.etbRates?.[code];
  const userRate = (code: string) => {
    if (!userRates) return undefined;
    const doc = userRates.find((r) => r.from === code && r.to === "ETB");
    return doc ? { rate: doc.rate, _id: doc._id } : undefined;
  };

  const startEdit = (code: string) => {
    setEditing(code);
    const u = userRate(code);
    setEditValue((u?.rate ?? liveRate(code) ?? "").toString());
  };

  const saveEdit = async (code: string) => {
    const v = parseFloat(editValue);
    if (isNaN(v) || v <= 0) return;
    await upsertMutation.mutateAsync({ from: code, to: "ETB", rate: v });
    setEditing(null);
  };

  const cancelEdit = () => setEditing(null);

  const handleDelete = async (code: string) => {
    const u = userRate(code);
    if (!u) return;
    await deleteMutation.mutateAsync(u._id);
  };

  if (liveLoading || userLoading) {
    return <p className="text-sm text-muted-foreground">{t("profile.loading_rates")}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {currencies.map((c) => {
        const effective = userRate(c.code)?.rate ?? liveRate(c.code);
        const isOverridden = userRate(c.code) != null;
        return (
          <div key={c.code} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
            <span className="text-sm font-medium">{c.code} — {c.name}</span>
            <div className="flex items-center gap-2">
              {editing === c.code ? (
                <>
                  <span className="text-xs text-muted-foreground">{t("profile.rate_equals", { code: c.code })}</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-24 rounded border border-border bg-background px-2 py-0.5 text-right text-sm"
                  />
                  <span className="text-xs text-muted-foreground">{t("profile.rate_unit")}</span>
                  <button onClick={() => saveEdit(c.code)} className="text-success hover:text-success/80">
                    <Check className="size-4" />
                  </button>
                  <button onClick={cancelEdit} className="text-muted-foreground hover:text-foreground">
                    <X className="size-4" />
                  </button>
                </>
              ) : (
                <>
                  <span className="text-sm text-muted-foreground">
                    1 {c.code} = <strong>{effective?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "—"}</strong> {t("profile.rate_unit")}
                  </span>
                  {isOverridden && <span className="text-[10px] text-warning font-medium">{t("profile.custom")}</span>}
                  <button onClick={() => startEdit(c.code)} className="text-muted-foreground hover:text-foreground">
                    <Pencil className="size-3.5" />
                  </button>
                  {isOverridden && (
                    <button onClick={() => handleDelete(c.code)} className="text-error hover:text-error/80">
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
      <p className="mt-1 text-xs text-muted-foreground">{t("profile.override_rates")}</p>
    </div>
  );
}
