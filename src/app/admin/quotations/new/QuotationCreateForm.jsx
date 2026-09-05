"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft, Save, Calculator, User, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { createQuotationAction } from "@/app/actions/commercial";

export default function QuotationCreateForm({ customers = [], inquiries = [] }) {
  const router = useRouter();

  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [service, setService] = useState("Industrial Fabrication & Erection");
  const [validityDays, setValidityDays] = useState(30);
  const [scopeOfWork, setScopeOfWork] = useState("");
  const [termsConditions, setTermsConditions] = useState(
    "1. 50% advance payment along with official Purchase Order.\n2. Balance 50% payment against proforma invoice before dispatch / site handover.\n3. Taxes as applicable at current statutory rates.\n4. Delivery timeline as per engineering schedule."
  );

  const [items, setItems] = useState([
    { id: 1, description: "Structural Fabrication & Assembly", quantity: 1, unitPrice: 0 },
  ]);
  const [taxRate, setTaxRate] = useState(18);
  const [discount, setDiscount] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Customer selection autofill
  const handleCustomerSelect = (customerId) => {
    setSelectedCustomerId(customerId);
    if (!customerId) return;
    const found = customers.find((c) => c.id === customerId);
    if (found) {
      setCustomerName(found.contactPerson || "");
      setCompanyName(found.companyName || "");
      setEmail(found.email || "");
      setPhone(found.phone || "");
      setAddress(found.location || "");
    }
  };

  // Inquiry selection autofill
  const handleInquirySelect = (inquiryId) => {
    if (!inquiryId) return;
    const found = inquiries.find((i) => i.id === inquiryId);
    if (found) {
      setCustomerName(found.name || "");
      setCompanyName(found.company || "");
      setEmail(found.email || "");
      setPhone(found.phone || "");
      setAddress(found.location || "");
      if (found.service) setService(found.service);
      if (found.message) setScopeOfWork(found.message);
    }
  };

  // Mathematical computations (Decimal-safe)
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => {
      const q = Math.max(1, parseInt(item.quantity) || 1);
      const p = parseFloat(item.unitPrice) || 0;
      return acc + q * p;
    }, 0);
  }, [items]);

  const taxAmount = useMemo(() => {
    return Math.round((subtotal * (taxRate / 100) + Number.EPSILON) * 100) / 100;
  }, [subtotal, taxRate]);

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

    if (!customerName.trim() || !email.trim()) {
      setError("Customer name and email are required.");
      return;
    }
    if (!service.trim() || !scopeOfWork.trim()) {
      setError("Service title and scope of work are required.");
      return;
    }
    if (items.some((it) => !it.description.trim() || it.unitPrice <= 0)) {
      setError("All line items must have a valid description and a unit price greater than 0.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (selectedCustomerId) formData.append("customerId", selectedCustomerId);
      formData.append("customerName", customerName.trim());
      formData.append("companyName", companyName.trim());
      formData.append("email", email.trim());
      formData.append("phone", phone.trim());
      formData.append("address", address.trim());
      formData.append("service", service.trim());
      formData.append("scopeOfWork", scopeOfWork.trim());
      formData.append("termsConditions", termsConditions.trim());
      formData.append("validityDays", validityDays.toString());
      formData.append("taxRate", taxRate.toString());
      formData.append("discount", discount.toString());
      formData.append("items", JSON.stringify(items));

      const res = await createQuotationAction(formData);
      if (!res.success) {
        setError(res.error || "Failed to create quotation.");
      } else {
        router.push(`/admin/quotations/${res.quotationId}`);
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-12 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/quotations"
          className="p-2 border border-admin-border rounded-md text-admin-muted hover:bg-admin-elevated transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-admin-heading">Create New Quotation</h1>
          <p className="text-admin-muted text-sm mt-1">Generate a commercial proposal with line items & GST</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-3">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Autofill selectors */}
        <div className="bg-admin-surface rounded-lg shadow-sm border border-admin-border p-5">
          <h2 className="font-semibold text-admin-heading text-sm mb-3 flex items-center gap-2">
            <User size={16} className="text-indigo-500" />
            <span>Customer & Inquiry Selection (Optional Quick Fill)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-admin-muted uppercase mb-1">Select Existing Customer</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => handleCustomerSelect(e.target.value)}
                className="w-full border border-admin-border rounded px-3 py-2 text-sm bg-admin-surface text-admin-heading focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Choose an existing customer or fill manually below --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName ? `${c.companyName} (${c.contactPerson})` : c.contactPerson}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-admin-muted uppercase mb-1">Or Link Recent Inquiry</label>
              <select
                onChange={(e) => handleInquirySelect(e.target.value)}
                className="w-full border border-admin-border rounded px-3 py-2 text-sm bg-admin-surface text-admin-heading focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Choose an inquiry --</option>
                {inquiries.map((inq) => (
                  <option key={inq.id} value={inq.id}>
                    {inq.referenceNumber} - {inq.name} ({inq.company || inq.service})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-admin-surface rounded-lg shadow-sm border border-admin-border overflow-hidden">
          <div className="p-4 border-b border-admin-border bg-admin-elevated">
            <h2 className="font-semibold text-admin-heading text-sm">Customer Details</h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-admin-muted uppercase mb-1">Customer / Contact Person *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                placeholder="e.g. Ramesh Kumar"
                className="w-full border border-admin-border rounded px-3 py-2 text-sm bg-admin-surface text-admin-heading focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-admin-muted uppercase mb-1">Company / Organization</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Client Enterprise / Company Name"
                className="w-full border border-admin-border rounded px-3 py-2 text-sm bg-admin-surface text-admin-heading focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-admin-muted uppercase mb-1">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="client@company.com"
                className="w-full border border-admin-border rounded px-3 py-2 text-sm bg-admin-surface text-admin-heading focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-admin-muted uppercase mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="w-full border border-admin-border rounded px-3 py-2 text-sm bg-admin-surface text-admin-heading focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-admin-muted uppercase mb-1">Site / Billing Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Plant / Site / Office Address"
                className="w-full border border-admin-border rounded px-3 py-2 text-sm bg-admin-surface text-admin-heading focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Project Scope */}
        <div className="bg-admin-surface rounded-lg shadow-sm border border-admin-border overflow-hidden">
          <div className="p-4 border-b border-admin-border bg-admin-elevated">
            <h2 className="font-semibold text-admin-heading text-sm">Project Specification</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-admin-muted uppercase mb-1">Service / Project Title *</label>
                <input
                  type="text"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  required
                  className="w-full border border-admin-border rounded px-3 py-2 text-sm bg-admin-surface text-admin-heading focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-admin-muted uppercase mb-1">Validity (Days) *</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={validityDays}
                  onChange={(e) => setValidityDays(parseInt(e.target.value) || 30)}
                  required
                  className="w-full border border-admin-border rounded px-3 py-2 text-sm bg-admin-surface text-admin-heading focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-admin-muted uppercase mb-1">Scope of Work *</label>
              <textarea
                rows={3}
                value={scopeOfWork}
                onChange={(e) => setScopeOfWork(e.target.value)}
                required
                placeholder="Detail technical requirements, specifications, deliverables..."
                className="w-full border border-admin-border rounded p-3 text-sm bg-admin-surface text-admin-heading focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-admin-muted uppercase mb-1">Terms & Conditions</label>
              <textarea
                rows={3}
                value={termsConditions}
                onChange={(e) => setTermsConditions(e.target.value)}
                className="w-full border border-admin-border rounded p-3 text-sm bg-admin-surface text-admin-heading focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="bg-admin-surface rounded-lg shadow-sm border border-admin-border overflow-hidden">
          <div className="p-4 border-b border-admin-border bg-admin-elevated flex justify-between items-center">
            <h2 className="font-semibold text-admin-heading text-sm">Quotation Line Items</h2>
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded transition-colors cursor-pointer"
            >
              <Plus size={14} /> Add Line Item
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-admin-elevated/50 border-b border-admin-border text-admin-muted text-xs uppercase">
                  <th className="py-3 px-4 w-1/2">Description</th>
                  <th className="py-3 px-4 w-24 text-center">Qty</th>
                  <th className="py-3 px-4 w-36 text-right">Unit Rate (₹)</th>
                  <th className="py-3 px-4 w-36 text-right">Total (₹)</th>
                  <th className="py-3 px-4 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border/50">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="p-3">
                      <input
                        type="text"
                        required
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                        placeholder="Item / service description"
                        className="w-full border border-admin-border rounded px-3 py-2 text-sm bg-admin-surface text-admin-heading focus:border-indigo-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, "quantity", e.target.value)}
                        className="w-full border border-admin-border rounded px-3 py-2 text-sm bg-admin-surface text-admin-heading focus:border-indigo-500 focus:outline-none text-center"
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
                        className="w-full border border-admin-border rounded px-3 py-2 text-sm bg-admin-surface text-admin-heading focus:border-indigo-500 focus:outline-none text-right"
                      />
                    </td>
                    <td className="p-3 text-right font-medium text-admin-heading text-sm align-middle">
                      ₹ {(item.quantity * item.unitPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-center align-middle">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={items.length === 1}
                        className="text-admin-muted hover:text-red-500 disabled:opacity-30 p-1 cursor-pointer"
                        title="Remove item"
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

        {/* Financial Calculation & Submission */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-admin-surface rounded-lg shadow-sm border border-admin-border p-5 space-y-4">
            <h3 className="font-semibold text-admin-heading text-sm flex items-center gap-2">
              <Calculator size={16} className="text-indigo-500" />
              <span>Tax & Commercial Adjustments</span>
            </h3>
            <div>
              <label className="block text-xs font-semibold text-admin-muted uppercase mb-1">GST Rate (%)</label>
              <div className="flex gap-4 items-center">
                <input
                  type="range"
                  min="0"
                  max="28"
                  step="1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <span className="font-bold text-admin-heading w-12 text-right">{taxRate}%</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-admin-muted uppercase mb-1">Discount Amount (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-full border border-admin-border rounded px-3 py-2 text-sm bg-admin-surface text-admin-heading focus:border-indigo-500 focus:outline-none text-right"
              />
            </div>
          </div>

          <div className="bg-admin-elevated rounded-lg shadow-sm border border-admin-border p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-admin-muted">
                <span>Subtotal:</span>
                <span>₹ {subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm text-admin-muted">
                <span>GST ({taxRate}%):</span>
                <span>+ ₹ {taxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-500 font-medium">
                  <span>Discount:</span>
                  <span>- ₹ {Number(discount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="pt-3 border-t border-admin-border flex justify-between items-center">
                <span className="font-bold text-base text-admin-heading">Grand Total:</span>
                <span className="text-2xl font-black text-indigo-600">
                  ₹ {grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-md transition-colors flex items-center justify-center gap-2 shadow cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Saving Quotation...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save & Generate Quotation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
