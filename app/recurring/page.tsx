"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus } from "lucide-react";
import {
  useRecurringTransactions,
  useCreateRecurring,
  useUpdateRecurring,
  useDeleteRecurring,
} from "@/hooks/useRecurring";
import RecurringCard from "@/components/RecurringCard";
import RecurringForm from "@/components/RecurringForm";
import type { RecurringTransaction } from "@/lib/types/recurring";
import type { RecurringFormValues } from "@/lib/validation/recurring";
import { useTranslation } from "@/hooks/useTranslation";

export default function RecurringPage() {
  const { t } = useTranslation();
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<RecurringTransaction | null>(null);

  const { data: items = [], isLoading } = useRecurringTransactions();
  const createMutation = useCreateRecurring();
  const updateMutation = useUpdateRecurring();
  const deleteMutation = useDeleteRecurring();

  const handleFormSubmit = async (values: RecurringFormValues) => {
    try {
      if (editItem) {
        await updateMutation.mutateAsync({
          id: editItem._id,
          data: { ...values, endDate: values.endDate || undefined },
        });
      } else {
        await createMutation.mutateAsync(values);
      }
      setFormOpen(false);
      setEditItem(null);
    } catch (error) {
      console.error("Failed to save recurring transaction:", error);
    }
  };

  const handleEdit = (item: RecurringTransaction) => {
    setEditItem(item);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await updateMutation.mutateAsync({ id, data: { isActive } });
  };

  return (
    <ProtectedRoute>
      <div className="mx-auto flex max-w-6xl flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="size-6 text-primary" />
            <h1 className="text-2xl font-semibold text-primary">{t("recurring.title")}</h1>
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-1 size-4" /> {t("recurring.add")}
          </Button>
        </div>

        {isLoading ? (
          <p>{t("recurring.loading")}</p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-muted-foreground">
            <RefreshCw className="size-12" />
            <p className="text-lg">{t("recurring.no_recurring")}</p>
            <p>{t("recurring.no_recurring_subtext")}</p>
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="mr-1 size-4" /> {t("recurring.add_first")}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <RecurringCard
                key={item._id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>
        )}
      </div>

      <RecurringForm
        key={editItem?._id ?? "create"}
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) setEditItem(null);
          setFormOpen(open);
        }}
        onSubmit={handleFormSubmit}
        defaultValues={
          editItem
            ? {
                type: editItem.type,
                amount: editItem.amount,
                category: editItem.category,
                description: editItem.description,
                frequency: editItem.frequency,
                startDate: editItem.startDate.slice(0, 10),
                endDate: editItem.endDate ? editItem.endDate.slice(0, 10) : "",
              }
            : undefined
        }
        mode={editItem ? "edit" : "create"}
      />
    </ProtectedRoute>
  );
}
