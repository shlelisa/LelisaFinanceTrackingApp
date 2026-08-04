"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { useState, useCallback } from "react";
import { Loader2, Download, SlidersHorizontal, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const escapeCsv = (val: string): string => {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
};

type DataTableProps<T> = {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  exportHeaders?: string[];
  exportRow?: (row: T) => string[];
  renderBulkActions?: (rows: T[], clearSelection: () => void) => React.ReactNode;
};

export default function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  isLoading,
  exportHeaders,
  exportRow,
  renderBulkActions,
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [goToPage, setGoToPage] = useState("1");

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
    enableRowSelection: true,
  });

  const handleExport = useCallback(() => {
    if (!exportHeaders || !exportRow) return;
    const visibleRows = table.getRowModel().rows.map((r) => r.original);
    const csv = [
      exportHeaders.map(escapeCsv).join(","),
      ...visibleRows.map((r) => exportRow(r).map(escapeCsv).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportHeaders, exportRow, table]);

  const selectedCount = Object.keys(rowSelection).length;
  const selectedRows = table.getRowModel().rows.filter((r) => r.getIsSelected());

  return (
    <div className="space-y-4">
      {/* Mobile-Friendly Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder={t("common.search_all")}
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-full sm:max-w-xs h-9 text-sm"
        />

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(v) => table.setPageSize(Number(v))}
          >
            <SelectTrigger className="h-9 w-[110px] text-xs">
              <SelectValue placeholder={t("common.rows")} />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size} {t("common.rows")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-input bg-background px-3 text-xs font-medium text-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <SlidersHorizontal className="size-3.5" />
              {t("common.columns")}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>{t("common.toggle_columns")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((col) => col.getCanHide())
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={col.getIsVisible()}
                    onCheckedChange={(value) => col.toggleVisibility(!!value)}
                  >
                    {col.id === "actions"
                      ? t("common.actions")
                      : col.id.charAt(0).toUpperCase() + col.id.slice(1)}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {exportHeaders && exportRow && (
            <Button variant="outline" size="sm" onClick={handleExport} className="h-9 gap-1.5 text-xs">
              <Download className="size-3.5" />
              {t("common.export_csv")}
            </Button>
          )}
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedCount > 0 && renderBulkActions && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/60 px-4 py-2 text-sm">
          <span className="font-medium text-xs sm:text-sm">
            {selectedCount} {t("common.selected")}
          </span>
          {renderBulkActions(
            selectedRows.map((r) => r.original),
            () => setRowSelection({})
          )}
        </div>
      )}

      {/* Responsive Table Container */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        
        {/* Mobile Touch Card View (Small screens) */}
        <div className="block sm:hidden divide-y">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground text-sm">
              <Loader2 className="size-4 animate-spin" />
              {t("common.loading")}
            </div>
          ) : table.getRowModel().rows.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm">
              {t("common.no_data")}
            </div>
          ) : (
            table.getRowModel().rows.map((row) => (
              <div
                key={row.id}
                className={`p-4 space-y-3 transition-colors ${
                  row.getIsSelected() ? "bg-primary/5" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={row.getIsSelected()}
                      onCheckedChange={(value) => row.toggleSelected(!!value)}
                      aria-label={t("common.select_row")}
                    />
                    <span className="font-medium text-sm text-foreground">
                      {(row.original as any).description || (row.original as any).category || (row.original as any).name || "Item"}
                    </span>
                  </div>

                  {row.getVisibleCells().find((c) => c.column.id === "amount") && (
                    <div className="text-right">
                      {flexRender(
                        row.getVisibleCells().find((c) => c.column.id === "amount")?.column.columnDef.cell,
                        row.getVisibleCells().find((c) => c.column.id === "amount")!.getContext()
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground pt-1 border-t border-border/40">
                  <div className="flex items-center gap-2">
                    {(row.original as any).date && (
                      <span>{new Date((row.original as any).date).toLocaleDateString()}</span>
                    )}
                    {(row.original as any).category && (
                      <span className="rounded bg-muted px-2 py-0.5 font-medium text-foreground">
                        {(row.original as any).category}
                      </span>
                    )}
                  </div>

                  {/* Mobile Actions */}
                  {row.getVisibleCells().find((c) => c.column.id === "actions") && (
                    <div>
                      {flexRender(
                        row.getVisibleCells().find((c) => c.column.id === "actions")?.column.columnDef.cell,
                        row.getVisibleCells().find((c) => c.column.id === "actions")!.getContext()
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop / Tablet Scrollable Table View (Medium & larger screens) */}
        <div className="hidden sm:block overflow-x-auto w-full">
          <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm min-w-[650px]">
              <thead className="sticky top-0 z-10 bg-muted/80 text-left backdrop-blur-sm">
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 font-semibold text-muted-foreground"
                        onClick={header.column.getToggleSortingHandler()}
                        style={{
                          cursor: header.column.getCanSort()
                            ? "pointer"
                            : undefined,
                          width: header.getSize(),
                        }}
                      >
                        <div className="flex items-center gap-1">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {{
                            asc: <span className="text-xs text-primary">↑</span>,
                            desc: <span className="text-xs text-primary">↓</span>,
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-12 text-center text-muted-foreground"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="size-4 animate-spin text-primary" />
                        {t("common.loading")}
                      </div>
                    </td>
                  </tr>
                ) : table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-12 text-center text-muted-foreground"
                    >
                      {t("common.no_data")}
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className={`border-t transition-colors hover:bg-muted/40 ${
                        row.getIsSelected() ? "bg-primary/5" : ""
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Responsive Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t px-4 py-3 text-xs text-muted-foreground">
          <span>
            {t("common.page")} {table.getState().pagination.pageIndex + 1} of{" "}
            {Math.max(1, table.getPageCount())} ({table.getFilteredRowModel().rows.length} total)
          </span>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1">
              <span>{t("common.go_to")}</span>
              <Input
                type="number"
                min={1}
                max={Math.max(1, table.getPageCount())}
                value={goToPage}
                onChange={(e) => setGoToPage(e.target.value)}
                className="h-7 w-14 text-xs text-center"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const page = Math.max(1, Math.min(Number(goToPage), table.getPageCount()));
                    table.setPageIndex(page - 1);
                  }
                }}
              />
            </div>

            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeft className="size-3.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="size-3.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
