import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Wrench, Calendar, User, ArrowRight, PlusCircle } from 'lucide-react';

export const metadata = {
  title: 'My Work Orders | Customer Portal | MECELFAB',
};

export default async function CustomerWorkOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect('/api/auth/signin?callbackUrl=/portal');

  const customer = await db.customer.findUnique({
    where: { userId: session.user.id },
  });

  if (!customer) redirect('/portal');

  // STRICT ISOLATION: Scoped exclusively to the authenticated customer
  const workOrders = await db.workOrder.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: 'desc' },
    include: {
      assignedTo: {
        select: { name: true, role: true },
      },
      serviceVisits: {
        select: { id: true, status: true, date: true },
      },
      invoices: {
        select: { id: true, invoiceNumber: true, status: true },
      },
    },
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'IN_PROGRESS':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'ASSIGNED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'SCHEDULED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'CLOSED':
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'MEDIUM':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  return (
    <div className="pb-12 max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Wrench className="text-blue-400" />
            <span>My Work Orders & Operations</span>
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Live status of your engineering, fabrication, and maintenance contracts with MECELFAB.
          </p>
        </div>

        <Link
          href="/portal/service-requests/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold text-sm flex items-center gap-2 transition-colors w-max shadow-sm"
        >
          <PlusCircle size={16} />
          <span>Raise Service Request</span>
        </Link>
      </div>

      <div className="bg-white/5 rounded-lg border border-white/10 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/30 text-secondary text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Work Order</th>
                <th className="p-4 font-medium">Service / Scope</th>
                <th className="p-4 font-medium">Priority</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Technician</th>
                <th className="p-4 font-medium">Scheduled Date</th>
                <th className="p-4 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {workOrders.length > 0 ? (
                workOrders.map((wo) => (
                  <tr key={wo.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <Link
                        href={`/portal/work-orders/${wo.id}`}
                        className="font-bold text-blue-400 hover:text-blue-300 transition-colors block text-sm"
                      >
                        {wo.workOrderNumber}
                      </Link>
                      <span className="text-[11px] text-gray-500">
                        {new Date(wo.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4 max-w-xs">
                      <p className="text-sm font-semibold text-white truncate">{wo.service || 'Industrial Works'}</p>
                      {wo.description && (
                        <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{wo.description}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${getPriorityBadge(
                          wo.priority
                        )}`}
                      >
                        {wo.priority || 'NORMAL'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-bold uppercase rounded-full border ${getStatusBadge(
                          wo.status
                        )}`}
                      >
                        {wo.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-300">
                      {wo.assignedTo ? (
                        <div className="flex items-center gap-1.5">
                          <User size={13} className="text-blue-400" />
                          <span>{wo.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">Dispatched as required</span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-gray-300">
                      {wo.scheduledDate ? (
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-amber-400" />
                          <span>{new Date(wo.scheduledDate).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/portal/work-orders/${wo.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-3 py-1.5 rounded transition-colors"
                      >
                        <span>View</span>
                        <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-gray-400">
                    <Wrench size={36} className="mx-auto mb-3 opacity-30 text-blue-400" />
                    <p className="text-base font-semibold text-white">No work orders recorded yet</p>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                      Once a quotation is approved or you raise a service request, operational work orders will appear here.
                    </p>
                    <Link
                      href="/portal/service-requests/new"
                      className="mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded transition-colors"
                    >
                      <PlusCircle size={14} />
                      <span>Submit Your First Request</span>
                    </Link>
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
