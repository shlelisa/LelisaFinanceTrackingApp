"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecurringTransaction } from "@/lib/types/recurring";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { RefreshCw, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import Money from "@/components/Money";

interface RecurringCardProps {
  item: RecurringTransaction;
  onEdit: (item: RecurringTransaction) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
}

const frequencyLabels: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

const RecurringCard = ({ item, onEdit, onDelete, onToggleActive }: RecurringCardProps) => {
  return (
    <Card className={!item.isActive ? "opacity-60" : ""}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          {item.type === "income" ? (
            <ArrowUpCircle className="size-5 text-green-500" />
          ) : (
            <ArrowDownCircle className="size-5 text-red-500" />
          )}
          <CardTitle className="text-lg font-medium">{item.description}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={item.isActive ? "default" : "secondary"}>
            {frequencyLabels[item.frequency]}
          </Badge>
          <Switch
            checked={item.isActive}
            onCheckedChange={(checked) => onToggleActive(item._id, checked)}
          />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Category</span>
          <span>{item.category}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Amount</span>
          <span className={item.type === "income" ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
            {item.type === "income" ? "+" : "-"}<Money amount={item.amount} />
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Next</span>
          <span>{new Date(item.nextDate).toLocaleDateString()}</span>
        </div>
        {item.endDate && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Ends</span>
            <span>{new Date(item.endDate).toLocaleDateString()}</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <RefreshCw className="size-3" />
          Every {frequencyLabels[item.frequency].toLowerCase()}
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm("Delete this recurring transaction?")) onDelete(item._id);
            }}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecurringCard;
