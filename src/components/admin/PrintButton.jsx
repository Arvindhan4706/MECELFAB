"use client";

import { Printer } from "lucide-react";

export default function PrintButton({ label = "Print / Save as PDF", className = "" }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined") {
          window.print();
        }
      }}
      className={
        className ||
        "bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md shadow text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
      }
    >
      <Printer size={16} />
      <span>{label}</span>
    </button>
  );
}
