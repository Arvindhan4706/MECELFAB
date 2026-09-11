import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Banknote, Search, Plus, ArrowRight, IndianRupee } from 'lucide-react';

export const metadata = {
  title: 'Billing & Invoices | Admin | MECELFAB',
};

export default async function BillingPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const resolvedParams = await searchParams;
  const statusFilter = resolvedParams?.status || '';
  const search = resolvedParams?.search || '';

  const where = {};
  if (statusFilter) where.status = statusFilter;
  if (search) {
    where.OR = [
      { invoiceNumber: { contains: search } },
      { customer: { contactPerson: { contains: search } } },
      { customer: { companyName: { contains: search } } }
    ];
  }

  const invoices = await db.invoice.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      customer: true,
      payments: true
    }
  });

  // Basic stats
  const allInvoices = await db.invoice.findMany({ include: { payments: true } });
  
  let totalReceivables = 0;
  let totalCollected = 0;
  let overdueAmount = 0;

  const now = new Date();

  allInvoices.forEach(inv => {
    const paid = inv.payments.reduce((acc, curr) => acc + curr.amount, 0);
    const balance = inv.grandTotal - paid;
    
    totalCollected += paid;
    if (inv.status !== 'CANCELLED' && inv.status !== 'DRAFT') {
      totalReceivables += balance;
      
      if (inv.dueDate && new Date(inv.dueDate) < now && balance > 0) {
        overdueAmount += balance;
      }
    }
  });

  const getStatusColor = (status, balance, dueDate) => {
    if (status === 'CANCELLED') return 'bg-admin-elevated text-admin-heading border-admin-border';
    if (status === 'PAID' || balance <= 0) return 'bg-green-100 text-green-800 border-green-200';
    if (status === 'PARTIALLY_PAID') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (dueDate && new Date(dueDate) < new Date() && balance > 0) return 'bg-red-100 text-red-800 border-red-200'; // OVERDUE
    if (status === 'SENT' || status === 'ISSUED') return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-admin-elevated text-admin-heading border-admin-border'; // DRAFT
  };

  const getCalculatedStatus = (inv, balance) => {
    if (inv.status === 'CANCELLED' || inv.status === 'DRAFT') return inv.status;
    if (balance <= 0) return 'PAID';
    if (inv.dueDate && new Date(inv.dueDate) < new Date()) return 'OVERDUE';
    if (inv.payments.length > 0) return 'PARTIALLY_PAID';
    return inv.status;
  };

  return (
    <div className="pb-12">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Banknote size={24} /> Billing & Invoices
          </h1>
          <p className="text-secondary text-sm mt-1">Manage receivables, record payments, and track revenue.</p>
        </div>
        <Link href="/admin/billing/new" className="bg-admin-surface text-primary px-4 py-2 rounded font-medium text-sm flex items-center gap-2 hover:bg-admin-elevated transition-colors w-max">
          <Plus size={16} /> Create Invoice
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-admin-surface/5 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm p-4">
          <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">Outstanding Receivables</p>
          <div className="flex items-center gap-2">
            <IndianRupee size={20} className="text-white"/>
            <p className="text-2xl font-bold text-white">{totalReceivables.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div className="bg-admin-surface/5 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm p-4">
          <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">Overdue Amount</p>
          <div className="flex items-center gap-2">
            <IndianRupee size={20} className="text-red-400"/>
            <p className="text-2xl font-bold text-red-400">{overdueAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div className="bg-admin-surface/5 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm p-4">
          <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">Total Collected (All Time)</p>
          <div className="flex items-center gap-2">
            <IndianRupee size={20} className="text-green-400"/>
            <p className="text-2xl font-bold text-green-400">{totalCollected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      <div className="bg-admin-surface/5 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-white/10 bg-admin-surface/5">
          <form className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                name="search"
                defaultValue={search}
                placeholder="Search by invoice number, customer..." 
                className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-md text-white text-sm focus:border-white/30 focus:outline-none transition-colors"
              />
            </div>
            <select 
              name="status"
              defaultValue={statusFilter}
              className="px-4 py-2 bg-black/40 border border-white/10 rounded-md text-white text-sm focus:border-white/30 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="ISSUED">Issued / Sent</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <button type="submit" className="bg-admin-surface/10 hover:bg-admin-surface/20 text-white px-6 py-2 rounded-md font-medium text-sm transition-colors border border-white/10">
              Filter
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-admin-surface/5 text-secondary text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Invoice No</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Dates</th>
                <th className="p-4 font-medium text-right">Amount</th>
                <th className="p-4 font-medium text-right">Balance</th>
                <th className="p-4 font-medium text-center">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoices.length > 0 ? invoices.map(inv => {
                const paid = inv.payments.reduce((acc, curr) => acc + curr.amount, 0);
                const balance = inv.grandTotal - paid;
                const calculatedStatus = getCalculatedStatus(inv, balance);
                
                return (
                <tr key={inv.id} className="hover:bg-admin-surface/5 transition-colors group">
                  <td className="p-4">
                    <Link href={`/admin/billing/${inv.id}`} className="font-mono font-semibold text-white hover:text-blue-400 transition-colors">
                      {inv.invoiceNumber}
                    </Link>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-300">{inv.customer.contactPerson}</div>
                    <div className="text-xs text-secondary mt-1">{inv.customer.companyName || '—'}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-xs text-gray-300">
                      <span className="text-secondary inline-block w-8">Iss:</span> {inv.issueDate ? new Date(inv.issueDate).toLocaleDateString() : '—'}
                    </div>
                    <div className="text-xs text-gray-300 mt-1">
                      <span className="text-secondary inline-block w-8">Due:</span> {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="text-sm font-medium text-gray-300">
                      ₹ {inv.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className={`text-sm font-bold ${balance > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                      ₹ {balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border ${getStatusColor(calculatedStatus, balance, inv.dueDate)}`}>
                      {calculatedStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/admin/billing/${inv.id}`} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-admin-surface/5 hover:bg-admin-surface/10 text-white transition-colors">
                      <ArrowRight size={16} />
                    </Link>
                  </td>
                </tr>
              )}) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-secondary">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Banknote size={32} className="text-admin-muted mb-2" />
                      <p>No invoices found matching your criteria.</p>
                      <Link href="/admin/billing/new" className="text-blue-400 hover:text-blue-300 text-sm mt-2">
                        Create your first invoice
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

