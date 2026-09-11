import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Wrench, Search, Plus, Calendar, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Work Orders | Admin | MECELFAB',
};

export default async function WorkOrdersPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const resolvedParams = await searchParams;
  const statusFilter = resolvedParams?.status || '';
  const search = resolvedParams?.search || '';

  const where = {};
  if (statusFilter) where.status = statusFilter;
  if (search) {
    where.OR = [
      { workOrderNumber: { contains: search } },
      { customer: { contactPerson: { contains: search } } },
      { customer: { companyName: { contains: search } } }
    ];
  }

  const workOrders = await db.workOrder.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      customer: true,
      assignedTo: true,
      quotation: true
    }
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'SCHEDULED': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CLOSED': return 'bg-admin-elevated text-admin-heading border-admin-border';
      default: return 'bg-admin-elevated text-admin-heading border-admin-border';
    }
  };

  return (
    <div className="pb-12">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wrench size={24} /> Work Orders
          </h1>
          <p className="text-secondary text-sm mt-1">Manage operations, assign technicians, and track progress.</p>
        </div>
        <Link href="/admin/work-orders/new" className="bg-admin-surface text-primary px-4 py-2 rounded font-medium text-sm flex items-center gap-2 hover:bg-admin-elevated transition-colors w-max">
          <Plus size={16} /> New Work Order
        </Link>
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
                placeholder="Search by WO number, customer, company..." 
                className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-md text-white text-sm focus:border-white/30 focus:outline-none transition-colors"
              />
            </div>
            <select 
              name="status"
              defaultValue={statusFilter}
              className="px-4 py-2 bg-black/40 border border-white/10 rounded-md text-white text-sm focus:border-white/30 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CLOSED">Closed</option>
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
                <th className="p-4 font-medium">Work Order</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Schedule</th>
                <th className="p-4 font-medium">Technician</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {workOrders.length > 0 ? workOrders.map(wo => (
                <tr key={wo.id} className="hover:bg-admin-surface/5 transition-colors group">
                  <td className="p-4">
                    <div className="font-semibold text-white">{wo.workOrderNumber}</div>
                    <div className="text-xs text-secondary mt-1">Ref: {wo.quotation?.quotationNumber || 'Direct'}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-300">{wo.customer.contactPerson}</div>
                    <div className="text-xs text-secondary mt-1">{wo.customer.companyName || '—'}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Calendar size={14} className="text-admin-muted" />
                      {wo.scheduledDate ? new Date(wo.scheduledDate).toLocaleDateString() : 'Unscheduled'}
                    </div>
                  </td>
                  <td className="p-4">
                    {wo.assignedTo ? (
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                          {wo.assignedTo.name.charAt(0)}
                        </div>
                        {wo.assignedTo.name}
                      </div>
                    ) : (
                      <span className="text-xs text-admin-muted italic">Unassigned</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border ${getStatusColor(wo.status)}`}>
                      {wo.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/admin/work-orders/${wo.id}`} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-admin-surface/5 hover:bg-admin-surface/10 text-white transition-colors">
                      <ArrowRight size={16} />
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-secondary">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Wrench size={32} className="text-admin-muted mb-2" />
                      <p>No work orders found matching your criteria.</p>
                      <Link href="/admin/work-orders/new" className="text-blue-400 hover:text-blue-300 text-sm mt-2">
                        Create your first work order
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

