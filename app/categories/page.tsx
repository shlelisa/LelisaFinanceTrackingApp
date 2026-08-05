"use client";

import { useState, useEffect } from "react";
import { getStoredCategories, addStoredCategory, deleteStoredCategory } from "@/lib/storage/localStorage";
import type { CustomCategory } from "@/lib/types/category";
import { Plus, Trash2, Tag, Utensils, Car, ShoppingBag, Zap, Home, Activity, Film, Briefcase, Building, Gift } from "lucide-react";

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

const COLORS = ["#10b981", "#3b82f6", "#ef4444", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4", "#64748b"];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const [isAdding, setIsAdding] = useState(false);
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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addStoredCategory({
      name,
      type,
      color,
      icon,
    });
    setName("");
    setIsAdding(false);
    loadCategories();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this custom category?")) {
      deleteStoredCategory(id);
      loadCategories();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Customize income and expense categories with custom colors and icons.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" /> Add Category
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-foreground">New Category</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Name</label>
              <input
                type="text"
                placeholder="e.g. Subscriptions"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Icon</label>
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
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Theme Color</label>
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
              onClick={() => setIsAdding(false)}
              className="rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground"
            >
              Save Category
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
                <Tag className="size-4" />
              </div>
              <div>
                <div className="font-semibold text-foreground text-sm">{cat.name}</div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground">{cat.type}</span>
              </div>
            </div>

            {!cat.isDefault && (
              <button
                onClick={() => handleDelete(cat._id)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
