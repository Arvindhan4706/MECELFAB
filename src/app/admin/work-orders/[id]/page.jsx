import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, FileText } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import WorkOrderPartsManager from './WorkOrderPartsManager';
import WorkOrderInvoiceGenerator from './WorkOrderInvoiceGenerator';

export const metadata = {
  title: 'Work Order Detail | Admin | MECELFAB',
};

async function updateWorkOrder(formData) {
  'use server';
  const id = formData.get('id');
  const status = formData.get('status');
  const assignedToId = formData.get('assignedToId') || null;
  const scheduledDate = formData.get('scheduledDate');

  await db.workOrder.update({
    where: { id },
    data: { 
      status,
      assignedToId,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null
    }
  });

  revalidatePath(`/admin/work-orders/${id}`);
  revalidatePath(`/admin/work-orders`);
}

export default async function (props) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const workOrder = await db.workOrder.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      assignedTo: true,
      quotation: {
        include: { items: true }
      },
      serviceVisits: true,
      stockMovements: {
        include: { part: true },
        orderBy: { createdAt: 'desc' }
      },
      invoices: {
        include: { payments: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  const availableParts = await db.part.findMany({
    orderBy: { name: 'asc' }
  });

  if (!workOrder) notFound();

  // Fetch all staff users to assign to (roles ADMIN or TECHNICIAN if we had one, but let's fetch all users for now)
  const staff = await db.user.findMany({
    select: { id: true, name: true, role: true }
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
    <div className="pb-12 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/work-orders" className="p-2 border border-white/10 rounded-md text-secondary hover:bg-admin-surface/5 transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              {workOrder.workOrderNumber}
              <span className={`px-2.5 py-0.5 text-xs font-bold uppercase rounded-full border ${getStatusColor(workOrder.status)}`}>
                {workOrder.status.replace('_', ' ')}
              </span>
            </h1>
            <p className="text-secondary text-sm mt-1">Created on {new Date(workOrder.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-admin-surface/5 rounded-lg shadow-lg border border-white/10 overflow-hidden backdrop-blur-sm">
            <div className="p-5 border-b border-white/10 bg-black/20 flex justify-between items-center">
              <h2 className="font-semibold text-white flex items-center gap-2"><User size={18} className="text-blue-400"/> Customer Details</h2>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">Customer Name</p>
                <p className="text-sm font-semibold text-white">{workOrder.customer.contactPerson}</p>
              </div>
              <div>
                <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">Company</p>
                <p className="text-sm text-gray-300">{workOrder.customer.companyName || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">Email</p>
                <p className="text-sm text-gray-300">{workOrder.customer.email}</p>
              </div>
              <div>
                <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">Phone</p>
                <p className="text-sm text-gray-300">{workOrder.customer.phone || '—'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">Service Address</p>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{workOrder.customer.address || '—'}</p>
              </div>
            </div>
          </div>

          <div className="bg-admin-surface/5 rounded-lg shadow-lg border border-white/10 overflow-hidden backdrop-blur-sm">
            <div className="p-5 border-b border-white/10 bg-black/20 flex justify-between items-center">
              <h2 className="font-semibold text-white flex items-center gap-2"><FileText size={18} className="text-indigo-400"/> Job Scope (From Quotation)</h2>
            </div>
            <div className="p-5">
              {workOrder.quotation ? (
                <>
                  <div className="mb-4">
                    <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-2">Scope of Work</p>
                    <div className="bg-black/30 p-4 rounded text-sm text-gray-300 whitespace-pre-wrap border border-white/5">
                      {workOrder.quotation.scopeOfWork}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-2">Line Items</p>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="py-2 text-xs font-bold text-secondary uppercase">Description</th>
                          <th className="py-2 text-xs font-bold text-secondary uppercase text-center w-16">Qty</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {workOrder.quotation.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="py-2 text-sm text-gray-300">{item.description}</td>
                            <td className="py-2 text-sm text-gray-300 text-center">{item.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className="text-sm text-secondary italic">This work order is not linked to a detailed quotation.</p>
              )}
            </div>
          </div>

          {/* Spare Parts Allocation Section */}
          <WorkOrderPartsManager
            workOrderId={workOrder.id}
            availableParts={availableParts}
            stockMovements={workOrder.stockMovements}
          />

        </div>

        {/* Right Col */}
        <div className="space-y-6">
          <div className="bg-admin-surface/5 rounded-lg shadow-lg border border-white/10 overflow-hidden backdrop-blur-sm">
            <div className="p-5 border-b border-white/10 bg-black/20">
              <h2 className="font-semibold text-white text-sm">Management & Assignment</h2>
            </div>
            <div className="p-5">
              <form action={updateWorkOrder} className="space-y-4">
                <input type="hidden" name="id" value={workOrder.id} />
                
                <div>
                  <label className="block text-xs text-secondary font-medium uppercase tracking-wider mb-1">Status</label>
                  <select name="status" defaultValue={workOrder.status} className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-secondary font-medium uppercase tracking-wider mb-1">Assign Technician</label>
                  <select name="assignedToId" defaultValue={workOrder.assignedToId || ''} className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                    <option value="">-- Unassigned --</option>
                    {staff.map(user => (
                      <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-secondary font-medium uppercase tracking-wider mb-1">Scheduled Date</label>
                  <input 
                    type="date" 
                    name="scheduledDate" 
                    defaultValue={workOrder.scheduledDate ? new Date(workOrder.scheduledDate).toISOString().split('T')[0] : ''} 
                    className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" 
                  />
                </div>

                <button type="submit" className="w-full bg-admin-surface text-admin-heading px-4 py-2 rounded text-sm font-medium hover:bg-gray-200 transition-colors mt-4">
                  Save Changes
                </button>
              </form>
            </div>
          </div>

          {/* Invoice Generation & Status */}
          <WorkOrderInvoiceGenerator
            workOrder={workOrder}
            existingInvoices={workOrder.invoices || []}
          />

        </div>
      </div>
    </div>
  );
}
