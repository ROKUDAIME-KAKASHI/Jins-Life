"use client";

import { Download } from "lucide-react";

export function PdfExportButton() {
  const handleExport = () => {
    // A simple approach using native print dialog which can save as PDF.
    // CSS should have @media print to hide unnecessary elements.
    window.print();
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
    >
      <Download className="w-4 h-4" />
      Export PDF
    </button>
  );
}
