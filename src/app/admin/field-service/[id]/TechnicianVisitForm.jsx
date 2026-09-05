'use client';

import { useState } from 'react';
import { Play, CheckCircle, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { startServiceVisit, completeServiceVisit } from '@/app/actions/fieldService';

export default function TechnicianVisitForm({ visit, isAssignedTechnician, isAdminOrManager }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [workPerformed, setWorkPerformed] = useState(visit.workPerformed || '');
  const [observations, setObservations] = useState(visit.observations || '');
  const [recommendations, setRecommendations] = useState(visit.recommendations || '');
  const [technicianNotes, setTechnicianNotes] = useState(visit.technicianNotes || '');
  const [partsUsed, setPartsUsed] = useState(visit.partsUsed || '');
  const [customerAck, setCustomerAck] = useState(visit.customerAcknowledgement || false);
  const [acknowledgedBy, setAcknowledgedBy] = useState(visit.acknowledgedBy || visit.customer?.contactPerson || '');

  const canEdit = (isAssignedTechnician || isAdminOrManager) && visit.status !== 'CANCELLED';

  const handleStart = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await startServiceVisit(visit.id);
      if (res.success) {
        setMessage('Service visit has been officially started. Status is now IN PROGRESS.');
      }
    } catch (err) {
      setMessage(`Failed to start: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!workPerformed.trim()) {
      alert('Please describe the work performed before completing the service visit.');
      return;
    }

    if (!customerAck) {
      if (!confirm('Customer acknowledgement checkbox is not checked. Complete visit anyway?')) {
        return;
      }
    }

    setLoading(true);
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('visitId', visit.id);
      formData.append('workPerformed', workPerformed);
      formData.append('observations', observations);
      formData.append('recommendations', recommendations);
      formData.append('technicianNotes', technicianNotes);
      formData.append('partsUsed', partsUsed);
      formData.append('customerAcknowledgement', customerAck ? 'true' : 'false');
      formData.append('acknowledgedBy', acknowledgedBy);

      const res = await completeServiceVisit(formData);
      if (res.success) {
        setMessage('Service visit completed successfully! Job report has been recorded.');
      }
    } catch (err) {
      setMessage(`Failed to complete visit: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-200 text-sm flex items-start gap-3">
          <AlertCircle size={18} className="text-blue-400 shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      )}

      {/* Step 1: Start Visit Button (if SCHEDULED or ASSIGNED) */}
      {(visit.status === 'SCHEDULED' || visit.status === 'ASSIGNED') && canEdit && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 text-center space-y-3">
          <Clock size={36} className="mx-auto text-amber-400" />
          <h3 className="text-lg font-semibold text-white">Ready to Begin On-Site Work?</h3>
          <p className="text-xs text-secondary max-w-md mx-auto">
            Clicking &quot;Start Service Visit&quot; records your arrival timestamp and switches the job order to In Progress.
          </p>
          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 bg-green-600 hover:bg-green-500 text-white font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 mx-auto shadow-lg shadow-green-900/30"
          >
            <Play size={16} />
            {loading ? 'Starting...' : 'Start Service Visit (Clock In)'}
          </button>
        </div>
      )}

      {/* Step 2: Field Reporting Form (if IN_PROGRESS or COMPLETED) */}
      {(visit.status === 'IN_PROGRESS' || visit.status === 'COMPLETED') && (
        <form onSubmit={handleCompleteSubmit} className="space-y-6">
          <div className="bg-admin-surface/5 border border-white/10 rounded-xl p-6 shadow-lg backdrop-blur-sm space-y-5">
            <h3 className="font-semibold text-white text-base border-b border-white/10 pb-3 flex items-center justify-between">
              <span>On-Site Maintenance Log</span>
              {visit.status === 'IN_PROGRESS' && (
                <span className="text-xs font-normal text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  Started at {visit.startTime || 'On Site'}
                </span>
              )}
            </h3>

            <div>
              <label className="block text-xs uppercase text-secondary font-medium mb-1.5">
                Work Performed * (Required)
              </label>
              <textarea
                value={workPerformed}
                onChange={(e) => setWorkPerformed(e.target.value)}
                disabled={visit.status === 'COMPLETED' || !canEdit}
                rows={4}
                required
                placeholder="e.g. Performed 250-hr routine service: inspected generator radiator, replaced fuel filters, checked voltage regulation and lube oil pressure..."
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-accent disabled:opacity-60"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase text-secondary font-medium mb-1.5">
                  Observations / Diagnostics
                </label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  disabled={visit.status === 'COMPLETED' || !canEdit}
                  rows={3}
                  placeholder="e.g. Normal operating temperature maintained; minor belt slack observed and adjusted."
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-secondary font-medium mb-1.5">
                  Recommendations & Next Steps
                </label>
                <textarea
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  disabled={visit.status === 'COMPLETED' || !canEdit}
                  rows={3}
                  placeholder="e.g. Recommend complete coolant flush during next quarterly service."
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent disabled:opacity-60"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase text-secondary font-medium mb-1.5">
                  Parts / Consumables Used
                </label>
                <input
                  type="text"
                  value={partsUsed}
                  onChange={(e) => setPartsUsed(e.target.value)}
                  disabled={visit.status === 'COMPLETED' || !canEdit}
                  placeholder="e.g. 1x Primary Fuel Filter (FF-5421), 15W-40 Lube Oil (15L)"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-secondary font-medium mb-1.5">
                  Technician Internal Notes
                </label>
                <input
                  type="text"
                  value={technicianNotes}
                  onChange={(e) => setTechnicianNotes(e.target.value)}
                  disabled={visit.status === 'COMPLETED' || !canEdit}
                  placeholder="Internal notes for maintenance team"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Customer Digital Sign-Off */}
          <div className="bg-admin-surface/5 border border-white/10 rounded-xl p-6 shadow-lg backdrop-blur-sm space-y-4">
            <h3 className="font-semibold text-white text-base border-b border-white/10 pb-3 flex items-center gap-2">
              <ShieldCheck size={18} className="text-accent" />
              Customer Sign-Off & Digital Acknowledgement
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase text-secondary font-medium mb-1.5">
                  Client Representative Name
                </label>
                <input
                  type="text"
                  value={acknowledgedBy}
                  onChange={(e) => setAcknowledgedBy(e.target.value)}
                  disabled={visit.status === 'COMPLETED' || !canEdit}
                  placeholder="Name of customer person on site"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent disabled:opacity-60"
                />
              </div>

              <div className="flex items-center pt-4 sm:pt-6">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={customerAck}
                    onChange={(e) => setCustomerAck(e.target.checked)}
                    disabled={visit.status === 'COMPLETED' || !canEdit}
                    className="mt-1 w-4 h-4 rounded border-white/20 bg-black/40 text-accent focus:ring-accent"
                  />
                  <span className="text-xs text-gray-300 font-light leading-relaxed">
                    Customer representative has inspected the machinery and confirmed the satisfactory completion of this maintenance visit.
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Complete Submission Button */}
          {visit.status === 'IN_PROGRESS' && canEdit && (
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 bg-accent hover:bg-accent-hover text-white text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
              >
                <CheckCircle size={16} />
                {loading ? 'Finalizing Job Report...' : 'Complete Visit & Submit Sign-Off'}
              </button>
            </div>
          )}

          {visit.status === 'COMPLETED' && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-300 text-xs flex items-center gap-3">
              <CheckCircle size={18} className="text-green-400 shrink-0" />
              <span>
                This visit was marked <strong>COMPLETED</strong> on {visit.completedAt ? new Date(visit.completedAt).toLocaleString() : 'Record'}.
                {visit.customerAcknowledgement && ` Acknowledged by ${visit.acknowledgedBy || 'Client'}.`}
              </span>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
