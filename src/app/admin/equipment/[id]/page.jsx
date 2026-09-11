import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Briefcase, MapPin, FileText, Calendar, AlertTriangle } from 'lucide-react';

export const metadata = {
  title: 'Equipment Detail | Admin | MECELFAB',
};

export default async function (props) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const equipment = await db.equipment.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      amcs: {
        include: {
          amc: true
        }
      }
    }
  });

  if (!equipment) notFound();

  // Find all work orders that might be related (this might need a join table in future, but for now we look up by customer and maybe note)
  // To keep it simple, we will just list the AMCs for now.
  const activeAMC = equipment.amcs.find(a => a.amc.status === 'ACTIVE')?.amc;

  return (
    <div className="pb-12 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/equipment" className="p-2 border border-white/10 rounded-md text-secondary hover:bg-admin-surface/5 transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              {equipment.type}
              {activeAMC ? (
                <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded-full border bg-green-100 text-green-800 border-green-200">
                  AMC Active
                </span>
              ) : (
                <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded-full border bg-admin-elevated text-admin-heading border-admin-border">
                  No AMC
                </span>
              )}
            </h1>
            <p className="text-secondary text-sm mt-1">{equipment.model || 'Unknown Model'} - SN: {equipment.serialNumber || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-admin-surface/5 rounded-lg shadow-lg border border-white/10 overflow-hidden backdrop-blur-sm">
          <div className="p-5 border-b border-white/10 bg-black/20 flex justify-between items-center">
            <h2 className="font-semibold text-white flex items-center gap-2"><Briefcase size={18} className="text-blue-400"/> Equipment Details</h2>
          </div>
          <div className="p-5 grid grid-cols-1 gap-4">
            <div>
              <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">Type</p>
              <p className="text-sm font-semibold text-white">{equipment.type}</p>
            </div>
            <div>
              <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">Make / Model</p>
              <p className="text-sm text-gray-300">{equipment.model || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">Serial Number</p>
              <p className="text-sm text-gray-300 font-mono">{equipment.serialNumber || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">Installation Date</p>
              <p className="text-sm text-gray-300">{equipment.installationDate ? new Date(equipment.installationDate).toLocaleDateString() : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">Location</p>
              <p className="text-sm text-gray-300 flex items-center gap-2"><MapPin size={14}/> {equipment.location || '—'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-admin-surface/5 rounded-lg shadow-lg border border-white/10 overflow-hidden backdrop-blur-sm">
            <div className="p-5 border-b border-white/10 bg-black/20 flex justify-between items-center">
              <h2 className="font-semibold text-white flex items-center gap-2"><User size={18} className="text-indigo-400"/> Owner / Customer</h2>
            </div>
            <div className="p-5">
              <p className="text-sm font-semibold text-white mb-1">{equipment.customer.contactPerson}</p>
              <p className="text-sm text-gray-300 mb-3">{equipment.customer.companyName || '—'}</p>
              
              <div className="space-y-2">
                <p className="text-xs text-gray-400">{equipment.customer.email}</p>
                <p className="text-xs text-gray-400">{equipment.customer.phone || 'No phone'}</p>
              </div>
            </div>
          </div>

          <div className="bg-admin-surface/5 rounded-lg shadow-lg border border-white/10 overflow-hidden backdrop-blur-sm">
            <div className="p-5 border-b border-white/10 bg-black/20 flex justify-between items-center">
              <h2 className="font-semibold text-white flex items-center gap-2"><FileText size={18} className="text-green-400"/> Maintenance Contracts (AMC)</h2>
            </div>
            <div className="p-5">
              {equipment.amcs.length > 0 ? (
                <div className="space-y-3">
                  {equipment.amcs.map(a => (
                    <Link key={a.amcId} href={`/admin/amcs/${a.amc.id}`} className="block border border-white/10 bg-black/30 p-3 rounded hover:bg-admin-surface/5 transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">{a.amc.contractNumber}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${a.amc.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-admin-elevated text-admin-heading'}`}>
                          {a.amc.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-2">
                        <Calendar size={12}/> 
                        {new Date(a.amc.startDate).toLocaleDateString()} - {new Date(a.amc.endDate).toLocaleDateString()}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 border border-dashed border-white/20 rounded bg-black/20">
                  <AlertTriangle size={24} className="mx-auto text-amber-500 mb-2" />
                  <p className="text-sm text-secondary">No AMC linked to this equipment.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
