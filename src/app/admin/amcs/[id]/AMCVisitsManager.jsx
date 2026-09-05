'use client';

import { useState } from 'react';
import { Calendar, User, CheckCircle, Plus, X, UserCheck } from 'lucide-react';
import { generateAMCVisits, assignTechnicianToVisit, cancelServiceVisit } from '@/app/actions/fieldService';

export default function AMCVisitsManager({ amcId, frequency, visits = [], technicians = [] }) {
  const [generating, setGenerating] = useState(false);
  const [assigningVisitId, setAssigningVisitId] = useState(null);
  const [selectedTech, setSelectedTech] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [visitTimeSlot, setVisitTimeSlot] = useState('10:00 - 13:00');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleGenerate = async () => {
    setGenerating(true);
    setMessage('');
    try {
      const res = await generateAMCVisits(amcId);
      if (res.success) {
        setMessage(`Successfully generated ${res.count} scheduled visits for this contract.`);
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('visitId', assigningVisitId);
      formData.append('technicianId', selectedTech);
      if (visitDate) formData.append('date', visitDate);
      if (visitTimeSlot) formData.append('timeSlot', visitTimeSlot);
      formData.append('status', selectedTech ? 'ASSIGNED' : 'SCHEDULED');

      const res = await assignTechnicianToVisit(formData);
      if (res.success) {
        setAssigningVisitId(null);
        setMessage('Technician assignment updated.');
      }
    } catch (err) {
      setMessage(`Assignment failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelVisit = async (id) => {
    if (!confirm('Are you sure you want to cancel this scheduled service visit?')) return;
    try {
      await cancelServiceVisit(id, 'Cancelled via AMC management');
      setMessage('Service visit cancelled.');
    } catch (err) {
      setMessage(`Failed to cancel: ${err.message}`);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-green-500/10 text-green-400 border border-green-500/20">COMPLETED</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">IN PROGRESS</span>;
      case 'ASSIGNED':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">ASSIGNED</span>;
      case 'CANCELLED':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-red-500/10 text-red-400 border border-red-500/20">CANCELLED</span>;
      default:
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-white/10 text-gray-300 border border-white/20">SCHEDULED</span>;
    }
  };

  return (
    <div className="bg-admin-surface/5 rounded-lg shadow-lg border border-white/10 overflow-hidden backdrop-blur-sm">
      <div className="p-5 border-b border-white/10 bg-black/20 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Calendar size={18} className="text-green-400" />
            Scheduled Maintenance Visits ({visits.length})
          </h2>
          <p className="text-xs text-secondary mt-0.5">
            Frequency: <span className="text-white font-medium">{frequency}</span>
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-4 py-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-xs font-semibold rounded flex items-center gap-2 transition-colors shadow-sm"
        >
          {generating ? 'Calculating Schedule...' : (
            <>
              <Plus size={14} />
              {visits.length === 0 ? 'Generate Scheduled Visits' : 'Sync / Check Missing Visits'}
            </>
          )}
        </button>
      </div>

      {message && (
        <div className="p-3 mx-5 mt-4 text-xs rounded bg-white/5 border border-white/10 text-gray-200">
          {message}
        </div>
      )}

      <div className="p-5">
        {visits.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-white/20 rounded bg-black/20">
            <Calendar size={28} className="mx-auto text-admin-muted mb-2 opacity-50" />
            <p className="text-sm text-gray-300">No scheduled visits recorded yet.</p>
            <p className="text-xs text-secondary mt-1">
              Click &quot;Generate Scheduled Visits&quot; above to auto-schedule routine maintenance across this contract.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase bg-black/30 text-secondary border-b border-white/10">
                <tr>
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Time Slot</th>
                  <th className="py-3 px-3">Assigned Technician</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Sign-off</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {visits.map((visit, idx) => (
                  <tr key={visit.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 text-xs text-secondary">{idx + 1}</td>
                    <td className="py-3 px-3 font-medium text-white">
                      {new Date(visit.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3 px-3 text-xs text-gray-400">
                      {visit.timeSlot || '10:00 - 13:00'}
                    </td>
                    <td className="py-3 px-3 text-xs">
                      {visit.technician ? (
                        <span className="flex items-center gap-1.5 text-blue-300 font-medium">
                          <User size={13} />
                          {visit.technician.name || visit.technician.email}
                        </span>
                      ) : (
                        <span className="text-admin-muted italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-3">{getStatusBadge(visit.status)}</td>
                    <td className="py-3 px-3 text-xs">
                      {visit.customerAcknowledgement ? (
                        <span className="text-green-400 font-medium flex items-center gap-1">
                          <CheckCircle size={13} />
                          {visit.acknowledgedBy || 'Acknowledged'}
                        </span>
                      ) : (
                        <span className="text-secondary text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {visit.status !== 'COMPLETED' && visit.status !== 'CANCELLED' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setAssigningVisitId(visit.id);
                              setSelectedTech(visit.technicianId || '');
                              setVisitDate(new Date(visit.date).toISOString().split('T')[0]);
                              setVisitTimeSlot(visit.timeSlot || '10:00 - 13:00');
                            }}
                            className="px-2.5 py-1 text-xs bg-white/10 hover:bg-white/20 text-white rounded transition-colors"
                          >
                            Assign / Reschedule
                          </button>
                          <button
                            onClick={() => handleCancelVisit(visit.id)}
                            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                            title="Cancel Visit"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {assigningVisitId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-admin-surface border border-white/10 rounded-lg max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <UserCheck size={18} className="text-accent" />
                Assign Technician & Reschedule
              </h3>
              <button
                onClick={() => setAssigningVisitId(null)}
                className="text-secondary hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-secondary font-medium mb-1.5">
                  Select Technician
                </label>
                <select
                  value={selectedTech}
                  onChange={(e) => setSelectedTech(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                >
                  <option value="">-- Leave Unassigned --</option>
                  {technicians.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.name ? `${tech.name} (${tech.email})` : tech.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase text-secondary font-medium mb-1.5">
                    Visit Date
                  </label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase text-secondary font-medium mb-1.5">
                    Time Slot
                  </label>
                  <input
                    type="text"
                    value={visitTimeSlot}
                    onChange={(e) => setVisitTimeSlot(e.target.value)}
                    placeholder="e.g. 10:00 - 13:00"
                    className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setAssigningVisitId(null)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
