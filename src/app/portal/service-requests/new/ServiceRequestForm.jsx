"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, AlertCircle, Loader2, Shield } from "lucide-react";
import Link from "next/link";
import { createCustomerServiceRequestAction } from "@/app/actions/portal";

export default function ServiceRequestForm({ equipmentList = [], preselectedEquipmentId = "" }) {
  const router = useRouter();

  const [equipmentId, setEquipmentId] = useState(preselectedEquipmentId);
  const [category, setCategory] = useState("Breakdown / Emergency Repair");
  const [priority, setPriority] = useState("MEDIUM");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!description.trim()) {
      setError("Please describe the issue or service requirements.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      if (equipmentId) formData.append("equipmentId", equipmentId);
      formData.append("category", category);
      formData.append("priority", priority);
      formData.append("description", description.trim());

      const res = await createCustomerServiceRequestAction(formData);
      if (!res.success) {
        setError(res.error || "Failed to submit service request.");
      } else {
        router.push("/portal/service-requests");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-12 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/portal/service-requests"
          className="p-2 border border-white/10 rounded-md text-secondary hover:bg-white/5 transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield size={22} className="text-purple-400" />
            <span>Raise Service Request</span>
          </h1>
          <p className="text-secondary text-sm mt-0.5">
            Submit a maintenance or repair ticket directly to our rapid response operations team.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-3">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white/5 rounded-lg border border-white/10 p-6 space-y-5 backdrop-blur-sm shadow-xl">
        <div>
          <label className="block text-xs font-semibold text-secondary uppercase mb-1.5">
            Affected Equipment / Machinery
          </label>
          <select
            value={equipmentId}
            onChange={(e) => setEquipmentId(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded px-3.5 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none"
          >
            <option value="">-- General Facility / Piping / Unregistered Asset --</option>
            {equipmentList.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.type} ({eq.model ? `${eq.model} - ` : ""}S/N: {eq.serialNumber || "N/A"}) - {eq.location || "Site"}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-gray-500 mt-1">
            Selecting a registered machine automatically links warranty and service history.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-secondary uppercase mb-1.5">
              Service Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded px-3.5 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none"
              required
            >
              <option value="Breakdown / Emergency Repair">Breakdown / Emergency Repair</option>
              <option value="Preventative Maintenance Visit">Preventative Maintenance Visit</option>
              <option value="Leakage & Piping Rectification">Leakage & Piping Rectification</option>
              <option value="Vibration & Noise Diagnostic">Vibration & Noise Diagnostic</option>
              <option value="Hydrotest & Pressure Inspection">Hydrotest & Pressure Inspection</option>
              <option value="Structural / Fabrication Repair">Structural / Fabrication Repair</option>
              <option value="General Technical Consultation">General Technical Consultation</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary uppercase mb-1.5">
              Operational Urgency / Priority *
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded px-3.5 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none"
              required
            >
              <option value="LOW">Low (Routine maintenance inquiry)</option>
              <option value="MEDIUM">Medium (Standard scheduled turnaround)</option>
              <option value="HIGH">High (Production impaired / major leakage)</option>
              <option value="URGENT">Urgent (Plant shutdown / critical breakdown)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-secondary uppercase mb-1.5">
            Problem Description & Symptoms *
          </label>
          <textarea
            rows={5}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please detail the issue observed, operating conditions (pressure, temp, fluid), error codes, and symptoms..."
            className="w-full bg-black/40 border border-white/10 rounded p-3.5 text-sm text-white focus:border-purple-500 focus:outline-none leading-relaxed"
          />
        </div>

        {/* Upload-free guarantee: No file upload fields exist */}

        <div className="pt-3 border-t border-white/10 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-2.5 rounded text-sm transition-colors flex items-center gap-2 shadow cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Submitting Request...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Submit Service Request</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
