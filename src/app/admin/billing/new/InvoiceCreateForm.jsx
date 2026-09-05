"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  User,
  Wrench,
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { generateInvoiceAction } from "@/app/actions/commercial";

export default function InvoiceCreateForm({
  customers = [],
  workOrders = [],
  quotations = [],
}) {
  const router = useRouter();

  const [sourceType, setSourceType] = useState("WORK_ORDER"); // "WORK_ORDER", "QUOTATION", "CUSTOM"
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState("");
  const [selectedQuotationId, setSelectedQuotationId] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  const [gstType, setGstType] = useState("INTRA_STATE");
  const [dueDateDays, setDueDateDays] = useState(30);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState([
    { id: 1, description: "Industrial Contracting Services", quantity: 1, unitPrice: 0 },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle Work Order selection
  const handleWorkOrderSelect = (woId) => {
    setSelectedWorkOrderId(woId);
    if (!woId) return;
    const wo = workOrders.find((w) => w.id === woId);
    if (wo) {
      setSelectedCustomerId(wo.customerId);
      setSelectedQuotationId(wo.quotationId || "");
      if (wo.quotation && wo.quotation.items && wo.quotation.items.length > 0) {
        setItems(
          wo.quotation.items.map((it) => ({
            id: it.id,
            description: it.description,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
          }))
        );
      } else {
        setItems([
          {
            id: 1,
            description: wo.service || "Contracting Services",
            quantity: 1,
            unitPrice: 0,
          },
        ]);
      }
    }
  };

  // Handle Quotation selection
  const handleQuotationSelect = (qId) => {
    setSelectedQuotationId(qId);
    if (!qId) return;
    const q = quotations.find((quote) => quote.id === qId);
    if (q) {
      if (q.customerId) setSelectedCustomerId(q.customerId);
      if (q.items && q.items.length > 0) {
        setItems(
          q.items.map((it) => ({
            id: it.id,
            description: it.description,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
          }))
        );
      }
    }
  };

  // Calculations
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => {
      const q = Math.max(1, parseInt(item.quantity) || 1);
      const p = parseFloat(item.unitPrice) || 0;
      return acc + q * p;
    }, 0);
  }, [items]);

  const isInterState = gstType === "INTER_STATE";
  const taxAmount = useMemo(() => {
    return Math.round((subtotal * 0.18 + Number.EPSILON) * 100) / 100;
  }, [subtotal]);

  const cgstAmount = isInterState ? 0 : Math.round((subtotal * 0.09 + Number.EPSILON) * 100) / 100;
  const sgstAmount = isInterState ? 0 : Math.round((subtotal * 0.09 + Number.EPSILON) * 100) / 100;
  const igstAmount = isInterState ? taxAmount : 0;

  const grandTotal = useMemo(() => {
    const d = parseFloat(discount) || 0;
    return Math.max(0, Math.round((subtotal + taxAmount - d + Number.EPSILON) * 100) / 100);
  }, [subtotal, taxAmount, discount]);

  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), description: "", quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter((it) => it.id !== id));
    }
  };

  const handleItemChange = (id, field, value) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            [field]: field === "description" ? value : parseFloat(value) || 0,
          };
        }
        return item;
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedCustomerId) {
      setError("Please select a customer for this invoice.");
      return;
    }

    if (items.some((it) => !it.description.trim() || it.unitPrice <= 0)) {
      setError("All line items must have a valid description and a unit rate greater than 0.");
      return;
    }

    setLoading(true);
    try {
      const res = await generateInvoiceAction({
        workOrderId: sourceType === "WORK_ORDER" ? selectedWorkOrderId || null : null,
        quotationId: sourceType === "QUOTATION" ? selectedQuotationId || null : null,
        customerId: selectedCustomerId,
        gstType,
        dueDateDays,
        discount: parseFloat(discount) || 0,
        notes,
        customItems: items,
      });

      if (!res.success) {
        setError(res.error || "Failed to generate invoice");
      } else {
        router.push(`/admin/billing/${res.invoiceId}`);
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-12 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/billing"
          className="p-2 border border-white/10 rounded-md text-secondary hover:bg-admin-surface/5 transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Create Tax Invoice</h1>
          <p className="text-secondary text-sm mt-1">Issue a formal GST invoice from a Work Order, Quotation, or directly</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-3">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Source Selection Tabs */}
        <div className="bg-admin-surface/5 rounded-lg border border-white/10 p-5 backdrop-blur-sm">
          <h2 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-3">
            Invoice Source Basis
          </h2>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <button
              type="button"
              onClick={() => setSourceType("WORK_ORDER")}
              className={`py-2.5 px-3 rounded text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${
                sourceType === "WORK_ORDER"
                  ? "bg-purple-600 text-white border-purple-500"
                  : "bg-black/30 text-gray-300 border-white/10 hover:bg-white/5"
              }`}
            >
              <Wrench size={15} /> From Work Order
            </button>
            <button
              type="button"
              onClick={() => setSourceType("QUOTATION")}
              className={`py-2.5 px-3 rounded text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${
                sourceType === "QUOTATION"
                  ? "bg-purple-600 text-white border-purple-500"
                  : "bg-black/30 text-gray-300 border-white/10 hover:bg-white/5"
              }`}
            >
              <FileText size={15} /> From Quotation
            </button>
            <button
              type="button"
              onClick={() => setSourceType("CUSTOM")}
              className={`py-2.5 px-3 rounded text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${
                sourceType === "CUSTOM"
                  ? "bg-purple-600 text-white border-purple-500"
                  : "bg-black/30 text-gray-300 border-white/10 hover:bg-white/5"
              }`}
            >
              <User size={15} /> Direct / Customer Only
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sourceType === "WORK_ORDER" && (
              <div>
                <label className="block text-xs font-semibold text-secondary uppercase mb-1">
                  Select Work Order *
                </label>
                <select
                  value={selectedWorkOrderId}
                  onChange={(e) => handleWorkOrderSelect(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                  required
                >
                  <option value="">-- Choose active work order --</option>
                  {workOrders.map((wo) => (
                    <option key={wo.id} value={wo.id}>
                      {wo.workOrderNumber} - {wo.customer.contactPerson} ({wo.customer.companyName || wo.service})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {sourceType === "QUOTATION" && (
              <div>
                <label className="block text-xs font-semibold text-secondary uppercase mb-1">
                  Select Quotation *
                </label>
                <select
                  value={selectedQuotationId}
                  onChange={(e) => handleQuotationSelect(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                  required
                >
                  <option value="">-- Choose quotation --</option>
                  {quotations.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.quotationNumber} - {q.customerName} (₹{q.grandTotal.toLocaleString("en-IN")})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-secondary uppercase mb-1">
                Bill To Customer *
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                required
              >
                <option value="">-- Select Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName ? `${c.companyName} (${c.contactPerson})` : c.contactPerson}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* GST Jurisdiction & Payment Terms */}
        <div className="bg-admin-surface/5 rounded-lg border border-white/10 p-5 backdrop-blur-sm space-y-4">
          <h2 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">
            Tax & Terms Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-secondary uppercase mb-1">
                GST Jurisdiction *
              </label>
              <select
                value={gstType}
                onChange={(e) => setGstType(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="INTRA_STATE">Intra-State: CGST (9%) + SGST (9%)</option>
                <option value="INTER_STATE">Inter-State: IGST (18%)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary uppercase mb-1">
                Payment Due Terms
              </label>
              <select
                value={dueDateDays}
                onChange={(e) => setDueDateDays(parseInt(e.target.value))}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
              >
                <option value={15}>Net 15 Days</option>
                <option value={30}>Net 30 Days (Standard)</option>
                <option value={45}>Net 45 Days</option>
                <option value={60}>Net 60 Days</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary uppercase mb-1">
                Discount (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none text-right"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary uppercase mb-1">
              Invoice Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Purchase order reference, bank instruction notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-admin-surface/5 rounded-lg border border-white/10 overflow-hidden backdrop-blur-sm">
          <div className="p-4 border-b border-white/10 bg-black/20 flex justify-between items-center">
            <h2 className="font-semibold text-white text-sm">Invoice Line Items</h2>
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 bg-purple-950/40 border border-purple-500/30 px-3 py-1.5 rounded transition-colors"
            >
              <Plus size={14} /> Add Line Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-black/10 text-secondary text-xs uppercase">
                  <th className="py-3 px-4 w-1/2">Description</th>
                  <th className="py-3 px-4 w-24 text-center">Qty</th>
                  <th className="py-3 px-4 w-36 text-right">Rate (₹)</th>
                  <th className="py-3 px-4 w-36 text-right">Total (₹)</th>
                  <th className="py-3 px-4 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="p-3">
                      <input
                        type="text"
                        required
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                        placeholder="Description of work or material"
                        className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, "quantity", e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none text-center"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(item.id, "unitPrice", e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none text-right"
                      />
                    </td>
                    <td className="p-3 text-right font-medium text-white text-sm align-middle">
                      ₹ {(item.quantity * item.unitPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-center align-middle">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={items.length === 1}
                        className="text-gray-400 hover:text-red-400 disabled:opacity-30 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calculation & Submit */}
        <div className="flex justify-end">
          <div className="w-full md:w-96 bg-admin-surface/5 border border-white/10 rounded-lg p-5 backdrop-blur-sm space-y-3">
            <div className="flex justify-between text-sm text-gray-300">
              <span>Taxable Subtotal:</span>
              <span>₹ {subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>

            {isInterState ? (
              <div className="flex justify-between text-sm text-gray-300">
                <span>IGST (18%):</span>
                <span>₹ {igstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between text-sm text-gray-300">
                  <span>CGST (9%):</span>
                  <span>₹ {cgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-300">
                  <span>SGST (9%):</span>
                  <span>₹ {sgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              </>
            )}

            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-400 font-medium">
                <span>Discount:</span>
                <span>- ₹ {Number(discount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            <div className="pt-3 border-t border-white/10 flex justify-between items-center text-white">
              <span className="font-bold text-base">Grand Total:</span>
              <span className="text-2xl font-black text-purple-400">
                ₹ {grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || items.length === 0}
              className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-md transition-colors flex items-center justify-center gap-2 shadow cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Issuing Tax Invoice...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Issue Tax Invoice</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
