"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProtectedRoute from "@/components/ProtectedRoute";
import DataTable from "@/components/DataTable";
import TransactionForm from "@/components/TransactionForm";
import Money from "@/components/Money";
import {
  useTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from "@/hooks/useTransactions";
import type { Transaction } from "@/lib/types/transaction";
import { CATEGORIES } from "@/lib/constants";
import type { TransactionFormValues } from "@/lib/validation/transaction";
import { type ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";

export default function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [formOpen, setFormOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);

  const { data: transactions = [], isLoading } = useTransactions({
    type: typeFilter !== "all" ? typeFilter : undefined,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    startDate: dateRange.start || undefined,
    endDate: dateRange.end || undefined,
  });

  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  const { mutateAsync: createTx } = createMutation;
  const { mutateAsync: updateTx } = updateMutation;
  const { mutateAsync: deleteTx } = deleteMutation;

  const columns: ColumnDef<Transaction>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
      {
        accessorKey: "date",
        header: "Date",
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-xs tabular-nums">
            {new Date(row.original.date).toLocaleDateString()}
          </span>
        ),
        size: 110,
      },
      {
        accessorKey: "description",
        header: "Description",
        enableSorting: true,
        size: 200,
      },
      {
        accessorKey: "category",
        header: "Category",
        enableSorting: true,
        size: 130,
      },
      {
        accessorKey: "amount",
        header: "Amount",
        enableSorting: true,
        cell: ({ row }) => {
          const tx = row.original;
          const showOrig = tx.currency && tx.currency !== "ETB" && tx.originalAmount != null;
          return (
            <span
              className={`tabular-nums ${
                tx.type === "income" ? "text-success" : "text-error"
              }`}
            >
              {tx.type === "income" ? "+" : "-"}
              <Money amount={tx.amount} />
              {showOrig && (
                <span className="ml-1 text-xs text-muted-foreground">
                  ({tx.originalAmount} {tx.currency})
                </span>
              )}
            </span>
          );
        },
      },
      {
        accessorKey: "type",
        header: "Type",
        enableSorting: true,
        cell: ({ row }) => (
          <Badge
            variant={row.original.type === "income" ? "default" : "destructive"}
            className="text-xs"
          >
            {row.original.type}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        enableHiding: false,
        size: 150,
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 text-xs"
              onClick={() => {
                setEditTx(row.original);
                setFormOpen(true);
              }}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="h-8 px-2 text-xs"
              onClick={async () => {
                if (confirm("Delete this transaction?")) {
                  await deleteTx(row.original._id);
                }
              }}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [deleteTx],
  );

  const handleFormSubmit = async (values: TransactionFormValues) => {
    if (editTx) {
      await updateTx({ id: editTx._id, data: values });
    } else {
      await createTx(values);
    }
    setEditTx(null);
  };

  return (
    <ProtectedRoute>
      <div className="mx-auto flex max-w-6xl flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-primary">Transactions</h1>
          <Button
            onClick={() => {
              setEditTx(null);
              setFormOpen(true);
            }}
          >
            + Add Transaction
          </Button>
        </div>

        {/* Server-side filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Type</Label>
            <Select
              value={typeFilter}
              onValueChange={(v) =>
                setTypeFilter((v ?? "all") as "all" | "income" | "expense")
              }
            >
              <SelectTrigger className="h-8 w-[110px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Category</Label>
            <Select
              value={categoryFilter}
              onValueChange={(v) => setCategoryFilter(v ?? "all")}
            >
              <SelectTrigger className="h-8 w-[130px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Date</Label>
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
              className="h-8 w-[140px] text-xs"
            />
            <span className="text-xs text-muted-foreground">—</span>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="h-8 w-[140px] text-xs"
            />
          </div>
        </div>

        {/* Bulk delete */}
        <DataTable<Transaction>
          data={transactions}
          columns={columns}
          isLoading={isLoading}
          exportHeaders={["Date", "Description", "Category", "Amount", "Type"]}
          exportRow={(r) => [
            new Date(r.date).toLocaleDateString(),
            r.description,
            r.category,
            r.amount.toString(),
            r.type,
          ]}
          renderBulkActions={(selectedRows, clearSelection) => (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                className="h-8 text-xs"
                onClick={async () => {
                  if (confirm(`Delete ${selectedRows.length} selected transactions?`)) {
                    await Promise.all(selectedRows.map((tx) => deleteTx(tx._id)));
                    clearSelection();
                  }
                }}
              >
                Delete Selected
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-xs text-muted-foreground"
                onClick={clearSelection}
              >
                Clear
              </Button>
            </div>
          )}
        />
      </div>

      <TransactionForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditTx(null);
        }}
        onSubmit={handleFormSubmit}
        defaultValues={
          editTx
            ? {
                type: editTx.type,
                amount: editTx.originalAmount ?? editTx.amount,
                currency: editTx.currency ?? "ETB",
                category: editTx.category,
                description: editTx.description,
                date: new Date(editTx.date).toISOString().slice(0, 10),
              }
            : undefined
        }
        mode={editTx ? "edit" : "create"}
      />
    </ProtectedRoute>
  );
}
