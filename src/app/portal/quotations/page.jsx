import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';
import { FileText, Download } from 'lucide-react';

export const metadata = { title: 'Quotations | MECELFAB Portal' };

const STATUS = {
  DRAFT:     { dot: 'bg-zinc-600',    label: 'Draft' },
  SENT:      { dot: 'bg-sky-400',     label: 'Pending' },
  VIEWED:    { dot: 'bg-blue-400',    label: 'Viewed' },
  ACCEPTED:  { dot: 'bg-emerald-400', label: 'Accepted' },
  REJECTED:  { dot: 'bg-red-500',     label: 'Rejected' },
  EXPIRED:   { dot: 'bg-zinc-600',    label: 'Expired' },
};

export default async function QuotationsPage() {
  const session = await getServerSession(authOptions);

  const customer = await db.customer.findUnique({
    where: { userId: session.user.id },
    include: {
      quotations: {
        where: { status: { not: 'DRAFT' } }, // Hide drafts from clients
        orderBy: { createdAt: 'desc' }
      }
    },
  });

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center border border-white/10 rounded-lg bg-zinc-900/50 mt-10">
        <h2 className="text-xl font-bold text-white mb-2 font-heading">Quotations Not Available</h2>
        <p className="text-sm text-zinc-400 max-w-sm mx-auto">
          Your client portal account is currently being configured by our team. Quotations will appear here once your account is active.
        </p>
      </div>
    );
  }

  const quotations = customer.quotations;

  return (
    <div className="max-w-5xl mx-auto space-y-7 pb-10">
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-xl font-bold text-white font-heading">My Quotations</h2>
          <p className="text-sm text-zinc-500 mt-1">Review and manage service quotations.</p>
        </div>
      </div>

      <div className="border border-white/[0.08] rounded-lg overflow-hidden bg-zinc-900/50">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-black/40 border-b border-white/[0.06]">
              <th className="px-5 py-3 font-semibold text-zinc-400">Quote #</th>
              <th className="px-5 py-3 font-semibold text-zinc-400">Date</th>
              <th className="px-5 py-3 font-semibold text-zinc-400">Service</th>
              <th className="px-5 py-3 font-semibold text-zinc-400 text-right">Amount</th>
              <th className="px-5 py-3 font-semibold text-zinc-400">Status</th>
              <th className="px-5 py-3 font-semibold text-zinc-400 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {quotations.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-5 py-12 text-center text-zinc-500">
                  <FileText size={24} className="mx-auto mb-3 opacity-50" />
                  No quotations found.
                </td>
              </tr>
            ) : (
              quotations.map((quote) => {
                const s = STATUS[quote.status] || STATUS.DRAFT;
                return (
                  <tr key={quote.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 font-medium text-white">{quote.quotationNumber}</td>
                    <td className="px-5 py-3.5 text-zinc-400">
                      {new Date(quote.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-300 truncate max-w-[200px]">{quote.service}</td>
                    <td className="px-5 py-3.5 text-right font-medium text-white font-mono">
                      ₹{quote.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/40 border border-white/5 text-[11px] font-medium text-zinc-300 tracking-wide uppercase">
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link 
                        href={`/api/pdf/quotation?id=${quote.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Download size={14} />
                        <span className="hidden sm:inline">PDF</span>
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
