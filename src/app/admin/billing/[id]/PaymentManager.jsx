"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  IndianRupee,
  CheckCircle,
  History,
  AlertCircle,
  Loader2,
  CreditCard,
} from "lucide-react";
import { recordInvoicePaymentAction } from "@/app/actions/commercial";

export default function PaymentManager({ invoice, payments = [] }) {
  const router = useRouter();

  const paidAmount = payments.reduce((acc, curr) => acc + curr.amount, 0);
  const balance = Math.max(0, Math.round((invoice.grandTotal - paidAmount + Number.EPSILON) * 100) / 100);

  const [amount, setAmount] = useState(balance.toString());
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [method, setMethod] = useState("BANK_TRANSFER");
  const [type, setType] = useState(paidAmount === 0 ? "ADVANCE" : balance <= 0 ? "FULL" : "PARTIAL");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleQuickFill = (val, fillType) => {
    const rounded = Math.round((val + Number.EPSILON) * 100) / 100;
    setAmount(rounded.toString());
    setType(fillType);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid payment amount greater than zero.");
      return;
    }

    if (numAmount > balance) {
      setError(
        `Payment amount (₹${numAmount.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        })}) cannot exceed the remaining balance of ₹${balance.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        })}.`
      );
      return;
    }

    setLoading(true);
    try {
      const res = await recordInvoicePaymentAction({
        invoiceId: invoice.id,
        amount: numAmount,
        date,
        method,
        reference,
        type,
        notes,
      });

      if (!res.success) {
        setError(res.error || "Failed to record payment.");
      } else {
        setSuccessMsg(res.message);
        setReference("");
        setNotes("");
        router.refresh();
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Amount Due Card */}
      <div className="bg-admin-surface/5 rounded-lg shadow-lg border border-white/10 overflow-hidden backdrop-blur-sm text-center p-6">
        <IndianRupee
          size={44}
          className={`mx-auto mb-3 opacity-60 ${balance > 0 ? "text-amber-400" : "text-green-400"}`}
        />
        <p className="text-xs text-secondary uppercase tracking-wider mb-1">Outstanding Balance</p>
        <h2 className={`text-3xl font-black mb-2 ${balance > 0 ? "text-amber-400" : "text-green-400"}`}>
          ₹ {balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </h2>
        <div className="flex justify-center gap-4 text-xs text-gray-400">
          <span>Total: ₹ {invoice.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          <span>•</span>
          <span className="text-green-400 font-semibold">
            Paid: ₹ {paidAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-xs flex items-center gap-2">
          <CheckCircle size={16} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Record Payment Form (if balance > 0) */}
      {balance > 0 && invoice.status !== "CANCELLED" && (
        <div className="bg-admin-surface/5 rounded-lg shadow-lg border border-white/10 overflow-hidden backdrop-blur-sm">
          <div className="p-4 border-b border-white/10 bg-black/20 flex justify-between items-center">
            <h2 className="font-semibold text-white text-sm flex items-center gap-2">
              <CreditCard size={16} className="text-blue-400" />
              <span>Record Payment</span>
            </h2>
            {/* Quick Fill buttons */}
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickFill(balance, "FULL")}
                className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded transition-colors"
                title="Pay full remaining balance"
              >
                Full
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill(balance / 2, "PARTIAL")}
                className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded transition-colors"
                title="Pay 50% of remaining balance"
              >
                50%
              </button>
            </div>
          </div>

          <form onSubmit={handleRecordPayment} className="p-4 space-y-3.5">
            <div>
              <label className="block text-xs text-secondary font-medium uppercase tracking-wider mb-1">
                Amount Paid (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={balance}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
              <p className="text-[11px] text-gray-400 mt-1">Maximum payable: ₹ {balance.toLocaleString("en-IN")}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-secondary font-medium uppercase tracking-wider mb-1">
                  Payment Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="ADVANCE">Advance Payment</option>
                  <option value="PARTIAL">Partial Payment</option>
                  <option value="FULL">Full Settlement</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-secondary font-medium uppercase tracking-wider mb-1">
                  Payment Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-secondary font-medium uppercase tracking-wider mb-1">
                Payment Method *
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="BANK_TRANSFER">NEFT / RTGS / IMPS (Bank Transfer)</option>
                <option value="CHEQUE">Cheque / Demand Draft</option>
                <option value="ONLINE">Online Payment / UPI</option>
                <option value="CASH">Cash</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-secondary font-medium uppercase tracking-wider mb-1">
                Reference / UTR / Cheque No
              </label>
              <input
                type="text"
                placeholder="e.g. UTR12345678, CHQ-99012"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-secondary font-medium uppercase tracking-wider mb-1">
                Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="Additional payment details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2.5 rounded text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Recording Payment...</span>
                </>
              ) : (
                <>
                  <IndianRupee size={16} />
                  <span>Record Payment of ₹{parseFloat(amount || 0).toLocaleString("en-IN")}</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Payment History Card */}
      <div className="bg-admin-surface/5 rounded-lg shadow-lg border border-white/10 overflow-hidden backdrop-blur-sm">
        <div className="p-4 border-b border-white/10 bg-black/20 flex justify-between items-center">
          <h2 className="font-semibold text-white flex items-center gap-2 text-sm">
            <History size={16} className="text-green-400" />
            <span>Payment History</span>
          </h2>
          <span className="text-[11px] text-gray-400">{payments.length} transaction(s)</span>
        </div>
        <div className="p-0">
          <ul className="divide-y divide-white/5">
            {payments.length > 0 ? (
              payments.map((payment) => (
                <li key={payment.id} className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <span className="font-bold text-green-400 text-sm">
                        ₹ {payment.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                      {payment.type && (
                        <span className="ml-2 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/10 text-gray-300">
                          {payment.type}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{new Date(payment.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
                    <span className="px-2 py-0.5 rounded bg-black/30 border border-white/5">
                      {payment.method.replace("_", " ")}
                    </span>
                    <span>Ref: {payment.reference || "—"}</span>
                  </div>
                  {payment.notes && <p className="text-[11px] text-gray-400 italic mt-1.5">{payment.notes}</p>}
                </li>
              ))
            ) : (
              <li className="p-6 text-center text-secondary text-sm italic">No payments recorded yet.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
