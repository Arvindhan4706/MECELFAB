import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';
import { FileText, CheckCircle, AlertTriangle, Clock, Receipt } from 'lucide-react';

export const metadata = { title: 'Billing | MECELFAB Portal' };

const STATUS = {
  DRAFT:     { dot: 'bg-zinc-600',    label: 'Draft' },
  SENT:      { dot: 'bg-sky-400',     label: 'Sent' },
  VIEWED:    { dot: 'bg-blue-400',    label: 'Viewed' },
  PARTIAL:   { dot: 'bg-amber-400',   label: 'Partial' },
  PAID:      { dot: 'bg-emerald-400', label: 'Paid' },
  CANCELLED: { dot: 'bg-zinc-600',    label: 'Cancelled' },
  OVERDUE:   { dot: 'bg-red-500',     label: 'Overdue' },
};

export default async function BillingPage() {
  const session = await getServerSession(authOptions);

  const customer = await db.customer.findUnique({
    where: { userId: session.user.id },
    include: { invoices: { orderBy: { createdAt: 'desc' }, include: { payments: true } } },
  });

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center border border-white/10 rounded-lg bg-zinc-900/50 mt-10">
        <h2 className="text-xl font-bold text-white mb-2 font-heading">Billing Not Available</h2>
        <p className="text-sm text-zinc-400 max-w-sm mx-auto">
          Your client portal account is currently being configured by our team. Billing records will appear here once your account is active.
        </p>
      </div>
    );
  }
  const invoices = customer.invoices.map((inv) => {
    const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
    const balance = inv.grandTotal - paid;
    const isOverdue = inv.dueDate && new Date(inv.dueDate) < new Date() && balance > 0;
    return { ...inv, paid, balance, isOverdue };
  });

  const unpaid = invoices.filter((i) => i.balance > 0 && i.status !== 'CANCELLED');
  const paidList = invoices.filter((i) => i.balance <= 0 || i.status === 'PAID');
  const outstanding = unpaid.reduce((s, i) => s + i.balance, 0);
  const totalPaid = paidList.reduce((s, i) => s + i.grandTotal, 0);
  const overdueList = unpaid.filter((i) => i.isOverdue);

  return (
    <div className="max-w-4xl mx-auto pb-10 space-y-6">

      {/* Header */}
      <div className="pt-1">
        <p className="text-[11px] text-zinc-600 uppercase tracking-wider font-semibold mb-0.5">Invoices & Payments</p>
        <h2 className="text-base font-bold text-white font-heading">Billing Overview</h2>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-md border border-white/[0.07] bg-zinc-900">
          <p className="text-[11px] text-zinc-600 uppercase tracking-wider font-medium mb-2">Outstanding</p>
          <p className={`text-2xl font-bold font-heading ${outstanding > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            ₹{outstanding.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-[11px] text-zinc-600 mt-1">{unpaid.length} unpaid</p>
        </div>
        <div className="p-4 rounded-md border border-white/[0.07] bg-zinc-900">
          <p className="text-[11px] text-zinc-600 uppercase tracking-wider font-medium mb-2">Total Paid</p>
          <p className="text-2xl font-bold font-heading text-white">
            ₹{totalPaid.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-[11px] text-zinc-600 mt-1">{paidList.length} invoices</p>
        </div>
        <div className="p-4 rounded-md border border-white/[0.07] bg-zinc-900">
          <p className="text-[11px] text-zinc-600 uppercase tracking-wider font-medium mb-2">All Invoices</p>
          <p className="text-2xl font-bold font-heading text-white">{invoices.length}</p>
          <p className="text-[11px] text-zinc-600 mt-1">All time</p>
        </div>
      </div>

      {/* Overdue notice */}
      {overdueList.length > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-md bg-red-950/20 border border-red-900/40">
          <AlertTriangle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-300">{overdueList.length} overdue invoice{overdueList.length > 1 ? 's' : ''}</p>
            <p className="text-xs text-red-400/70 mt-0.5">
              Please contact MECELFAB to arrange payment or discuss a payment schedule.
            </p>
          </div>
          <Link href="/contact" className="text-xs text-red-400 hover:text-red-300 transition-colors flex-shrink-0 font-medium">
            Contact Us →
          </Link>
        </div>
      )}

      {/* Invoice table */}
      {invoices.length > 0 ? (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 mb-3">All Invoices</p>
          <div className="rounded-md border border-white/[0.07] bg-zinc-900 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  <th className="px-5 py-3 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Invoice No.</th>
                  <th className="px-5 py-3 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider text-right">Total</th>
                  <th className="px-5 py-3 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider text-right hidden sm:table-cell">Balance Due</th>
                  <th className="px-5 py-3 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider hidden md:table-cell">Due Date</th>
                  <th className="px-5 py-3 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {invoices.map((inv) => {
                  const statusKey = inv.isOverdue ? 'OVERDUE' : inv.status;
                  const statusMeta = STATUS[statusKey] || STATUS.SENT;
                  return (
                    <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-zinc-800 border border-white/[0.06] rounded flex items-center justify-center flex-shrink-0">
                            <FileText size={12} className="text-zinc-500" />
                          </div>
                          <span className="text-sm font-semibold text-white">{inv.invoiceNumber}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="text-sm font-bold text-white">₹{inv.grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right hidden sm:table-cell">
                        {inv.balance > 0 ? (
                          <span className={`text-sm font-semibold ${inv.isOverdue ? 'text-red-400' : 'text-amber-400'}`}>
                            ₹{inv.balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </span>
                        ) : (
                          <span className="text-sm text-emerald-400 flex items-center justify-end gap-1">
                            <CheckCircle size={12} /> Paid
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        {inv.dueDate ? (
                          <span className={`text-[11px] flex items-center gap-1 ${inv.isOverdue ? 'text-red-400' : 'text-zinc-500'}`}>
                            <Clock size={10} />
                            {new Date(inv.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        ) : <span className="text-zinc-700">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-300">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusMeta.dot}`} />
                          {statusMeta.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-zinc-700 mt-3 text-center">
            For payment queries, <Link href="/contact" className="text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-2">contact us</Link>.
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-white/[0.07] bg-zinc-900 py-16 text-center">
          <Receipt size={28} className="text-zinc-700 mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-400 mb-1">No invoices yet</p>
          <p className="text-xs text-zinc-600 max-w-sm mx-auto leading-relaxed">
            Invoices from completed services will appear here along with your payment history.
          </p>
        </div>
      )}
    </div>
  );
}
