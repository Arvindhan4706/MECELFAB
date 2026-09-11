'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';

const SERVICES = [
  'Generator Installation & Commissioning',
  'Generator Maintenance & AMC',
  'Electrical Panel Works',
  'Hydraulic System Services',
  'AMC Renewal',
  'Emergency Breakdown Service',
  'Preventive Maintenance',
  'Transformer Services',
  'DG Set Servicing',
  'Other / General Inquiry',
];

const URGENCIES = [
  { id: 'LOW',    label: 'Low',    desc: 'Within 2–4 weeks' },
  { id: 'MEDIUM', label: 'Medium', desc: 'Within 1 week' },
  { id: 'HIGH',   label: 'High',   desc: 'Within 2–3 days' },
  { id: 'URGENT', label: 'Urgent', desc: 'Emergency / ASAP' },
];

const TIMELINES = ['Immediate', '1–2 Weeks', '1 Month', '2–3 Months', 'Flexible'];
const CONTACT_METHODS = ['Email', 'Phone', 'WhatsApp'];
const STEPS = ['Service Details', 'Requirements', 'Contact & Submit'];

function StepBar({ current }) {
  return (
    <div className="mb-7">
      <div className="flex items-center gap-0 mb-3">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center flex-1">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 border transition-colors ${
                i < current ? 'bg-white text-black border-white'
                : i === current ? 'bg-white text-black border-white'
                : 'bg-transparent text-zinc-600 border-zinc-700'
              }`}>
                {i < current ? <CheckCircle size={13} /> : i + 1}
              </div>
              <span className={`text-xs font-medium ${i <= current ? 'text-white' : 'text-zinc-600'}`}>{step}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-3 ${i < current ? 'bg-white/20' : 'bg-zinc-800'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function FieldLabel({ children, required }) {
  return (
    <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

const inputCls = "w-full px-3 py-3 bg-zinc-900 border border-white/[0.10] rounded-md text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-white/30 transition-colors";

export default function RequestForm({ session }) {
  const searchParams = useSearchParams();
  const preType = searchParams.get('type');

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    service: preType === 'amc' ? 'AMC Renewal' : '',
    urgency: 'MEDIUM',
    equipmentInfo: '',
    description: '',
    location: '',
    timeline: 'Flexible',
    preferredContactMethod: 'Email',
    fullName: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
    companyName: '',
  });

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const body = {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        companyName: form.companyName,
        serviceRequired: form.service,
        projectLocation: form.location,
        expectedTimeline: form.timeline,
        preferredContactMethod: form.preferredContactMethod,
        projectDescription: `[Priority: ${form.urgency}]\n\n${form.equipmentInfo ? `Equipment: ${form.equipmentInfo}\n\n` : ''}${form.description}`,
      };
      const res = await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) setSubmitted(data.referenceNumber);
      else setError(data.message || 'Something went wrong. Please try again.');
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="w-12 h-12 bg-white flex items-center justify-center rounded mx-auto mb-5">
          <CheckCircle size={24} className="text-black" />
        </div>
        <h2 className="text-xl font-bold text-white font-heading mb-2">Request Submitted</h2>
        <p className="text-sm text-zinc-400 leading-relaxed mb-4">
          Your request has been received. Our team will review it and contact you within 1–2 business days.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/[0.08] rounded-md mb-7">
          <span className="text-xs text-zinc-500">Reference Number</span>
          <span className="text-sm font-bold text-white font-mono">{submitted}</span>
        </div>
        <div className="flex gap-3 justify-center">
          <Link
            href="/portal/requests"
            className="px-4 py-2 text-sm font-semibold bg-white text-black hover:bg-zinc-100 transition-colors rounded-md"
          >
            View My Requests
          </Link>
          <Link
            href="/portal"
            className="px-4 py-2 text-sm font-semibold bg-zinc-900 border border-white/[0.10] text-zinc-300 hover:text-white hover:border-white/20 transition-colors rounded-md"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <Link href="/portal/requests" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-6">
        <ArrowLeft size={13} /> Back to Requests
      </Link>

      <StepBar current={step} />

      {/* Step 0 — Service */}
      {step === 0 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-white font-heading mb-0.5">Select the service required</h2>
            <p className="text-sm text-zinc-500">Choose the service that best describes your requirement.</p>
          </div>

          <div>
            <FieldLabel required>Service Type</FieldLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SERVICES.map((svc) => (
                <button
                  key={svc}
                  type="button"
                  onClick={() => set('service', svc)}
                  className={`text-left px-4 py-3 rounded-md border text-sm transition-all duration-150 cursor-pointer ${
                    form.service === svc
                      ? 'bg-white text-black border-white font-semibold'
                      : 'bg-zinc-900 text-zinc-300 border-white/[0.08] hover:border-white/[0.20] hover:text-white'
                  }`}
                >
                  {svc}
                </button>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel>Priority</FieldLabel>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {URGENCIES.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => set('urgency', u.id)}
                  className={`text-left p-3 rounded-md border text-sm transition-all duration-150 cursor-pointer ${
                    form.urgency === u.id
                      ? 'bg-white text-black border-white font-semibold'
                      : 'bg-zinc-900 text-zinc-400 border-white/[0.08] hover:border-white/[0.20] hover:text-white'
                  }`}
                >
                  <p className="font-semibold leading-none">{u.label}</p>
                  <p className="text-[11px] mt-1 opacity-60">{u.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={!form.service}
            onClick={() => setStep(1)}
            className="w-full py-3 rounded-md text-sm font-semibold bg-white text-black hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            Continue <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Step 1 — Details */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-base font-bold text-white font-heading mb-0.5">Describe your requirement</h2>
            <p className="text-sm text-zinc-500">Provide details to help us prepare an accurate quotation.</p>
          </div>

          <div>
            <FieldLabel>Equipment Information <span className="normal-case text-zinc-600 font-normal">(optional)</span></FieldLabel>
            <input
              type="text"
              value={form.equipmentInfo}
              onChange={(e) => set('equipmentInfo', e.target.value)}
              placeholder="e.g. 250 KVA Kirloskar Generator, Model DG250, Serial No. 12345"
              className={inputCls}
            />
          </div>

          <div>
            <FieldLabel required>Description of Work Required</FieldLabel>
            <textarea
              rows={5}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Describe the work needed, the problem you are facing, or any specific requirements..."
              className={`${inputCls} resize-none`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Site / Location</FieldLabel>
              <input
                type="text"
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder="e.g. Chennai, Tamil Nadu"
                className={inputCls}
              />
            </div>
            <div>
              <FieldLabel>Expected Timeline</FieldLabel>
              <select
                value={form.timeline}
                onChange={(e) => set('timeline', e.target.value)}
                className={`${inputCls} bg-zinc-900`}
              >
                {TIMELINES.map((t) => <option key={t} value={t} className="bg-zinc-900">{t}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="flex-1 py-3 rounded-md text-sm font-semibold bg-zinc-900 border border-white/[0.10] text-zinc-300 hover:text-white hover:border-white/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <button
              type="button"
              disabled={!form.description.trim()}
              onClick={() => setStep(2)}
              className="flex-[2] py-3 rounded-md text-sm font-semibold bg-white text-black hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              Continue <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — Contact */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-base font-bold text-white font-heading mb-0.5">Confirm your contact details</h2>
            <p className="text-sm text-zinc-500">We'll use these details to follow up on your request.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Full Name</FieldLabel>
              <input type="text" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} className={inputCls} />
            </div>
            <div>
              <FieldLabel>Company Name</FieldLabel>
              <input type="text" value={form.companyName} onChange={(e) => set('companyName', e.target.value)} placeholder="Your organisation" className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Email Address</FieldLabel>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputCls} />
            </div>
            <div>
              <FieldLabel>Phone Number</FieldLabel>
              <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" className={inputCls} />
            </div>
          </div>

          <div>
            <FieldLabel>Preferred Contact Method</FieldLabel>
            <div className="flex gap-2">
              {CONTACT_METHODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => set('preferredContactMethod', m)}
                  className={`px-4 py-2 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                    form.preferredContactMethod === m
                      ? 'bg-white text-black border-white'
                      : 'bg-zinc-900 text-zinc-400 border-white/[0.08] hover:text-white hover:border-white/20'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-md border border-white/[0.07] bg-zinc-900 p-4">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Request Summary</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex gap-3"><span className="text-zinc-600 w-24 flex-shrink-0">Service</span><span className="text-zinc-300">{form.service}</span></div>
              <div className="flex gap-3"><span className="text-zinc-600 w-24 flex-shrink-0">Priority</span><span className="text-zinc-300">{form.urgency}</span></div>
              <div className="flex gap-3"><span className="text-zinc-600 w-24 flex-shrink-0">Timeline</span><span className="text-zinc-300">{form.timeline}</span></div>
              {form.location && <div className="flex gap-3"><span className="text-zinc-600 w-24 flex-shrink-0">Location</span><span className="text-zinc-300">{form.location}</span></div>}
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 py-3 rounded-md text-sm font-semibold bg-zinc-900 border border-white/[0.10] text-zinc-300 hover:text-white hover:border-white/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <button
              type="button"
              disabled={!form.fullName.trim() || !form.email.trim() || loading}
              onClick={handleSubmit}
              className="flex-[2] py-3 rounded-md text-sm font-semibold bg-white text-black hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <><Loader2 size={14} className="animate-spin" /> Submitting…</> : <>Submit Request <CheckCircle size={14} /></>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
