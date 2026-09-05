import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Shield, Clock, PlusCircle } from 'lucide-react';

export const metadata = {
  title: 'Equipment & Maintenance History | Customer Portal | MECELFAB',
};

export default async function CustomerEquipmentDetailPage(props) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect('/api/auth/signin?callbackUrl=/portal');

  const customer = await db.customer.findUnique({
    where: { userId: session.user.id },
  });

  if (!customer) redirect('/portal');

  // STRICT IDOR PROTECTION: Scoped to both id and customerId
  const equipment = await db.equipment.findFirst({
    where: {
      id: params.id,
      customerId: customer.id,
    },
    include: {
      amcs: {
        include: {
          amc: true,
        },
      },
      serviceVisits: {
        orderBy: { date: 'desc' },
        include: {
          technician: { select: { name: true } },
          workOrder: { select: { workOrderNumber: true } },
        },
      },
    },
  });

  if (!equipment) notFound();

  return (
    <div className="pb-12 max-w-5xl mx-auto">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/portal/equipment"
            className="p-2 border border-white/10 rounded-md text-secondary hover:bg-white/5 transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <span>{equipment.type}</span>
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded-full border bg-green-500/10 text-green-400 border-green-500/30">
                {equipment.status.replace('_', ' ')}
              </span>
            </h1>
            <p className="text-gray-400 text-xs mt-1">
              Model: {equipment.model || 'Standard'} • S/N: {equipment.serialNumber || 'N/A'} • Location: {equipment.location || 'Client Facility'}
            </p>
          </div>
        </div>

        <Link
          href={`/portal/service-requests/new?equipmentId=${equipment.id}`}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md font-semibold text-xs flex items-center gap-2 transition-colors w-max shadow-sm"
        >
          <PlusCircle size={15} />
          <span>Request Maintenance for this Machine</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Maintenance & Visit Logs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden backdrop-blur-sm">
            <div className="p-4 border-b border-white/10 bg-black/20 flex justify-between items-center">
              <h2 className="font-semibold text-white text-sm flex items-center gap-2">
                <Clock size={16} className="text-amber-400" />
                <span>Maintenance History & Field Service Logs</span>
              </h2>
              <span className="text-xs text-gray-400">{equipment.serviceVisits.length} record(s)</span>
            </div>
            <div className="p-0">
              {equipment.serviceVisits.length > 0 ? (
                <ul className="divide-y divide-white/5">
                  {equipment.serviceVisits.map((visit) => (
                    <li key={visit.id} className="p-5 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {new Date(visit.date).toLocaleDateString()}
                          </p>
                          {visit.workOrder && (
                            <p className="text-xs text-blue-400 font-mono">
                              Work Order: {visit.workOrder.workOrderNumber}
                            </p>
                          )}
                        </div>
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-green-500/10 text-green-400 border border-green-500/20">
                          {visit.status.replace('_', ' ')}
                        </span>
                      </div>

                      {visit.workPerformed && (
                        <p className="text-xs text-gray-300">
                          <span className="text-gray-400 font-semibold">Service: </span>
                          {visit.workPerformed}
                        </p>
                      )}

                      {visit.observations && (
                        <p className="text-xs text-gray-400">
                          <span className="text-gray-500 font-semibold">Observations: </span>
                          {visit.observations}
                        </p>
                      )}

                      {visit.recommendations && (
                        <p className="text-xs text-amber-300/80">
                          <span className="text-amber-400 font-semibold">Recommendations: </span>
                          {visit.recommendations}
                        </p>
                      )}

                      {visit.technician && (
                        <p className="text-[11px] text-gray-500 pt-1">
                          Serviced by: {visit.technician.name}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center text-xs text-gray-400 italic">
                  No previous maintenance visits recorded for this equipment.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AMC Contracts & Machine Specs */}
        <div className="space-y-6">
          <div className="bg-white/5 rounded-lg border border-white/10 p-5 backdrop-blur-sm space-y-4">
            <h2 className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
              <Shield size={15} className="text-green-400" />
              <span>AMC Coverage Details</span>
            </h2>

            {equipment.amcs.length > 0 ? (
              <div className="space-y-3">
                {equipment.amcs.map((rel) => {
                  const amc = rel.amc;
                  const isActive = amc.status === 'ACTIVE' && new Date(amc.endDate) >= new Date();
                  return (
                    <div key={amc.id} className="p-3 bg-black/30 border border-white/5 rounded text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">{amc.amcNumber}</span>
                        <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] uppercase ${isActive ? 'bg-green-500/10 text-green-400' : 'bg-zinc-800 text-zinc-400'}`}>
                          {isActive ? 'Active' : amc.status}
                        </span>
                      </div>
                      <p className="text-gray-400">Frequency: <span className="text-white font-medium">{amc.frequency}</span></p>
                      <p className="text-gray-400">
                        Coverage: {new Date(amc.startDate).toLocaleDateString()} to {new Date(amc.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-black/20 border border-white/5 rounded text-xs text-gray-400 space-y-2">
                <p>No active AMC contract linked to this unit.</p>
                <p className="text-[11px] text-gray-500">
                  Protect equipment longevity with planned periodic preventative inspections.
                </p>
              </div>
            )}
          </div>

          <div className="bg-white/5 rounded-lg border border-white/10 p-5 backdrop-blur-sm space-y-3 text-xs">
            <h2 className="font-bold text-secondary uppercase tracking-wider">Asset Specifications</h2>
            <div className="space-y-2 text-gray-300">
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-gray-500">Asset Type:</span>
                <span className="font-semibold text-white">{equipment.type}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-gray-500">Manufacturer:</span>
                <span>{equipment.manufacturer || '—'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-gray-500">Model:</span>
                <span>{equipment.model || '—'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-gray-500">Serial No:</span>
                <span className="font-mono">{equipment.serialNumber || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Facility Location:</span>
                <span>{equipment.location || 'Main Site'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
