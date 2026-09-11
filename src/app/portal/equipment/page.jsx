import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, Shield, Calendar, ArrowRight, PlusCircle } from 'lucide-react';

export const metadata = {
  title: 'My Equipment & AMCs | Customer Portal | MECELFAB',
};

export default async function CustomerEquipmentPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect('/api/auth/signin?callbackUrl=/portal');

  const customer = await db.customer.findUnique({
    where: { userId: session.user.id },
  });

  if (!customer) redirect('/portal');

  // STRICT ISOLATION: Scoped exclusively to the authenticated customer
  const equipmentList = await db.equipment.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: 'desc' },
    include: {
      amcs: {
        include: {
          amc: {
            select: {
              id: true,
              amcNumber: true,
              status: true,
              frequency: true,
              startDate: true,
              endDate: true,
            },
          },
        },
      },
      serviceVisits: {
        orderBy: { date: 'desc' },
        take: 3,
        select: {
          id: true,
          date: true,
          status: true,
          workPerformed: true,
        },
      },
    },
  });

  const getEquipmentStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'UNDER_MAINTENANCE':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'OUT_OF_SERVICE':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  return (
    <div className="pb-12 max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Briefcase className="text-amber-400" />
            <span>My Registered Equipment & AMCs</span>
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Track your machinery assets, AMC contract coverages, and preventative maintenance schedules.
          </p>
        </div>

        <Link
          href="/portal/service-requests/new"
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md font-semibold text-sm flex items-center gap-2 transition-colors w-max shadow-sm"
        >
          <PlusCircle size={16} />
          <span>Raise Service Request</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {equipmentList.length > 0 ? (
          equipmentList.map((item) => {
            // Find active AMC coverage
            const activeAmcRel = item.amcs.find(
              (a) => a.amc.status === 'ACTIVE' && new Date(a.amc.endDate) >= new Date()
            );
            const activeAmc = activeAmcRel?.amc;

            return (
              <div
                key={item.id}
                className="bg-white/5 rounded-lg border border-white/10 p-6 shadow-lg backdrop-blur-sm flex flex-col justify-between space-y-4 hover:border-white/20 transition-all"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        {item.manufacturer || 'Industrial Asset'}
                      </span>
                      <h2 className="text-lg font-bold text-white mt-0.5">{item.type}</h2>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${getEquipmentStatusBadge(
                        item.status
                      )}`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 bg-black/30 p-3 rounded border border-white/5 mb-4">
                    <div>
                      <span className="text-gray-500 block">Model:</span>
                      <span className="font-medium text-white">{item.model || 'Standard Spec'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Serial Number:</span>
                      <span className="font-mono text-white">{item.serialNumber || 'N/A'}</span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-white/5">
                      <span className="text-gray-500">Location: </span>
                      <span className="text-gray-300">{item.location || 'Client Facility'}</span>
                    </div>
                  </div>

                  {/* AMC Coverage Box */}
                  <div className="border border-white/10 rounded p-3.5 bg-black/20">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Shield size={14} className={activeAmc ? 'text-green-400' : 'text-gray-500'} />
                        <span>Annual Maintenance Contract</span>
                      </span>
                      {activeAmc ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-green-500/10 text-green-400 border border-green-500/20">
                          Active Coverage
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                          No Active AMC
                        </span>
                      )}
                    </div>

                    {activeAmc ? (
                      <div className="text-xs text-gray-300 space-y-1">
                        <p>
                          Contract: <span className="font-semibold text-white">{activeAmc.amcNumber}</span> ({activeAmc.frequency})
                        </p>
                        <p className="text-gray-400 flex items-center gap-1">
                          <Calendar size={12} /> Valid until: {new Date(activeAmc.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-gray-400 italic">
                        On-demand service support available. Contact Us to enroll this machine into an AMC plan.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                  <Link
                    href={`/portal/service-requests/new?equipmentId=${item.id}`}
                    className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                  >
                    <span>Request Service for Machine</span>
                    <ArrowRight size={12} />
                  </Link>
                  <Link
                    href={`/portal/equipment/${item.id}`}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Full History →
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 bg-white/5 border border-white/10 rounded-lg p-12 text-center text-gray-400">
            <Briefcase size={40} className="mx-auto mb-3 opacity-30 text-amber-400" />
            <h3 className="text-lg font-bold text-white">No registered equipment yet</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
              Your facility machinery and fabricated assemblies will be cataloged here along with warranty and AMC contracts.
            </p>
            <Link
              href="/portal/service-requests/new"
              className="mt-5 inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded transition-colors"
            >
              <PlusCircle size={14} />
              <span>Submit Machinery for Service</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
