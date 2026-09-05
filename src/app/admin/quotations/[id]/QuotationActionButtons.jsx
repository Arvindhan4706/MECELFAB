"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  CheckCircle,
  XCircle,
  Wrench,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import {
  updateQuotationStatusAction,
  convertQuotationToWorkOrderAction,
} from "@/app/actions/commercial";

export default function QuotationActionButtons({ quotation, existingWorkOrder }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleStatusChange = async (newStatus) => {
    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const res = await updateQuotationStatusAction(quotation.id, newStatus);
      if (!res.success) {
        setError(res.error || "Failed to update quotation status");
      } else {
        setSuccessMsg(`Quotation marked as ${newStatus}`);
        router.refresh();
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToWorkOrder = async () => {
    if (!window.confirm("Convert this ACCEPTED quotation into an active Work Order?")) {
      return;
    }
    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const res = await convertQuotationToWorkOrderAction(quotation.id);
      if (!res.success) {
        setError(res.error || "Failed to convert to work order");
      } else {
        setSuccessMsg(`Successfully created Work Order ${res.workOrderNumber}!`);
        router.push(`/admin/work-orders/${res.workOrderId}`);
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-xs flex items-center gap-2">
          <CheckCircle size={15} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Linked Work Order Banner if already converted */}
      {existingWorkOrder ? (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <div className="flex items-center gap-2 text-indigo-900 font-semibold text-sm mb-1">
            <Wrench size={16} className="text-indigo-600" />
            <span>Converted to Work Order</span>
          </div>
          <p className="text-xs text-indigo-700 mb-3">
            This quotation has been converted into an operational work order ({existingWorkOrder.workOrderNumber}).
          </p>
          <Link
            href={`/admin/work-orders/${existingWorkOrder.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded transition-colors"
          >
            <span>View Work Order</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      ) : quotation.status === "ACCEPTED" ? (
        /* One-Click Conversion Button */
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-900 font-semibold text-sm mb-1">
            <CheckCircle size={16} className="text-green-600" />
            <span>Quotation Accepted</span>
          </div>
          <p className="text-xs text-green-700 mb-3">
            The proposal is approved. Convert this quotation to an active Work Order to allocate technicians and schedule services.
          </p>
          <button
            type="button"
            onClick={handleConvertToWorkOrder}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded text-sm font-bold transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Converting to Work Order...</span>
              </>
            ) : (
              <>
                <Wrench size={16} />
                <span>Convert to Work Order</span>
              </>
            )}
          </button>
        </div>
      ) : null}

      {/* Status Transition Actions */}
      <div className="grid grid-cols-1 gap-2 pt-1">
        {quotation.status === "DRAFT" && (
          <>
            <button
              type="button"
              onClick={() => handleStatusChange("SENT")}
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              <span>Mark as Sent to Client</span>
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange("ACCEPTED")}
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              <span>Mark as Accepted (Direct PO)</span>
            </button>
          </>
        )}

        {["SENT", "VIEWED"].includes(quotation.status) && (
          <>
            <button
              type="button"
              onClick={() => handleStatusChange("ACCEPTED")}
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              <span>Mark as Accepted</span>
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange("REJECTED")}
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
              <span>Mark as Rejected</span>
            </button>
          </>
        )}

        {["REJECTED", "EXPIRED"].includes(quotation.status) && (
          <p className="text-xs text-admin-muted text-center py-2 italic border border-admin-border rounded bg-admin-elevated">
            This quotation is {quotation.status.toLowerCase()}.
          </p>
        )}
      </div>
    </div>
  );
}
