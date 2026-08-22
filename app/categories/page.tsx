"use client";

import { useState, useEffect } from "react";
import { getStoredCategories, addStoredCategory, updateStoredCategory, deleteStoredCategory } from "@/lib/storage/localStorage";
import type { CustomCategory } from "@/lib/types/category";
import { useTranslation } from "@/hooks/useTranslation";
import { Plus, Trash2, Pencil, Tag, Utensils, Car, ShoppingBag, Zap, Home, Activity, Film, Briefcase, Building, Gift } from "lucide-react";

const ICON_OPTIONS = [
  { name: "Briefcase", icon: Briefcase },
  { name: "Building", icon: Building },
  { name: "Gift", icon: Gift },
  { name: "Utensils", icon: Utensils },
  { name: "Car", icon: Car },
  { name: "ShoppingBag", icon: ShoppingBag },
  { name: "Zap", icon: Zap },
  { name: "Home", icon: Home },
  { name: "Activity", icon: Activity },
  { name: "Film", icon: Film },
  { name: "Tag", icon: Tag },
];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Briefcase,
  Building,
  Gift,
  Utensils,
  Car,
  ShoppingBag,
  Zap,
  Home,
  Activity,
  Film,
  Tag,
};

const COLORS = ["#10b981", "#3b82f6", "#ef4444", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4", "#64748b"];

export default function CategoriesPage() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CustomCategory | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [color, setColor] = useState("#3b82f6");
  const [icon, setIcon] = useState("Tag");

  const loadCategories = () => {
    setCategories(getStoredCategories());
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const resetForm = () => {
    setName("");
    setType("expense");
    setColor("#3b82f6");
    setIcon("Tag");
    setEditingCategory(null);
    setIsAdding(false);
  };

  const startEdit = (cat: CustomCategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setColor(cat.color || "#3b82f6");
    setIcon(cat.icon || "Tag");
    setIsAdding(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      type,
      color,
      icon,
    };
    if (editingCategory) {
      updateStoredCategory(editingCategory._id, payload);
    } else {
      addStoredCategory(payload);
    }
    resetForm();
    loadCategories();
  };

  const handleDelete = (id: string) => {
    if (confirm(t("categories.delete_confirm"))) {
      deleteStoredCategory(id);
      loadCategories();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("categories.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("categories.subtitle")}
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsAdding(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" /> {t("categories.add")}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSave} className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-foreground">
            {editingCategory ? t("categories.edit_title") : t("categories.new_title")}
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">{t("categories.name")}</label>
              <input
                type="text"
                placeholder={t("categories.name_placeholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">{t("categories.type")}</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
              >
                <option value="expense">{t("categories.expense")}</option>
                <option value="income">{t("categories.income")}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">{t("categories.icon")}</label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.name} value={opt.name}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">{t("categories.theme_color")}</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`size-6 rounded-full transition-transform ${
                    color === c ? "scale-125 ring-2 ring-primary ring-offset-2" : ""
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground"
            >
              {t("categories.cancel")}
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground"
            >
              {editingCategory ? t("categories.save_changes") : t("categories.save")}
            </button>
          </div>
        </form>
      )}

      {/* Category List */}
      <div className="grid gap-3 sm:grid-cols-2">
        {categories.map((cat) => (
          <div
            key={cat._id}
            className="flex items-center justify-between rounded-xl border bg-card p-3.5 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex size-9 items-center justify-center rounded-lg text-white font-bold"
                style={{ backgroundColor: cat.color || "#3b82f6" }}
              >
                {(() => {
                  const IconComp = ICON_MAP[cat.icon || "Tag"] || Tag;
                  return <IconComp className="size-4" />;
                })()}
              </div>
              <div>
                <div className="font-semibold text-foreground text-sm">{cat.name}</div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground">{cat.type}</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => startEdit(cat)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary"
              >
                <Pencil className="size-4" />
              </button>
              <button
                onClick={() => handleDelete(cat._id)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
