"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Goal } from "@/lib/types/goal";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PiggyBank, Calendar } from "lucide-react";
import Money from "@/components/Money";
import { useTranslation } from "@/hooks/useTranslation";

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
}

const GoalCard = ({ goal, onEdit, onDelete }: GoalCardProps) => {
  const { t } = useTranslation();
  const percentage =
    goal.targetAmount > 0
      ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 999)
      : 0;

  const isAchieved = goal.currentAmount >= goal.targetAmount;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <PiggyBank className="size-5 text-primary" />
          <CardTitle className="text-lg font-medium">{goal.name}</CardTitle>
        </div>
        {isAchieved && <Badge className="bg-green-500">{t("goals.achieved")}</Badge>}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t("goals.target")}</span>
          <span className="font-medium"><Money amount={goal.targetAmount} /></span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t("goals.saved")}</span>
          <span className="font-medium"><Money amount={goal.currentAmount} /></span>
        </div>
        <Progress
          value={Math.min(percentage, 100)}
          className="h-3"
          indicatorClassName={isAchieved ? "bg-green-500" : "bg-primary"}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{t("goals.complete", { pct: Math.round(percentage) })}</span>
          {goal.deadline && (
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {t("goals.due")} {new Date(goal.deadline).toLocaleDateString()}
            </span>
          )}
        </div>
        {goal.category && (
          <span className="text-xs text-muted-foreground">{t("goals.category_label")} {goal.category}</span>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" size="sm" onClick={() => onEdit(goal)}>
            {t("common.edit")}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm(t("goals.delete_confirm"))) {
                onDelete(goal._id);
              }
            }}
          >
            {t("common.delete")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalCard;
