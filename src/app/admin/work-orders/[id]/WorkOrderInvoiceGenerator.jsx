"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  ArrowRight,
  Printer,
  Loader2,
  AlertCircle,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { generateInvoiceAction } from "@/app/actions/commercial";

export default function WorkOrderInvoiceGenerator({ workOrder, existingInvoices = [] }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [gstType, setGstType] = useState("INTRA_STATE"); // INTRA_STATE or INTER_STATE
  const [dueDateDays, setDueDateDays] = useState(30);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeInvoice = existingInvoices.find((inv) => inv.status !== "CANCELLED");

  // Quotation subtotal reference
  const baseSubtotal = workOrder.quotation?.subtotal || 0;
  const numDiscount = Math.max(0, parseFloat(discount) || 0);

  // Real-time tax math
  const isInterState = gstType === "INTER_STATE";
  const taxRate = 18;
  const taxAmount = Math.round((baseSubtotal * (taxRate / 100) + Number.EPSILON) * 100) / 100;
  const cgstAmount = isInterState ? 0 : Math.round((baseSubtotal * 0.09 + Number.EPSILON) * 100) / 100;
  const sgstAmount = isInterState ? 0 : Math.round((baseSubtotal * 0.09 + Number.EPSILON) * 100) / 100;
  const igstAmount = isInterState ? taxAmount : 0;
  const grandTotal = Math.max(0, Math.round((baseSubtotal + taxAmount - numDiscount + Number.EPSILON) * 100) / 100);

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await generateInvoiceAction({
        workOrderId: workOrder.id,
        quotationId: workOrder.quotationId,
        customerId: workOrder.customerId,
        gstType,
        dueDateDays,
        discount: numDiscount,
        notes,
      });

      if (!res.success) {
        setError(res.error || "Failed to generate invoice");
      } else {
        setShowModal(false);
        router.push(`/admin/billing/${res.invoiceId}`);
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-admin-surface/5 rounded-lg shadow-lg border border-white/10 overflow-hidden backdrop-blur-sm">
      <div className="p-5 border-b border-white/10 bg-black/20 flex justify-between items-center">
        <h2 className="font-semibold text-white text-sm flex items-center gap-2">
          <CreditCard size={18} className="text-purple-400" />
          <span>Billing & Invoicing</span>
        </h2>
      </div>

      <div className="p-5 space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {activeInvoice ? (
          <div className="p-4 bg-purple-950/30 border border-purple-500/30 rounded-lg space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block">Tax Invoice Generated</span>
                <p className="text-base font-bold text-white mt-0.5">{activeInvoice.invoiceNumber}</p>
                <p className="text-xs text-secondary mt-0.5">
                  Issued on {new Date(activeInvoice.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`px-2 py-0.5 text-xs font-bold uppercase rounded border ${
                  activeInvoice.status === "PAID"
                    ? "bg-green-500/10 text-green-400 border-green-500/30"
                    : activeInvoice.status === "PARTIALLY_PAID"
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                }`}
              >
                {activeInvoice.status.replace("_", " ")}
              </span>
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs">
              <span className="text-secondary">Invoice Amount:</span>
              <span className="text-white font-bold text-sm">
                ₹ {activeInvoice.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex gap-2 pt-1">
              <Link
                href={`/admin/billing/${activeInvoice.id}`}
                className="flex-1 flex items-center justify-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold py-2 rounded transition-colors"
              >
                <span>Manage Invoice</span>
                <ArrowRight size={13} />
              </Link>
              <Link
                href={`/admin/billing/${activeInvoice.id}/print`}
                target="_blank"
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded transition-colors flex items-center gap-1"
                title="Print Tax Invoice"
              >
                <Printer size={14} />
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xs text-secondary mb-3">
              Generate a formal GST Tax Invoice directly from this Work Order and its approved quotation scope.
            </p>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded text-sm font-semibold transition-colors shadow-sm cursor-pointer"
            >
              <FileText size={16} />
              <span>Generate Tax Invoice</span>
            </button>
          </div>
        )}
      </div>

      {/* Invoice Generation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="bg-admin-surface border border-admin-border rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center border-b border-admin-border pb-3">
              <div>
                <h3 className="text-lg font-bold text-admin-heading">Generate Tax Invoice</h3>
                <p className="text-xs text-admin-muted">Work Order: {workOrder.workOrderNumber}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-admin-muted hover:text-admin-heading text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateInvoice} className="space-y-4">
              {/* GST Type */}
              <div>
                <label className="block text-xs font-bold text-admin-muted uppercase mb-1.5">
                  GST Jurisdiction / Supply Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-start gap-2 p-3 rounded border text-xs cursor-pointer transition-colors ${
                      gstType === "INTRA_STATE"
                        ? "border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold"
                        : "border-admin-border bg-admin-surface text-admin-muted"
                    }`}
                  >
                    <input
                      type="radio"
                      name="gstType"
                      value="INTRA_STATE"
                      checked={gstType === "INTRA_STATE"}
                      onChange={() => setGstType("INTRA_STATE")}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="font-bold">Intra-State</p>
                      <p className="text-[11px] opacity-80">CGST (9%) + SGST (9%)</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2 p-3 rounded border text-xs cursor-pointer transition-colors ${
                      gstType === "INTER_STATE"
                        ? "border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold"
                        : "border-admin-border bg-admin-surface text-admin-muted"
                    }`}
                  >
                    <input
                      type="radio"
                      name="gstType"
                      value="INTER_STATE"
                      checked={gstType === "INTER_STATE"}
                      onChange={() => setGstType("INTER_STATE")}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="font-bold">Inter-State</p>
                      <p className="text-[11px] opacity-80">IGST (18%)</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Payment Terms / Due Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-admin-muted uppercase mb-1">Due Date (Days)</label>
                  <select
                    value={dueDateDays}
                    onChange={(e) => setDueDateDays(parseInt(e.target.value))}
                    className="w-full border border-admin-border rounded px-3 py-2 text-sm bg-admin-surface text-admin-heading focus:outline-none focus:border-indigo-500"
                  >
                    <option value={15}>Net 15 Days</option>
                    <option value={30}>Net 30 Days (Standard)</option>
                    <option value={45}>Net 45 Days</option>
                    <option value={60}>Net 60 Days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-admin-muted uppercase mb-1">Discount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-full border border-admin-border rounded px-3 py-2 text-sm bg-admin-surface text-admin-heading focus:outline-none focus:border-indigo-500 text-right"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-admin-muted uppercase mb-1">Invoice Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. PO reference, milestone completion notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-admin-border rounded px-3 py-2 text-sm bg-admin-surface text-admin-heading focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Financial Breakdown Preview */}
              <div className="bg-admin-elevated p-4 rounded-lg border border-admin-border space-y-2 text-xs">
                <div className="flex justify-between text-admin-muted">
                  <span>Taxable Subtotal:</span>
                  <span>₹ {baseSubtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>

                {isInterState ? (
                  <div className="flex justify-between text-admin-muted">
                    <span>IGST (18%):</span>
                    <span>₹ {igstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-admin-muted">
                      <span>CGST (9%):</span>
                      <span>₹ {cgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-admin-muted">
                      <span>SGST (9%):</span>
                      <span>₹ {sgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                  </>
                )}

                {numDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount:</span>
                    <span>- ₹ {numDiscount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-admin-border flex justify-between items-center text-sm font-bold text-admin-heading">
                  <span>Grand Total Payable:</span>
                  <span className="text-indigo-600 text-base">
                    ₹ {grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-admin-border rounded text-admin-muted hover:bg-admin-elevated text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <FileText size={14} />
                      <span>Confirm & Issue Invoice</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
