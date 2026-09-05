import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';
import { Wrench, Briefcase, FileText, CheckCircle, Clock } from 'lucide-react';

export const metadata = {
  title: 'Portal Dashboard | MECELFAB',
};

export default async function PortalDashboard() {
  const session = await getServerSession(authOptions);
  
  // Layout guarantees we have a customer link if we render this page, but we re-fetch to be safe.
  const customer = await db.customer.findUnique({
    where: { userId: session.user.id },
    include: {
      workOrders: {
        where: { status: { notIn: ['CLOSED', 'CANCELLED'] } },
        orderBy: { createdAt: 'desc' },
        take: 5
      },
      equipment: {
        include: {
          amcs: {
            include: { amc: true }
          }
        }
      },
      invoices: {
        where: { status: { notIn: ['PAID', 'CANCELLED'] } }, // Show unpaid invoices
        orderBy: { dueDate: 'asc' },
        include: { payments: true }
      }
    }
  });

  if (!customer) return null; // Handled by layout

  const activeWorkOrders = customer.workOrders;
  const allEquipment = customer.equipment;
  const unpaidInvoices = customer.invoices.map(inv => {
    const paid = inv.payments.reduce((acc, curr) => acc + curr.amount, 0);
    return { ...inv, balance: inv.grandTotal - paid };
  }).filter(inv => inv.balance > 0);

  return (
    <div className="pb-12 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Client Dashboard</h1>
        <p className="text-gray-400 mt-2 text-sm max-w-2xl">
          Welcome to your MECELFAB client portal. Here you can track active service requests, manage your registered equipment, and view outstanding invoices.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Wrench className="text-blue-400" size={20} />
            <h3 className="text-blue-100 font-medium">Active Jobs</h3>
          </div>
          <p className="text-3xl font-bold text-white">{activeWorkOrders.length}</p>
        </div>
        
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="text-amber-400" size={20} />
            <h3 className="text-amber-100 font-medium">Registered Equipment</h3>
          </div>
          <p className="text-3xl font-bold text-white">{allEquipment.length}</p>
        </div>

        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="text-red-400" size={20} />
            <h3 className="text-red-100 font-medium">Pending Invoices</h3>
          </div>
          <p className="text-3xl font-bold text-white">{unpaidInvoices.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Active Work Orders */}
        <div className="bg-white/5 rounded-lg border border-white/10 shadow-lg overflow-hidden">
          <div className="p-5 border-b border-white/10 bg-black/20 flex justify-between items-center">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Wrench size={16} className="text-blue-400" />
              <span>Active Work Orders</span>
            </h2>
            <Link href="/portal/work-orders" className="text-xs text-blue-400 hover:text-blue-300">View All</Link>
          </div>
          <div className="p-0">
            <ul className="divide-y divide-white/5">
              {activeWorkOrders.length > 0 ? activeWorkOrders.map(wo => (
                <li key={wo.id} className="p-5 hover:bg-white/5 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-white">{wo.workOrderNumber}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded border bg-blue-500/10 text-blue-400 border-blue-500/20">
                      {wo.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Clock size={14}/> {new Date(wo.createdAt).toLocaleDateString()}</span>
                    {wo.scheduledDate && (
                      <span className="flex items-center gap-1 text-amber-400">Scheduled: {new Date(wo.scheduledDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </li>
              )) : (
                <li className="p-8 text-center text-gray-500 text-sm">
                  No active work orders.
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Unpaid Invoices */}
        <div className="bg-white/5 rounded-lg border border-white/10 shadow-lg overflow-hidden">
          <div className="p-5 border-b border-white/10 bg-black/20 flex justify-between items-center">
            <h2 className="font-semibold text-white flex items-center gap-2">Action Required: Billing</h2>
            <Link href="/portal/invoices" className="text-xs text-blue-400 hover:text-blue-300">View All</Link>
          </div>
          <div className="p-0">
            <ul className="divide-y divide-white/5">
              {unpaidInvoices.length > 0 ? unpaidInvoices.map(inv => {
                const isOverdue = inv.dueDate && new Date(inv.dueDate) < new Date();
                return (
                <li key={inv.id} className="p-5 hover:bg-white/5 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium text-white block">{inv.invoiceNumber}</span>
                      <span className={`text-xs mt-1 block ${isOverdue ? 'text-red-400' : 'text-gray-400'}`}>
                        Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'} {isOverdue && '(OVERDUE)'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-white block">₹ {inv.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      <button className="mt-2 text-xs bg-white text-black px-3 py-1 rounded font-medium hover:bg-gray-200 transition-colors">
                        Pay Now
                      </button>
                    </div>
                  </div>
                </li>
              )}) : (
                <li className="p-8 text-center text-gray-500 text-sm flex flex-col items-center">
                  <CheckCircle size={32} className="text-green-500/50 mb-2" />
                  You are all caught up! No pending invoices.
                </li>
              )}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
