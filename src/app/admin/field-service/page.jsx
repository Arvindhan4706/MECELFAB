import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Wrench, Calendar, Clock, MapPin, User, ChevronRight, CheckCircle } from 'lucide-react';

export const metadata = {
  title: 'Field Service Visits | MECELFAB Admin',
};

export default async function FieldServicePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const user = session.user;
  const isTechnicianOnly = user.role === 'TECHNICIAN';

  // If technician, scope to visits assigned to them. Otherwise, show all visits.
  const whereClause = isTechnicianOnly
    ? { technicianId: user.id }
    : {};

  const visits = await db.serviceVisit.findMany({
    where: whereClause,
    include: {
      customer: true,
      equipment: true,
      technician: true,
      amc: true
    },
    orderBy: { date: 'asc' }
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1"><CheckCircle size={12}/> COMPLETED</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1"><Clock size={12}/> IN PROGRESS</span>;
      case 'ASSIGNED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1"><User size={12}/> ASSIGNED</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-500/10 text-red-400 border border-red-500/20">CANCELLED</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-white/10 text-gray-300 border border-white/20">SCHEDULED</span>;
    }
  };

  return (
    <div className="pb-12 max-w-4xl mx-auto px-4 sm:px-0">
      <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <Wrench className="text-accent" size={28} />
            Field Service Operations
          </h1>
          <p className="text-secondary text-sm mt-1">
            {isTechnicianOnly
              ? 'Your assigned field maintenance visits and on-site job orders.'
              : 'Enterprise scheduling and on-site technician execution dispatch.'}
          </p>
        </div>
      </div>

      {visits.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-white/20 rounded-xl bg-admin-surface/5 p-6">
          <Wrench size={40} className="mx-auto text-admin-muted mb-3 opacity-40" />
          <h3 className="text-lg font-semibold text-white">No Service Visits Found</h3>
          <p className="text-sm text-secondary mt-1 max-w-md mx-auto">
            {isTechnicianOnly
              ? 'You currently have no scheduled or assigned field visits.'
              : 'Generate maintenance visits from an active AMC contract to schedule visits.'}
          </p>
          {!isTechnicianOnly && (
            <Link
              href="/admin/amcs"
              className="inline-block mt-4 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded transition-colors"
            >
              Go to AMC Contracts
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {visits.map((visit) => (
            <Link
              key={visit.id}
              href={`/admin/field-service/${visit.id}`}
              className="block bg-admin-surface/5 border border-white/10 hover:border-accent/40 rounded-xl p-5 shadow-lg backdrop-blur-sm transition-all hover:translate-y-[-1px]"
            >
              <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                      {visit.amc ? `AMC: ${visit.amc.amcNumber}` : 'Routine Service'}
                    </span>
                    {visit.customerAcknowledgement && (
                      <span className="text-[11px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded font-medium">
                        Signed Off
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-white mt-1">
                    {visit.customer.companyName || visit.customer.contactPerson}
                  </h3>
                </div>
                <div>{getStatusBadge(visit.status)}</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300 pt-3 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-secondary shrink-0" />
                  <span>
                    {new Date(visit.date).toLocaleDateString(undefined, {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-secondary shrink-0" />
                  <span>Slot: {visit.timeSlot || '10:00 - 13:00'}</span>
                </div>
                {visit.equipment && (
                  <div className="flex items-center gap-2">
                    <Wrench size={14} className="text-secondary shrink-0" />
                    <span>Equipment: {visit.equipment.type} ({visit.equipment.model || 'Standard'})</span>
                  </div>
                )}
                {visit.customer.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-secondary shrink-0" />
                    <span className="truncate">{visit.customer.location}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-xs">
                <span className="text-secondary flex items-center gap-1.5">
                  <User size={13} />
                  Tech: <strong className="text-white">{visit.technician ? (visit.technician.name || visit.technician.email) : 'Unassigned'}</strong>
                </span>
                <span className="text-accent hover:text-accent-hover font-semibold flex items-center gap-1">
                  Open Job Sheet <ChevronRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
