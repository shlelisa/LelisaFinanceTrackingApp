"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import {
  useBudgets,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
} from "@/hooks/useBudgets";
import BudgetCard from "@/components/BudgetCard";
import BudgetForm from "@/components/BudgetForm";
import type { Budget } from "@/lib/types/budget";
import type { BudgetFormValues } from "@/lib/validation/budget";

export default function BudgetsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editBudget, setEditBudget] = useState<Budget | null>(null);

  const { data: budgets = [], isLoading } = useBudgets();
  const createMutation = useCreateBudget();
  const updateMutation = useUpdateBudget();
  const deleteMutation = useDeleteBudget();

  const handleFormSubmit = async (values: BudgetFormValues) => {
    try {
      if (editBudget) {
        await updateMutation.mutateAsync({ id: editBudget._id, data: values });
      } else {
        await createMutation.mutateAsync(values);
      }
      setFormOpen(false);
      setEditBudget(null);
    } catch (error) {
      console.error("Failed to save budget:", error);
      // You can show a toast notification here
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditBudget(budget);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const existingCategories = budgets.map((b) => b.category);

  return (
    <ProtectedRoute>
      <div className="mx-auto flex max-w-6xl flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-primary">Budgets</h1>
          <Button onClick={() => setFormOpen(true)}>+ Create Budget</Button>
        </div>

        {isLoading ? (
          <p>Loading budgets...</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {budgets.map((budget) => (
              <BudgetCard
                key={budget._id}
                budget={budget}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <BudgetForm
        key={editBudget?._id ?? "create"}
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) setEditBudget(null);
          setFormOpen(open);
        }}
        onSubmit={handleFormSubmit}
        defaultValues={
          editBudget
            ? {
                category: editBudget.category as BudgetFormValues["category"],
                limitAmount: editBudget.limitAmount,
              }
            : undefined
        }
        mode={editBudget ? "edit" : "create"}
        existingCategories={existingCategories}
      />
    </ProtectedRoute>
  );
}
