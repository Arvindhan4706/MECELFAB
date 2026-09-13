"use client";

import { useState } from "react";
import { Download } from "lucide-react";

export default function DownloadPDFButton({ quotationId, quotationNumber }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pdf/quotation?id=${quotationId}`);
      if (!res.ok) throw new Error('Failed to generate PDF');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${quotationNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-md shadow text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Download size={16} />
      <span>{loading ? 'Generating...' : 'Download PDF'}</span>
    </button>
  );
}
