'use client';
import { useState, useMemo } from 'react';
import { Plus, Trash2, ArrowLeft, Save, Calculator } from 'lucide-react';
import Link from 'next/link';

export default function QuotationBuilder({ inquiry, saveQuotationAction }) {
  const [items, setItems] = useState([
    { id: 1, description: `Service: ${inquiry.service || 'General Works'}`, quantity: 1, unitPrice: 0 }
  ]);
  const [taxRate, setTaxRate] = useState(18); // Default 18% GST
  const [discount, setDiscount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Financial Math
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  }, [items]);

  const taxAmount = useMemo(() => {
    return subtotal * (taxRate / 100);
  }, [subtotal, taxRate]);

  const grandTotal = useMemo(() => {
    return (subtotal + taxAmount) - discount;
  }, [subtotal, taxAmount, discount]);

  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), description: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: field === 'description' ? value : parseFloat(value) || 0 };
      }
      return item;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    
    // Attach dynamic items and totals to the FormData
    formData.append('items', JSON.stringify(items));
    formData.append('subtotal', subtotal.toString());
    formData.append('taxAmount', taxAmount.toString());
    formData.append('grandTotal', grandTotal.toString());
    
    await saveQuotationAction(formData);
    setIsSubmitting(false);
  };

  return (
    <div className="pb-12 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link href={`/admin/inquiries/${inquiry.id}`} className="p-2 border border-gray-200 rounded-md text-gray-500 hover:bg-gray-50 transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Quotation</h1>
          <p className="text-gray-500 text-sm mt-1">Generate a formal proposal for {inquiry.referenceNumber}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input type="hidden" name="inquiryId" value={inquiry.id} />
        
        {/* Customer Information Snapshot */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-800 text-sm">Customer Details (Snapshot)</h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Customer Name *</label>
              <input type="text" name="customerName" defaultValue={inquiry.name} required className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Company Name</label>
              <input type="text" name="companyName" defaultValue={inquiry.company} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email *</label>
              <input type="email" name="email" defaultValue={inquiry.email} required className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Phone</label>
              <input type="text" name="phone" defaultValue={inquiry.phone} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Address</label>
              <input type="text" name="address" defaultValue={inquiry.location} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
        </div>

        {/* Quotation Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-800 text-sm">Project Scope</h2>
          </div>
          <div className="p-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Service Reference *</label>
                <input type="text" name="service" defaultValue={inquiry.service || 'Industrial Services'} required className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Validity (Days) *</label>
                <input type="number" name="validityDays" defaultValue={30} required className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Scope of Work *</label>
              <textarea name="scopeOfWork" rows="3" defaultValue={inquiry.message} required className="w-full border border-gray-300 rounded p-3 text-sm focus:border-blue-500 focus:outline-none"></textarea>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Terms & Conditions</label>
              <textarea name="termsConditions" rows="3" defaultValue="1. 50% advance payment required along with PO.&#13;&#10;2. Balance 50% against proforma invoice before dispatch.&#13;&#10;3. Delivery within agreed timeline from receipt of advance." className="w-full border border-gray-300 rounded p-3 text-sm focus:border-blue-500 focus:outline-none text-gray-600"></textarea>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800 text-sm">Line Items</h2>
            <button type="button" onClick={handleAddItem} className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded transition-colors">
              <Plus size={14} /> Add Item
            </button>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase w-1/2">Description</th>
                  <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase w-24">Qty</th>
                  <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase w-32">Unit Price (₹)</th>
                  <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase w-32 text-right">Total (₹)</th>
                  <th className="py-3 px-5 w-16 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="p-3">
                      <input type="text" required value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} placeholder="Item description" className="w-full border-gray-300 border rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                    </td>
                    <td className="p-3">
                      <input type="number" min="1" required value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} className="w-full border-gray-300 border rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none text-center" />
                    </td>
                    <td className="p-3">
                      <input type="number" min="0" step="0.01" required value={item.unitPrice} onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)} className="w-full border-gray-300 border rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none text-right" />
                    </td>
                    <td className="p-3 text-right font-medium text-gray-900 text-sm align-middle">
                      {(item.quantity * item.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-center align-middle">
                      <button type="button" onClick={() => handleRemoveItem(item.id)} disabled={items.length === 1} className="text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-gray-400 p-1">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financials & Submission */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
              <Calculator size={16} className="text-blue-500" />
              <h2 className="font-semibold text-gray-800 text-sm">Financial Adjustments</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tax Rate (%)</label>
                <div className="flex gap-4 items-center">
                  <input type="range" name="taxRate" min="0" max="28" step="1" value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value))} className="flex-1" />
                  <span className="font-bold text-gray-900 w-12 text-right">{taxRate}%</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Discount Amount (₹)</label>
                <input type="number" name="discount" min="0" step="0.01" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none text-right" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-800 overflow-hidden text-white flex flex-col">
            <div className="p-5 flex-1 space-y-3">
              <div className="flex justify-between items-center text-gray-400 text-sm">
                <span>Subtotal</span>
                <span>₹ {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-gray-400 text-sm">
                <span>Tax ({taxRate}%)</span>
                <span>+ ₹ {taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-green-400 text-sm">
                  <span>Discount</span>
                  <span>- ₹ {discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="pt-4 mt-2 border-t border-gray-700 flex justify-between items-center">
                <span className="text-lg font-bold">Grand Total</span>
                <span className="text-2xl font-bold text-blue-400">₹ {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="p-4 bg-black/30">
              <button type="submit" disabled={isSubmitting || items.length === 0} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                {isSubmitting ? 'Generating Quotation...' : <><Save size={18} /> Save & Generate Quotation</>}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
