import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Package, Search, Plus, AlertTriangle, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Inventory | Admin | MECELFAB',
};

export default async function InventoryPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || '';
  const filter = resolvedParams?.filter || '';

  const where = {};
  if (search) {
    where.OR = [
      { partNumber: { contains: search } },
      { name: { contains: search } },
      { category: { contains: search } }
    ];
  }
  
  if (filter === 'low_stock') {
    // Cannot easily compare column to column in raw prisma findMany without raw query, so we'll filter post-query for simplicity, or just fetch all and filter if it's small.
    // Actually Prisma has `where: { quantity: { lte: db.raw('minimumStock') } }` but it's complex. Let's fetch all and filter in memory since demo data is small.
  }

  let parts = await db.part.findMany({
    where,
    orderBy: { partNumber: 'asc' }
  });

  if (filter === 'low_stock') {
    parts = parts.filter(p => p.quantity <= p.minimumStock);
  }

  // Calculate some basic stats
  const totalItems = parts.length;
  const lowStockCount = parts.filter(p => p.quantity <= p.minimumStock).length;
  const outOfStockCount = parts.filter(p => p.quantity === 0).length;

  return (
    <div className="pb-12">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package size={24} /> Parts Inventory
          </h1>
          <p className="text-secondary text-sm mt-1">Manage spare parts, stock levels, and consumption.</p>
        </div>
        <Link href="/admin/inventory/new" className="bg-admin-surface text-primary px-4 py-2 rounded font-medium text-sm flex items-center gap-2 hover:bg-admin-elevated transition-colors w-max">
          <Plus size={16} /> Add Part
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-admin-surface/5 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm p-4">
          <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">Total Parts</p>
          <p className="text-2xl font-bold text-white">{totalItems}</p>
        </div>
        <div className="bg-admin-surface/5 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm p-4">
          <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">Low Stock Alerts</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-amber-400">{lowStockCount}</p>
            {lowStockCount > 0 && <AlertTriangle size={16} className="text-amber-400"/>}
          </div>
        </div>
        <div className="bg-admin-surface/5 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm p-4">
          <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">Out of Stock</p>
          <p className="text-2xl font-bold text-red-400">{outOfStockCount}</p>
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
                placeholder="Search by part number, name, category..." 
                className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-md text-white text-sm focus:border-white/30 focus:outline-none transition-colors"
              />
            </div>
            <select 
              name="filter"
              defaultValue={filter}
              className="px-4 py-2 bg-black/40 border border-white/10 rounded-md text-white text-sm focus:border-white/30 focus:outline-none"
            >
              <option value="">All Stock Levels</option>
              <option value="low_stock">Low Stock / Out of Stock</option>
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
                <th className="p-4 font-medium">Part Number</th>
                <th className="p-4 font-medium">Name & Details</th>
                <th className="p-4 font-medium text-center">In Stock</th>
                <th className="p-4 font-medium text-center">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {parts.length > 0 ? parts.map(part => {
                const isLow = part.quantity > 0 && part.quantity <= part.minimumStock;
                const isOut = part.quantity === 0;
                
                return (
                <tr key={part.id} className="hover:bg-admin-surface/5 transition-colors group">
                  <td className="p-4">
                    <Link href={`/admin/inventory/${part.id}`} className="font-mono font-semibold text-white hover:text-blue-400 transition-colors">
                      {part.partNumber}
                    </Link>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-300">{part.name}</div>
                    <div className="text-xs text-secondary mt-1">
                      {part.category || 'Uncategorized'} {part.manufacturer && `• ${part.manufacturer}`}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className={`text-lg font-bold ${isOut ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-white'}`}>
                      {part.quantity}
                    </div>
                    <div className="text-[10px] text-secondary">Min: {part.minimumStock}</div>
                  </td>
                  <td className="p-4 text-center">
                    {isOut ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded border bg-red-500/20 text-red-400 border-red-500/30">Out of Stock</span>
                    ) : isLow ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded border bg-amber-500/20 text-amber-400 border-amber-500/30">Low Stock</span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded border bg-green-500/20 text-green-400 border-green-500/30">Healthy</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/admin/inventory/${part.id}`} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-admin-surface/5 hover:bg-admin-surface/10 text-white transition-colors">
                      <ArrowRight size={16} />
                    </Link>
                  </td>
                </tr>
              )}) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-secondary">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package size={32} className="text-admin-muted mb-2" />
                      <p>No parts found in inventory.</p>
                      <Link href="/admin/inventory/new" className="text-blue-400 hover:text-blue-300 text-sm mt-2">
                        Add a new part
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
