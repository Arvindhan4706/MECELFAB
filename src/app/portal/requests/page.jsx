import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';
import { Plus, Clock, FileText } from 'lucide-react';

export const metadata = { title: 'My Requests | MECELFAB Portal' };

const STATUS_LABELS = {
  NEW: 'New', CONTACTED: 'Contacted', REQUIREMENT_VERIFIED: 'Requirement Verified',
  QUOTATION: 'Quotation Sent', NEGOTIATION: 'Negotiation', WON: 'Won', LOST: 'Lost', CLOSED: 'Closed',
};

const STATUS_DOT = {
  NEW: 'bg-sky-400', CONTACTED: 'bg-violet-400', REQUIREMENT_VERIFIED: 'bg-purple-400',
  QUOTATION: 'bg-amber-400', NEGOTIATION: 'bg-orange-400', WON: 'bg-emerald-400',
  LOST: 'bg-red-500', CLOSED: 'bg-zinc-600',
};

export default async function RequestsPage() {
  const session = await getServerSession(authOptions);

  const inquiries = await db.inquiry.findMany({
    where: { email: session.user.email },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-4xl mx-auto pb-10 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <p className="text-[11px] text-zinc-600 uppercase tracking-wider font-semibold mb-0.5">Service & Quotation Requests</p>
          <h2 className="text-base font-bold text-white font-heading">{inquiries.length} total request{inquiries.length !== 1 ? 's' : ''}</h2>
        </div>
        <Link
          href="/portal/requests/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-white text-black hover:bg-zinc-100 transition-colors rounded-md"
        >
          <Plus size={13} /> New Request
        </Link>
      </div>

      {/* Info notice */}
      <div className="flex items-start gap-3 px-4 py-3 bg-zinc-900 border border-white/[0.07] rounded-md">
        <div className="w-1 h-1 rounded-full bg-zinc-500 flex-shrink-0 mt-2" />
        <p className="text-xs text-zinc-500 leading-relaxed">
          Submit a service or quotation request and our team will review it within <strong className="text-zinc-300">1–2 business days</strong>.
          Track the status of each request in the table below.
        </p>
      </div>

      {/* Requests table */}
      {inquiries.length > 0 ? (
        <div className="rounded-md border border-white/[0.07] bg-zinc-900 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.07]">
                <th className="px-5 py-3 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Reference</th>
                <th className="px-5 py-3 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Service</th>
                <th className="px-5 py-3 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider hidden sm:table-cell">Location</th>
                <th className="px-5 py-3 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider hidden md:table-cell">Submitted</th>
                <th className="px-5 py-3 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {inquiries.map((inq) => (
                <tr key={inq.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-bold text-white font-mono">{inq.referenceNumber}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-zinc-300">{inq.service || 'General Inquiry'}</span>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className="text-sm text-zinc-500">{inq.location || '—'}</span>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="text-[11px] text-zinc-600 flex items-center gap-1.5">
                      <Clock size={10} />
                      {new Date(inq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-300">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[inq.status] || 'bg-zinc-600'}`} />
                      {STATUS_LABELS[inq.status] || inq.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-md border border-white/[0.07] bg-zinc-900 py-16 text-center">
          <FileText size={28} className="text-zinc-700 mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-400 mb-1">No requests submitted yet</p>
          <p className="text-xs text-zinc-600 max-w-xs mx-auto mb-5 leading-relaxed">
            Submit your first service or quotation request and our team will respond within 1–2 business days.
          </p>
          <Link
            href="/portal/requests/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-white text-black hover:bg-zinc-100 transition-colors rounded-md"
          >
            <Plus size={13} /> Submit First Request
          </Link>
        </div>
      )}
    </div>
  );
}
