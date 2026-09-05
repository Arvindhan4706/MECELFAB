'use client';

import { useState } from 'react';
import { Package, Plus, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';
import { issuePartToWorkOrder, returnPartFromWorkOrder } from '@/app/actions/inventory';

export default function WorkOrderPartsManager({ workOrderId, availableParts = [], stockMovements = [] }) {
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [returningPartId, setReturningPartId] = useState(null);
  const [selectedPartId, setSelectedPartId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [returnQty, setReturnQty] = useState(1);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // Group movements by part to calculate net issued
  const partUsageMap = {};
  for (const m of stockMovements) {
    if (!m.part) continue;
    if (!partUsageMap[m.partId]) {
      partUsageMap[m.partId] = {
        part: m.part,
        issued: 0,
        returned: 0
      };
    }
    if (m.type === 'ISSUED') {
      partUsageMap[m.partId].issued += m.quantity;
    } else if (m.type === 'RETURNED') {
      partUsageMap[m.partId].returned += m.quantity;
    }
  }

  const allocatedParts = Object.values(partUsageMap).map((entry) => ({
    ...entry,
    netUsed: entry.issued - entry.returned
  }));

  const selectedPart = availableParts.find((p) => p.id === selectedPartId);

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPartId) {
      alert('Please select a spare part to issue.');
      return;
    }
    if (quantity <= 0) {
      alert('Quantity must be greater than zero.');
      return;
    }

    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const formData = new FormData();
      formData.append('workOrderId', workOrderId);
      formData.append('partId', selectedPartId);
      formData.append('quantity', quantity.toString());
      formData.append('note', note);

      const res = await issuePartToWorkOrder(formData);
      if (res.success) {
        setMessage(`Successfully issued ${quantity} units of ${selectedPart?.name || 'part'}.`);
        setShowIssueModal(false);
        setSelectedPartId('');
        setQuantity(1);
        setNote('');
      }
    } catch (err) {
      setIsError(true);
      setMessage(`Issue failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const formData = new FormData();
      formData.append('workOrderId', workOrderId);
      formData.append('partId', returningPartId);
      formData.append('quantity', returnQty.toString());
      formData.append('note', note || 'Unused parts returned to stock');

      const res = await returnPartFromWorkOrder(formData);
      if (res.success) {
        setMessage(`Returned ${returnQty} unused units back to inventory.`);
        setReturningPartId(null);
        setReturnQty(1);
        setNote('');
      }
    } catch (err) {
      setIsError(true);
      setMessage(`Return failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-admin-surface/5 rounded-lg shadow-lg border border-white/10 overflow-hidden backdrop-blur-sm">
      <div className="p-5 border-b border-white/10 bg-black/20 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Package size={18} className="text-amber-400" />
            Allocated Spare Parts & Materials
          </h2>
          <p className="text-xs text-secondary mt-0.5">
            Traceable parts issued to this work order with automatic inventory deduction.
          </p>
        </div>

        <button
          onClick={() => {
            setShowIssueModal(true);
            setMessage('');
          }}
          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs rounded flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Plus size={14} />
          Issue Part to Job
        </button>
      </div>

      {message && (
        <div
          className={`p-3 mx-5 mt-4 text-xs rounded border flex items-center gap-2 ${
            isError
              ? 'bg-red-500/10 border-red-500/20 text-red-200'
              : 'bg-green-500/10 border-green-500/20 text-green-300'
          }`}
        >
          {isError ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
          <span>{message}</span>
        </div>
      )}

      <div className="p-5">
        {allocatedParts.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-white/20 rounded bg-black/20">
            <Package size={24} className="mx-auto text-admin-muted mb-2 opacity-50" />
            <p className="text-sm text-gray-300">No parts currently issued to this work order.</p>
            <p className="text-xs text-secondary mt-1">
              Click &quot;Issue Part to Job&quot; above to allocate filters, bearings, oils, or components.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase bg-black/30 text-secondary border-b border-white/10">
                <tr>
                  <th className="py-2.5 px-3">Part Details</th>
                  <th className="py-2.5 px-3 text-center">Issued</th>
                  <th className="py-2.5 px-3 text-center">Returned</th>
                  <th className="py-2.5 px-3 text-center">Net Consumed</th>
                  <th className="py-2.5 px-3 text-right">Return Unused</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {allocatedParts.map((item) => (
                  <tr key={item.part.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-semibold text-white">{item.part.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{item.part.partNumber}</p>
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-white">{item.issued}</td>
                    <td className="py-3 px-3 text-center text-secondary">{item.returned}</td>
                    <td className="py-3 px-3 text-center font-bold text-amber-400">{item.netUsed}</td>
                    <td className="py-3 px-3 text-right">
                      {item.netUsed > 0 && (
                        <button
                          onClick={() => {
                            setReturningPartId(item.part.id);
                            setReturnQty(1);
                            setMessage('');
                          }}
                          className="px-2.5 py-1 text-xs bg-white/10 hover:bg-white/20 text-white rounded flex items-center gap-1 ml-auto transition-colors"
                        >
                          <RotateCcw size={12} /> Return ({item.netUsed} available)
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-admin-surface border border-white/10 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-semibold text-white text-base mb-4 pb-2 border-b border-white/10 flex items-center gap-2">
              <Package size={18} className="text-amber-400" /> Issue Spare Part
            </h3>

            <form onSubmit={handleIssueSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-secondary font-medium mb-1.5">
                  Select Part from Inventory
                </label>
                <select
                  value={selectedPartId}
                  onChange={(e) => setSelectedPartId(e.target.value)}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="">-- Choose Spare Part --</option>
                  {availableParts.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.quantity <= 0}>
                      {p.name} ({p.partNumber}) — {p.quantity > 0 ? `${p.quantity} in stock` : 'OUT OF STOCK'}
                    </option>
                  ))}
                </select>
                {selectedPart && (
                  <p className="text-xs text-secondary mt-1">
                    Available Stock: <strong className="text-white">{selectedPart.quantity} units</strong> (Min threshold: {selectedPart.minimumStock})
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs uppercase text-secondary font-medium mb-1.5">
                  Quantity to Issue
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedPart ? selectedPart.quantity : 9999}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-secondary font-medium mb-1.5">
                  Purpose / Note (Optional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Scheduled oil filter replacement"
                  className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || (selectedPart && selectedPart.quantity < quantity)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold rounded disabled:opacity-50"
                >
                  {loading ? 'Deducting Stock...' : 'Confirm Stock Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {returningPartId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-admin-surface border border-white/10 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-semibold text-white text-base mb-4 pb-2 border-b border-white/10 flex items-center gap-2">
              <RotateCcw size={18} className="text-green-400" /> Return Unused Part to Stock
            </h3>

            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-secondary font-medium mb-1.5">
                  Quantity to Return
                </label>
                <input
                  type="number"
                  min="1"
                  max={partUsageMap[returningPartId]?.issued - partUsageMap[returningPartId]?.returned || 1}
                  value={returnQty}
                  onChange={(e) => setReturnQty(parseInt(e.target.value, 10) || 1)}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-green-400"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-secondary font-medium mb-1.5">
                  Reason for Return
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Extra unit not required after diagnostic"
                  className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-green-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setReturningPartId(null)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded disabled:opacity-50"
                >
                  {loading ? 'Restoring Stock...' : 'Return to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
