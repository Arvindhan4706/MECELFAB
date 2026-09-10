import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';
import { Cpu, CheckCircle, AlertTriangle, Clock, ArrowRight, Settings } from 'lucide-react';

export const metadata = { title: 'My Assets | MECELFAB Portal' };

function getDaysLeft(date) {
  return Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
}

export default async function AssetsPage() {
  const session = await getServerSession(authOptions);

  const customer = await db.customer.findUnique({
    where: { userId: session.user.id },
    include: {
      equipment: {
        include: { amcs: { include: { amc: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!customer) return null;

  const equipment = customer.equipment;
  const withAmc = equipment.filter((eq) => eq.amcs.some((a) => a.amc.status === 'ACTIVE')).length;
  const withoutAmc = equipment.length - withAmc;

  return (
    <div className="max-w-5xl mx-auto pb-10 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <p className="text-[11px] text-zinc-600 uppercase tracking-wider font-semibold mb-0.5">Equipment & AMC Contracts</p>
          <h2 className="text-base font-bold text-white font-heading">{equipment.length} registered asset{equipment.length !== 1 ? 's' : ''}</h2>
        </div>
        <Link
          href="/portal/requests/new?type=amc"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-white text-black hover:bg-zinc-100 transition-colors rounded-md"
        >
          Request AMC
        </Link>
      </div>

      {/* Summary row */}
      {equipment.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-white/[0.07] rounded text-xs text-zinc-400">
            <CheckCircle size={12} className="text-emerald-400" />
            {withAmc} with active AMC
          </div>
          {withoutAmc > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-white/[0.07] rounded text-xs text-zinc-400">
              <AlertTriangle size={12} className="text-amber-400" />
              {withoutAmc} without AMC coverage
            </div>
          )}
        </div>
      )}

      {/* Equipment table */}
      {equipment.length > 0 ? (
        <div className="rounded-md border border-white/[0.07] bg-zinc-900 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.07]">
                <th className="px-5 py-3 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Equipment</th>
                <th className="px-5 py-3 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider hidden sm:table-cell">Serial No.</th>
                <th className="px-5 py-3 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider hidden md:table-cell">Location</th>
                <th className="px-5 py-3 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Condition</th>
                <th className="px-5 py-3 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">AMC Status</th>
                <th className="px-5 py-3 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider hidden lg:table-cell">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {equipment.map((eq) => {
                const activeAmc = eq.amcs.find((a) => a.amc.status === 'ACTIVE');
                const daysLeft = activeAmc ? getDaysLeft(activeAmc.amc.endDate) : null;
                const expiringSoon = daysLeft !== null && daysLeft <= 60;

                const conditionMap = {
                  ACTIVE: { dot: 'bg-emerald-400', label: 'Operational' },
                  UNDER_MAINTENANCE: { dot: 'bg-amber-400', label: 'Under Maintenance' },
                  OUT_OF_SERVICE: { dot: 'bg-red-400', label: 'Out of Service' },
                  RETIRED: { dot: 'bg-zinc-600', label: 'Retired' },
                };
                const cond = conditionMap[eq.status] || conditionMap.ACTIVE;

                return (
                  <tr key={eq.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-zinc-800 border border-white/[0.06] rounded flex items-center justify-center flex-shrink-0">
                          <Cpu size={14} className="text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{eq.type}</p>
                          <p className="text-[11px] text-zinc-600 mt-0.5">
                            {[eq.manufacturer, eq.model].filter(Boolean).join(' · ') || 'Details on file'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="text-sm text-zinc-400 font-mono">{eq.serialNumber || '—'}</span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-sm text-zinc-400">{eq.location || '—'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-300">
                        <span className={`w-1.5 h-1.5 rounded-full ${cond.dot}`} />
                        {cond.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {activeAmc ? (
                        <div>
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                            <CheckCircle size={11} /> Active
                          </span>
                          <p className={`text-[10px] mt-0.5 flex items-center gap-1 ${expiringSoon ? 'text-amber-400' : 'text-zinc-600'}`}>
                            <Clock size={9} />
                            {daysLeft > 0 ? `${daysLeft}d remaining` : 'Expired'}
                          </p>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-600">
                          <AlertTriangle size={11} /> No AMC
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <Link
                        href="/portal/requests/new?type=amc"
                        className={`text-[11px] font-medium flex items-center gap-1 transition-colors ${
                          !activeAmc || expiringSoon
                            ? 'text-white hover:text-zinc-300'
                            : 'text-zinc-600 hover:text-zinc-400'
                        }`}
                      >
                        {!activeAmc ? 'Get AMC' : expiringSoon ? 'Renew AMC' : 'View Details'}
                        <ArrowRight size={10} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-md border border-white/[0.07] bg-zinc-900 py-16 text-center">
          <Settings size={28} className="text-zinc-700 mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-400 mb-1">No equipment registered</p>
          <p className="text-xs text-zinc-600 max-w-sm mx-auto leading-relaxed">
            When MECELFAB services or installs equipment under your account, it will appear here with full AMC and maintenance history.
          </p>
        </div>
      )}
    </div>
  );
}
