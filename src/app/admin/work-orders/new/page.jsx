import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Wrench, Save } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export const metadata = {
  title: 'New Work Order | Admin | MECELFAB',
};

async function createWorkOrder(formData) {
  'use server';
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const customerId = formData.get('customerId');
  const quotationId = formData.get('quotationId') || null;
  const service = formData.get('service')?.trim();
  const description = formData.get('description')?.trim();
  const priority = formData.get('priority') || 'MEDIUM';
  const assignedToId = formData.get('assignedToId') || null;
  const scheduledDateStr = formData.get('scheduledDate');

  if (!customerId || !service) {
    throw new Error('Customer and Service title are required.');
  }

  const currentYear = new Date().getFullYear();
  const count = await db.workOrder.count();
  const workOrderNumber = `MEC-WO-${currentYear}-${String(count + 1).padStart(4, '0')}`;

  const workOrder = await db.workOrder.create({
    data: {
      workOrderNumber,
      customerId,
      quotationId,
      service,
      description,
      priority,
      assignedToId,
      scheduledDate: scheduledDateStr ? new Date(scheduledDateStr) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: 'SCHEDULED',
    },
  });

  await db.activityLog.create({
    data: {
      action: 'WORK_ORDER_CREATED',
      entity: 'WORK_ORDER',
      entityId: workOrder.id,
      userId: session.user.id,
      details: `Created work order ${workOrderNumber} for service: ${service}`,
    },
  });

  revalidatePath('/admin/work-orders');
  redirect(`/admin/work-orders/${workOrder.id}`);
}

export default async function NewWorkOrderPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const customers = await db.customer.findMany({
    orderBy: { companyName: 'asc' },
    select: { id: true, companyName: true, contactPerson: true },
  });

  const acceptedQuotations = await db.quotation.findMany({
    where: { status: 'ACCEPTED' },
    orderBy: { createdAt: 'desc' },
    select: { id: true, quotationNumber: true, service: true, customerName: true },
  });

  const staff = await db.user.findMany({
    select: { id: true, name: true, role: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="pb-12 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/work-orders"
          className="p-2 border border-white/10 rounded-md text-secondary hover:bg-admin-surface/5 transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wrench size={22} className="text-blue-400" />
            <span>Create New Work Order</span>
          </h1>
          <p className="text-secondary text-sm mt-1">Initiate and schedule an operational maintenance or fabrication job</p>
        </div>
      </div>

      <form action={createWorkOrder} className="bg-admin-surface/5 rounded-lg border border-white/10 p-6 space-y-6 backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-secondary uppercase mb-1">
              Select Customer *
            </label>
            <select
              name="customerId"
              required
              className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- Choose Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName ? `${c.companyName} (${c.contactPerson})` : c.contactPerson}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary uppercase mb-1">
              Link Accepted Quotation (Optional)
            </label>
            <select
              name="quotationId"
              className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- None / Standalone Job --</option>
              {acceptedQuotations.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.quotationNumber} - {q.service} ({q.customerName})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-secondary uppercase mb-1">
            Service Title *
          </label>
          <input
            type="text"
            name="service"
            required
            placeholder="e.g. Heavy Pipe Spool Erection & Hydrotest"
            className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-secondary uppercase mb-1">
            Job Scope & Instructions
          </label>
          <textarea
            name="description"
            rows={4}
            placeholder="Detail engineering tasks, site safety requirements, and milestones..."
            className="w-full bg-black/40 border border-white/10 rounded p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-secondary uppercase mb-1">
              Priority Level
            </label>
            <select
              name="priority"
              defaultValue="MEDIUM"
              className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent / Emergency</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary uppercase mb-1">
              Assign Lead Technician / Staff
            </label>
            <select
              name="assignedToId"
              className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- Unassigned --</option>
              {staff.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary uppercase mb-1">
              Scheduled Date
            </label>
            <input
              type="date"
              name="scheduledDate"
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded text-sm transition-colors flex items-center gap-2 shadow cursor-pointer"
          >
            <Save size={16} />
            <span>Create Work Order</span>
          </button>
        </div>
      </form>
    </div>
  );
}
