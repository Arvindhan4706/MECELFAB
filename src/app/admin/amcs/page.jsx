import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FileText, Search, Plus, Calendar } from 'lucide-react';

export const metadata = {
  title: 'AMCs | Admin | MECELFAB',
};

export default async function AMCsPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const resolvedParams = await searchParams;
  const statusFilter = resolvedParams?.status || '';
  const search = resolvedParams?.search || '';

  const where = {};
  if (statusFilter) where.status = statusFilter;
  if (search) {
    where.OR = [
      { contractNumber: { contains: search } },
      { customer: { contactPerson: { contains: search } } },
      { customer: { companyName: { contains: search } } }
    ];
  }

  const amcs = await db.aMC.findMany({
    where,
    orderBy: { endDate: 'asc' }, // Order by closest expiry
    include: {
      customer: true,
      equipment: true
    }
  });

  const getStatusColor = (status, endDate) => {
    if (status !== 'ACTIVE') {
      return status === 'EXPIRED' ? 'bg-admin-elevated text-admin-heading border-admin-border' : 'bg-red-100 text-red-800 border-red-200';
    }
    
    const now = new Date();
    const end = new Date(endDate);
    const daysUntilExpiry = (end - now) / (1000 * 60 * 60 * 24);
    
    if (daysUntilExpiry < 0) return 'bg-admin-elevated text-admin-heading border-admin-border'; // Should be EXPIRED logically
    if (daysUntilExpiry <= 30) return 'bg-amber-100 text-amber-800 border-amber-200'; // Expiring soon
    return 'bg-green-100 text-green-800 border-green-200'; // Healthy
  };

  const getStatusText = (status, endDate) => {
    if (status !== 'ACTIVE') return status;
    const now = new Date();
    const end = new Date(endDate);
    const daysUntilExpiry = (end - now) / (1000 * 60 * 60 * 24);
    if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) return 'EXPIRING SOON';
    return status;
  };

  return (
    <div className="pb-12">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText size={24} /> AMC Management
          </h1>
          <p className="text-secondary text-sm mt-1">Manage Annual Maintenance Contracts and track renewals.</p>
        </div>
        <Link href="/admin/amcs/new" className="bg-admin-surface text-primary px-4 py-2 rounded font-medium text-sm flex items-center gap-2 hover:bg-admin-elevated transition-colors w-max">
          <Plus size={16} /> New AMC
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
                placeholder="Search by contract no, customer, company..." 
                className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-md text-white text-sm focus:border-white/30 focus:outline-none transition-colors"
              />
            </div>
            <select 
              name="status"
              defaultValue={statusFilter}
              className="px-4 py-2 bg-black/40 border border-white/10 rounded-md text-white text-sm focus:border-white/30 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
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
                <th className="p-4 font-medium">Contract No</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Period</th>
                <th className="p-4 font-medium">Value</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {amcs.length > 0 ? amcs.map(amc => (
                <tr key={amc.id} className="hover:bg-admin-surface/5 transition-colors group">
                  <td className="p-4">
                    <Link href={`/admin/amcs/${amc.id}`} className="font-semibold text-white hover:text-blue-400 transition-colors">
                      {amc.contractNumber}
                    </Link>
                    <div className="text-xs text-secondary mt-1">{amc.equipment.length} equipment covered</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-300">{amc.customer.contactPerson}</div>
                    <div className="text-xs text-secondary mt-1">{amc.customer.companyName || '—'}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Calendar size={14} className="text-admin-muted" />
                      {new Date(amc.startDate).toLocaleDateString()} - {new Date(amc.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium text-gray-300">
                      ₹ {(amc.totalValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border ${getStatusColor(amc.status, amc.endDate)}`}>
                      {getStatusText(amc.status, amc.endDate)}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-secondary">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText size={32} className="text-admin-muted mb-2" />
                      <p>No AMCs found matching your criteria.</p>
                      <Link href="/admin/amcs/new" className="text-blue-400 hover:text-blue-300 text-sm mt-2">
                        Create your first AMC
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
