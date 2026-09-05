import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, History, Wrench } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export const metadata = {
  title: 'Part Detail | Admin | MECELFAB',
};

async function adjustStock(formData) {
  'use server';
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  const id = formData.get('id');
  const type = formData.get('type'); // RECEIVED, ISSUED, RETURNED, ADJUSTED
  const amountStr = formData.get('amount');
  const note = formData.get('note') || '';
  const workOrderId = formData.get('workOrderId') || null;
  
  const amount = parseInt(amountStr, 10);
  if (isNaN(amount) || amount <= 0) return;

  await db.$transaction(async (tx) => {
    const part = await tx.part.findUnique({ where: { id } });
    if (!part) return;

    let newQuantity = part.quantity;
    if (type === 'RECEIVED' || type === 'RETURNED') {
      newQuantity += amount;
    } else if (type === 'ISSUED') {
      if (amount > part.quantity) {
        throw new Error(`Insufficient stock. Cannot issue ${amount} units (Available: ${part.quantity}).`);
      }
      newQuantity -= amount;
    } else if (type === 'ADJUSTED') {
      newQuantity += amount;
    }

    if (newQuantity < 0) {
      throw new Error('Stock cannot become negative.');
    }

    await tx.part.update({
      where: { id },
      data: { quantity: newQuantity }
    });

    await tx.stockMovement.create({
      data: {
        partId: id,
        type,
        quantity: amount,
        previousQuantity: part.quantity,
        newQuantity,
        userId: session.user.id,
        note,
        workOrderId
      }
    });
  });

  revalidatePath(`/admin/inventory/${id}`);
  revalidatePath(`/admin/inventory`);
}

export default async function (props) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const part = await db.part.findUnique({
    where: { id: params.id },
    include: {
      stockMovements: {
        orderBy: { createdAt: 'desc' },
        include: { workOrder: true }
      }
    }
  });

  if (!part) notFound();

  const isLow = part.quantity > 0 && part.quantity <= part.minimumStock;
  const isOut = part.quantity === 0;

  // Fetch active work orders for dropdown
  const activeWorkOrders = await db.workOrder.findMany({
    where: { status: { in: ['IN_PROGRESS', 'ASSIGNED', 'SCHEDULED'] } },
    select: { id: true, workOrderNumber: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="pb-12 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/inventory" className="p-2 border border-white/10 rounded-md text-secondary hover:bg-admin-surface/5 transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              {part.name}
              {isOut ? (
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded border bg-red-500/20 text-red-400 border-red-500/30">Out of Stock</span>
              ) : isLow ? (
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded border bg-amber-500/20 text-amber-400 border-amber-500/30">Low Stock</span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded border bg-green-500/20 text-green-400 border-green-500/30">Healthy</span>
              )}
            </h1>
            <p className="text-secondary text-sm mt-1 font-mono">PN: {part.partNumber}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col - Details & Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-admin-surface/5 rounded-lg shadow-lg border border-white/10 overflow-hidden backdrop-blur-sm text-center p-6">
            <Package size={48} className="mx-auto text-blue-400 mb-4 opacity-50" />
            <p className="text-sm text-secondary uppercase tracking-wider mb-2">Current Stock</p>
            <h2 className={`text-5xl font-black mb-2 ${isOut ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-white'}`}>
              {part.quantity}
            </h2>
            <p className="text-xs text-gray-400">Minimum required: {part.minimumStock}</p>
          </div>

          <div className="bg-admin-surface/5 rounded-lg shadow-lg border border-white/10 overflow-hidden backdrop-blur-sm">
            <div className="p-4 border-b border-white/10 bg-black/20">
              <h2 className="font-semibold text-white text-sm">Part Details</h2>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">Category</p>
                <p className="text-sm text-gray-300">{part.category || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">Manufacturer</p>
                <p className="text-sm text-gray-300">{part.manufacturer || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">Storage Location</p>
                <p className="text-sm text-gray-300">{part.location || '—'}</p>
              </div>
            </div>
          </div>

          <div className="bg-admin-surface/5 rounded-lg shadow-lg border border-white/10 overflow-hidden backdrop-blur-sm">
            <div className="p-4 border-b border-white/10 bg-black/20">
              <h2 className="font-semibold text-white text-sm">Record Stock Movement</h2>
            </div>
            <div className="p-4">
              <form action={adjustStock} className="space-y-4">
                <input type="hidden" name="id" value={part.id} />
                
                <div>
                  <label className="block text-xs text-secondary font-medium uppercase tracking-wider mb-1">Movement Type</label>
                  <select name="type" required className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                    <option value="RECEIVED">Receive Stock (+)</option>
                    <option value="ISSUED">Issue to Job (-)</option>
                    <option value="RETURNED">Return to Stock (+)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-secondary font-medium uppercase tracking-wider mb-1">Quantity</label>
                  <input type="number" name="amount" min="1" required placeholder="0" className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
                </div>

                <div>
                  <label className="block text-xs text-secondary font-medium uppercase tracking-wider mb-1">Link Work Order (Optional)</label>
                  <select name="workOrderId" className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                    <option value="">-- None --</option>
                    {activeWorkOrders.map(wo => (
                      <option key={wo.id} value={wo.id}>{wo.workOrderNumber}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-secondary font-medium uppercase tracking-wider mb-1">Note</label>
                  <input type="text" name="note" placeholder="E.g. Invoice #123, Job specific..." className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors mt-2">
                  Save Movement
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Col - Movement History */}
        <div className="lg:col-span-2">
          <div className="bg-admin-surface/5 rounded-lg shadow-lg border border-white/10 overflow-hidden backdrop-blur-sm h-full">
            <div className="p-5 border-b border-white/10 bg-black/20 flex justify-between items-center">
              <h2 className="font-semibold text-white flex items-center gap-2"><History size={18} className="text-purple-400"/> Movement History</h2>
            </div>
            
            <div className="p-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-black/10 text-secondary text-xs uppercase tracking-wider">
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Type</th>
                    <th className="p-4 font-medium text-center">Qty</th>
                    <th className="p-4 font-medium">Linked To</th>
                    <th className="p-4 font-medium">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {part.stockMovements.length > 0 ? part.stockMovements.map(mov => {
                    const isAdd = ['RECEIVED', 'RETURNED', 'ADJUSTED'].includes(mov.type);
                    return (
                      <tr key={mov.id} className="hover:bg-admin-surface/5 transition-colors">
                        <td className="p-4 text-xs text-gray-400">
                          {new Date(mov.createdAt).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${isAdd ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                            {mov.type}
                          </span>
                        </td>
                        <td className="p-4 text-center font-bold text-white">
                          {isAdd ? '+' : '-'}{mov.quantity}
                        </td>
                        <td className="p-4">
                          {mov.workOrder ? (
                            <Link href={`/admin/work-orders/${mov.workOrderId}`} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
                              <Wrench size={12}/> {mov.workOrder.workOrderNumber}
                            </Link>
                          ) : (
                            <span className="text-xs text-admin-muted">—</span>
                          )}
                        </td>
                        <td className="p-4 text-xs text-gray-300">
                          {mov.note || '—'}
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-secondary italic text-sm">
                        No stock movements recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
