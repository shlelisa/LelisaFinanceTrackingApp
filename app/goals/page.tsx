"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Target, Plus } from "lucide-react";
import {
  useGoals,
  useCreateGoal,
  useUpdateGoal,
  useDeleteGoal,
} from "@/hooks/useGoals";
import GoalCard from "@/components/GoalCard";
import GoalForm from "@/components/GoalForm";
import type { Goal } from "@/lib/types/goal";
import type { GoalFormValues } from "@/lib/validation/goal";
import { useTranslation } from "@/hooks/useTranslation";

export default function GoalsPage() {
  const { t } = useTranslation();
  const [formOpen, setFormOpen] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);

  const { data: goals = [], isLoading } = useGoals();
  const createMutation = useCreateGoal();
  const updateMutation = useUpdateGoal();
  const deleteMutation = useDeleteGoal();

  const handleFormSubmit = async (values: GoalFormValues) => {
    try {
      if (editGoal) {
        await updateMutation.mutateAsync({ id: editGoal._id, data: values });
      } else {
        await createMutation.mutateAsync(values);
      }
      setFormOpen(false);
      setEditGoal(null);
    } catch (error) {
      console.error("Failed to save goal:", error);
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditGoal(goal);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  return (
    <ProtectedRoute>
      <div className="mx-auto flex max-w-6xl flex-col gap-4 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="size-6 text-primary" />
            <h1 className="text-2xl font-semibold text-primary">{t("goals.title")}</h1>
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-1 size-4" /> {t("goals.add")}
          </Button>
        </div>

        {isLoading ? (
          <p>{t("goals.loading")}</p>
        ) : goals.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-muted-foreground">
            <Target className="size-12" />
            <p className="text-lg">{t("goals.no_goals")}</p>
            <p>{t("goals.no_goals_subtext")}</p>
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="mr-1 size-4" /> {t("goals.create_first")}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => (
              <GoalCard
                key={goal._id}
                goal={goal}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <GoalForm
        key={editGoal?._id ?? "create"}
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) setEditGoal(null);
          setFormOpen(open);
        }}
        onSubmit={handleFormSubmit}
        defaultValues={
          editGoal
            ? {
                name: editGoal.name,
                targetAmount: editGoal.targetAmount,
                currentAmount: editGoal.currentAmount,
                deadline: editGoal.deadline ? editGoal.deadline.slice(0, 10) : undefined,
                category: editGoal.category,
              }
            : undefined
        }
        mode={editGoal ? "edit" : "create"}
      />
    </ProtectedRoute>
  );
}
