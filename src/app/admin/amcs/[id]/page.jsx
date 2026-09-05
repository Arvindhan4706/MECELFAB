import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, FileText, Briefcase, AlertTriangle } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import AMCVisitsManager from './AMCVisitsManager';

export const metadata = {
  title: 'AMC Detail | Admin | MECELFAB',
};

async function updateAMCStatus(formData) {
  'use server';
  const id = formData.get('id');
  const status = formData.get('status');
  
  await db.aMC.update({
    where: { id },
    data: { status }
  });
  
  revalidatePath(`/admin/amcs/${id}`);
  revalidatePath(`/admin/amcs`);
}

export default async function (props) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const amc = await db.aMC.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      equipment: {
        include: { equipment: true }
      },
      serviceVisits: {
        include: { technician: true, equipment: true },
        orderBy: { date: 'asc' }
      }
    }
  });

  const technicians = await db.user.findMany({
    where: { role: { in: ['TECHNICIAN', 'STAFF', 'ADMIN', 'SUPER_ADMIN'] } },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' }
  });

  if (!amc) notFound();

  const now = new Date();
  const end = new Date(amc.endDate);
  const daysUntilExpiry = (end - now) / (1000 * 60 * 60 * 24);
  
  const isExpiringSoon = amc.status === 'ACTIVE' && daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  const isExpired = daysUntilExpiry < 0 || amc.status === 'EXPIRED';

  const getStatusColor = () => {
    if (amc.status === 'CANCELLED') return 'bg-red-100 text-red-800 border-red-200';
    if (isExpired) return 'bg-admin-elevated text-admin-heading border-admin-border';
    if (isExpiringSoon) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getStatusText = () => {
    if (amc.status === 'CANCELLED') return 'CANCELLED';
    if (isExpired) return 'EXPIRED';
    if (isExpiringSoon) return 'EXPIRING SOON';
    return 'ACTIVE';
  };

  return (
    <div className="pb-12 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/amcs" className="p-2 border border-white/10 rounded-md text-secondary hover:bg-admin-surface/5 transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              {amc.amcNumber || amc.contractNumber || 'AMC Contract'}
              <span className={`px-2.5 py-0.5 text-xs font-bold uppercase rounded-full border ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </h1>
            <p className="text-secondary text-sm mt-1">
              Valid from {new Date(amc.startDate).toLocaleDateString()} to {new Date(amc.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {isExpiringSoon && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg mb-6 flex items-start gap-3">
          <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="text-amber-400 font-semibold text-sm">Action Required: AMC Expiring Soon</h3>
            <p className="text-amber-200/70 text-xs mt-1">This contract expires in {Math.ceil(daysUntilExpiry)} days. You should generate a renewal quotation and contact the client.</p>
          </div>
        </div>
      )}

      {isExpired && amc.status === 'ACTIVE' && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg mb-6 flex items-start gap-3">
          <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="text-red-400 font-semibold text-sm">AMC has Expired</h3>
            <p className="text-red-200/70 text-xs mt-1">This contract expired {Math.abs(Math.floor(daysUntilExpiry))} days ago but is still marked as Active. Please update the status.</p>
          </div>
          <form action={updateAMCStatus} className="ml-auto">
            <input type="hidden" name="id" value={amc.id} />
            <input type="hidden" name="status" value="EXPIRED" />
            <button type="submit" className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-xs font-bold transition-colors whitespace-nowrap">
              Mark as Expired
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Left Col */}
        <div className="space-y-6">
          <div className="bg-admin-surface/5 rounded-lg shadow-lg border border-white/10 overflow-hidden backdrop-blur-sm">
            <div className="p-5 border-b border-white/10 bg-black/20 flex justify-between items-center">
              <h2 className="font-semibold text-white flex items-center gap-2"><FileText size={18} className="text-blue-400"/> Contract Details</h2>
            </div>
            <div className="p-5 grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">Frequency</p>
                  <p className="text-base font-bold text-white uppercase">{amc.frequency}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">Status</p>
                  <form action={updateAMCStatus}>
                    <input type="hidden" name="id" value={amc.id} />
                    <select name="status" defaultValue={amc.status} onChange={(e) => e.target.form.requestSubmit()} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-sm text-white focus:border-blue-500 focus:outline-none">
                      <option value="DRAFT">Draft</option>
                      <option value="ACTIVE">Active</option>
                      <option value="EXPIRING">Expiring</option>
                      <option value="EXPIRED">Expired</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </form>
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-2">Covered Services / Scope</p>
                <div className="bg-black/30 p-4 rounded text-sm text-gray-300 whitespace-pre-wrap border border-white/5 h-28 overflow-y-auto">
                  {amc.coveredServices || amc.termsConditions || 'Comprehensive Preventive and Corrective Industrial Maintenance.'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-admin-surface/5 rounded-lg shadow-lg border border-white/10 overflow-hidden backdrop-blur-sm">
            <div className="p-5 border-b border-white/10 bg-black/20 flex justify-between items-center">
              <h2 className="font-semibold text-white flex items-center gap-2"><Briefcase size={18} className="text-purple-400"/> Covered Equipment</h2>
            </div>
            <div className="p-5">
              {amc.equipment.length > 0 ? (
                <div className="space-y-3">
                  {amc.equipment.map(eq => (
                    <Link key={eq.id} href={`/admin/equipment/${eq.equipmentId}`} className="block border border-white/10 bg-black/30 p-3 rounded hover:bg-admin-surface/5 transition-colors">
                      <div className="font-medium text-white text-sm mb-1">{eq.equipment.type}</div>
                      <div className="text-xs text-gray-400 flex justify-between">
                        <span>Model: {eq.equipment.model || 'N/A'}</span>
                        <span className="font-mono">SN: {eq.equipment.serialNumber || 'N/A'}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-secondary italic">No equipment explicitly linked to this contract.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Col */}
        <div className="space-y-6">
          <div className="bg-admin-surface/5 rounded-lg shadow-lg border border-white/10 overflow-hidden backdrop-blur-sm">
            <div className="p-5 border-b border-white/10 bg-black/20 flex justify-between items-center">
              <h2 className="font-semibold text-white flex items-center gap-2"><User size={18} className="text-indigo-400"/> Customer Details</h2>
            </div>
            <div className="p-5">
              <p className="text-sm font-semibold text-white mb-1">{amc.customer.contactPerson}</p>
              <p className="text-sm text-gray-300 mb-3">{amc.customer.companyName || '—'}</p>
              
              <div className="space-y-2">
                <p className="text-xs text-gray-400">{amc.customer.email}</p>
                <p className="text-xs text-gray-400">{amc.customer.phone || 'No phone'}</p>
                {amc.customer.location && (
                  <p className="text-xs text-gray-400">{amc.customer.location}</p>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Full-width Scheduled Service Visits Manager */}
      <AMCVisitsManager
        amcId={amc.id}
        frequency={amc.frequency}
        visits={amc.serviceVisits}
        technicians={technicians}
      />
    </div>
  );
}
