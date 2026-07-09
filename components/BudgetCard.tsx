"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Budget } from "@/lib/types/budget";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Money from "@/components/Money";

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

const BudgetCard = ({ budget, onEdit, onDelete }: BudgetCardProps) => {
  const spentPercentage =
    budget.limitAmount > 0
      ? Math.min((budget.spent / budget.limitAmount) * 100, 999)
      : 0;

  const getProgressColor = () => {
    if (spentPercentage >= 100) return "bg-red-500";
    if (spentPercentage > 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const isExceeded = budget.remaining < 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">{budget.category}</CardTitle>
        {isExceeded && <Badge variant="destructive">Exceeded</Badge>}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Spent</span>
          <span>
            <Money amount={budget.spent} /> /{" "}
            <Money amount={budget.limitAmount} />
          </span>
        </div>
        <Progress
          value={Math.min(spentPercentage, 100)}
          className="h-3"
          indicatorClassName={getProgressColor()}
        />
        <div className="flex justify-between items-center">
          <p className={`text-sm font-medium ${isExceeded ? "text-destructive" : ""}`}>
            {isExceeded
              ? <>Overspent by <Money amount={Math.abs(budget.remaining)} /></>
              : <>Remaining: <Money amount={budget.remaining} /></>}
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => onEdit(budget)}>
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm("Are you sure you want to delete this budget?")) {
                  onDelete(budget._id);
                }
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetCard;
