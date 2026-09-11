import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Phone, MapPin, Clock, Wrench } from 'lucide-react';
import TechnicianVisitForm from './TechnicianVisitForm';

export const metadata = {
  title: 'Service Visit Job Sheet | MECELFAB Admin',
};

export default async function ServiceVisitDetailPage(props) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const user = session.user;

  const visit = await db.serviceVisit.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      equipment: true,
      technician: true,
      amc: true,
      workOrder: true
    }
  });

  if (!visit) notFound();

  const isAssignedTechnician = visit.technicianId === user.id;
  const isAdminOrManager = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role);

  // If user is TECHNICIAN and not assigned to this visit, forbid
  if (user.role === 'TECHNICIAN' && !isAssignedTechnician && !isAdminOrManager) {
    redirect('/admin/field-service');
  }

  const getStatusColor = () => {
    switch (visit.status) {
      case 'COMPLETED':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'IN_PROGRESS':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'ASSIGNED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-white/10 text-gray-300 border-white/20';
    }
  };

  return (
    <div className="pb-16 max-w-4xl mx-auto px-4 sm:px-0">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/field-service"
            className="p-2 border border-white/10 rounded-md text-secondary hover:bg-white/5 transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Job Sheet #{visit.id.slice(-6).toUpperCase()}
              </h1>
              <span className={`px-2.5 py-0.5 text-xs font-bold uppercase rounded-full border ${getStatusColor()}`}>
                {visit.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-secondary text-xs mt-1">
              Scheduled for {new Date(visit.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {visit.amc && (
          <Link
            href={`/admin/amcs/${visit.amc.id}`}
            className="hidden sm:inline-flex text-xs text-accent hover:underline font-semibold"
          >
            View AMC {visit.amc.amcNumber}
          </Link>
        )}
      </div>

      {/* Customer & Location Quick Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-admin-surface/5 border border-white/10 rounded-xl p-5 backdrop-blur-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-secondary">
            <User size={14} className="text-accent" /> Customer Details
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              {visit.customer.companyName || visit.customer.contactPerson}
            </h3>
            <p className="text-xs text-secondary mt-0.5">
              Contact: <strong className="text-gray-300">{visit.customer.contactPerson}</strong>
            </p>
          </div>
          <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs text-gray-300">
            {visit.customer.phone && (
              <p className="flex items-center gap-2">
                <Phone size={13} className="text-secondary" />
                <a href={`tel:${visit.customer.phone}`} className="hover:text-accent underline">
                  {visit.customer.phone}
                </a>
              </p>
            )}
            {visit.customer.location && (
              <p className="flex items-start gap-2">
                <MapPin size={13} className="text-secondary shrink-0 mt-0.5" />
                <span>{visit.customer.location}</span>
              </p>
            )}
          </div>
        </div>

        <div className="bg-admin-surface/5 border border-white/10 rounded-xl p-5 backdrop-blur-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-secondary">
            <Wrench size={14} className="text-accent" /> Equipment & Assignment
          </div>
          {visit.equipment ? (
            <div>
              <h3 className="text-base font-semibold text-white">
                {visit.equipment.type}
              </h3>
              <p className="text-xs text-secondary mt-0.5">
                Model: <strong className="text-gray-300">{visit.equipment.model || 'N/A'}</strong> | SN: <strong className="font-mono text-gray-300">{visit.equipment.serialNumber || 'N/A'}</strong>
              </p>
            </div>
          ) : (
            <p className="text-xs text-secondary italic">No specific machinery tagged. General facility maintenance.</p>
          )}

          <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs text-gray-300">
            <p className="flex items-center gap-2">
              <Clock size={13} className="text-secondary" />
              <span>Time Slot: <strong className="text-white">{visit.timeSlot || '10:00 - 13:00'}</strong></span>
            </p>
            <p className="flex items-center gap-2">
              <User size={13} className="text-secondary" />
              <span>Technician: <strong className="text-white">{visit.technician ? (visit.technician.name || visit.technician.email) : 'Unassigned'}</strong></span>
            </p>
          </div>
        </div>
      </div>

      {/* Execution Form */}
      <TechnicianVisitForm
        visit={visit}
        isAssignedTechnician={isAssignedTechnician}
        isAdminOrManager={isAdminOrManager}
      />
    </div>
  );
}
