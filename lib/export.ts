import jsPDF from "jspdf";

export const exportCSV = (data: Record<string, any>[], filename: string) => {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const escape = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = data.map((row) => headers.map((h) => escape(row[h])).join(","));
  const csv = [headers.map(escape).join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportPDF = (title: string, columns: string[], data: string[][], filename: string) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(16);
  doc.text(title, pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 27, { align: "center" });

  const colWidth = Math.min(50, (pageWidth - 20) / columns.length);
  const startY = 35;

  // Header
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  columns.forEach((col, i) => {
    doc.text(col, 10 + i * colWidth, startY);
  });

  // Rows
  doc.setFont("helvetica", "normal");
  data.forEach((row, ri) => {
    const y = startY + 7 + ri * 7;
    if (y > 280) {
      doc.addPage();
    }
    row.forEach((cell, ci) => {
      doc.text(cell, 10 + ci * colWidth, y);
    });
  });

  doc.save(`${filename}.pdf`);
};

export const exportExcel = (data: Record<string, any>[], filename: string) => {
  const XLSX = require("xlsx");
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, `${filename}.xlsx`);
};
