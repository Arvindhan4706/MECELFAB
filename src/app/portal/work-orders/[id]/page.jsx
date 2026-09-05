import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, FileText, Clock, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Work Order Details | Customer Portal | MECELFAB',
};

export default async function CustomerWorkOrderDetailPage(props) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect('/api/auth/signin?callbackUrl=/portal');

  const customer = await db.customer.findUnique({
    where: { userId: session.user.id },
  });

  if (!customer) redirect('/portal');

  // STRICT IDOR PROTECTION: Must match both id and customerId
  const workOrder = await db.workOrder.findFirst({
    where: {
      id: params.id,
      customerId: customer.id, // Enforce strict tenant isolation
    },
    include: {
      assignedTo: { select: { name: true, role: true } },
      quotation: { select: { quotationNumber: true, validityDays: true } },
      serviceVisits: {
        orderBy: { date: 'asc' },
        select: {
          id: true,
          date: true,
          timeSlot: true,
          status: true,
          workPerformed: true,
          observations: true,
          recommendations: true,
          customerAcknowledgement: true,
          completedAt: true,
        },
      },
      invoices: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          invoiceNumber: true,
          status: true,
          grandTotal: true,
          issueDate: true,
          dueDate: true,
        },
      },
    },
  });

  if (!workOrder) notFound();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'IN_PROGRESS':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'ASSIGNED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'SCHEDULED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  return (
    <div className="pb-12 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/portal/work-orders"
            className="p-2 border border-white/10 rounded-md text-secondary hover:bg-white/5 transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <span>{workOrder.workOrderNumber}</span>
              <span className={`px-2.5 py-0.5 text-xs font-bold uppercase rounded-full border ${getStatusBadge(workOrder.status)}`}>
                {workOrder.status.replace('_', ' ')}
              </span>
            </h1>
            <p className="text-gray-400 text-xs mt-1">
              Created on {new Date(workOrder.createdAt).toLocaleDateString()}
              {workOrder.quotation && ` • Converted from Quotation ${workOrder.quotation.quotationNumber}`}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scope & Visits */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Overview */}
          <div className="bg-white/5 rounded-lg border border-white/10 p-6 backdrop-blur-sm">
            <h2 className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Scope of Operations</h2>
            <h3 className="text-lg font-bold text-white mb-2">{workOrder.service || 'Industrial Works'}</h3>
            <div className="bg-black/30 border border-white/5 rounded p-4 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
              {workOrder.description || 'Service execution according to engineering drawings and technical scope.'}
            </div>
          </div>

          {/* Service Visits & Field Reports */}
          <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden backdrop-blur-sm">
            <div className="p-4 border-b border-white/10 bg-black/20 flex justify-between items-center">
              <h2 className="font-semibold text-white text-sm flex items-center gap-2">
                <Clock size={16} className="text-amber-400" />
                <span>Field Service Execution & Visit Log</span>
              </h2>
              <span className="text-xs text-gray-400">{workOrder.serviceVisits.length} visit(s)</span>
            </div>
            <div className="p-0">
              {workOrder.serviceVisits.length > 0 ? (
                <ul className="divide-y divide-white/5">
                  {workOrder.serviceVisits.map((visit, idx) => (
                    <li key={visit.id} className="p-5 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Visit #{idx + 1}</span>
                          <p className="text-sm font-semibold text-white">
                            {new Date(visit.date).toLocaleDateString()} {visit.timeSlot && `(${visit.timeSlot})`}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${getStatusBadge(visit.status)}`}>
                          {visit.status.replace('_', ' ')}
                        </span>
                      </div>

                      {visit.workPerformed && (
                        <div className="text-xs text-gray-300">
                          <span className="font-semibold text-gray-400">Work Performed: </span>
                          <span>{visit.workPerformed}</span>
                        </div>
                      )}

                      {visit.observations && (
                        <div className="text-xs text-gray-300">
                          <span className="font-semibold text-gray-400">Observations: </span>
                          <span>{visit.observations}</span>
                        </div>
                      )}

                      {visit.recommendations && (
                        <div className="text-xs text-amber-300/90">
                          <span className="font-semibold text-amber-400">Recommendations: </span>
                          <span>{visit.recommendations}</span>
                        </div>
                      )}

                      {visit.customerAcknowledgement && (
                        <div className="flex items-center gap-1.5 text-[11px] text-green-400 pt-1">
                          <ShieldCheck size={14} />
                          <span>Acknowledged & Approved on-site</span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center text-xs text-gray-400 italic">
                  Technician visit schedule is being coordinated by our operations dispatch team.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Execution Metadata & Billing */}
        <div className="space-y-6">
          {/* Scheduling & Personnel */}
          <div className="bg-white/5 rounded-lg border border-white/10 p-5 backdrop-blur-sm space-y-4">
            <h2 className="text-xs font-bold text-secondary uppercase tracking-wider">Execution Summary</h2>

            <div>
              <p className="text-xs text-secondary mb-0.5">Priority</p>
              <p className="text-sm font-semibold text-white">{workOrder.priority || 'MEDIUM'}</p>
            </div>

            <div>
              <p className="text-xs text-secondary mb-0.5">Scheduled Date</p>
              <div className="flex items-center gap-2 text-sm text-white">
                <Calendar size={15} className="text-amber-400" />
                <span>{workOrder.scheduledDate ? new Date(workOrder.scheduledDate).toLocaleDateString() : 'To be confirmed'}</span>
              </div>
            </div>

            <div>
              <p className="text-xs text-secondary mb-0.5">Assigned Specialist</p>
              <div className="flex items-center gap-2 text-sm text-white">
                <User size={15} className="text-blue-400" />
                <span>{workOrder.assignedTo ? `${workOrder.assignedTo.name} (${workOrder.assignedTo.role})` : 'MECELFAB Engineering Team'}</span>
              </div>
            </div>
          </div>

          {/* Linked Invoices */}
          <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden backdrop-blur-sm">
            <div className="p-4 border-b border-white/10 bg-black/20 flex justify-between items-center">
              <h2 className="font-semibold text-white text-sm flex items-center gap-2">
                <FileText size={16} className="text-green-400" />
                <span>Associated Billing</span>
              </h2>
            </div>
            <div className="p-4">
              {workOrder.invoices.length > 0 ? (
                <div className="space-y-3">
                  {workOrder.invoices.map((inv) => (
                    <div key={inv.id} className="p-3 bg-black/30 border border-white/5 rounded text-xs space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">{inv.invoiceNumber}</span>
                        <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] uppercase ${inv.status === 'PAID' ? 'text-green-400 bg-green-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                          {inv.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-300">
                        Total Amount: <span className="font-semibold text-white">₹ {inv.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </p>
                      <Link
                        href="/portal/invoices"
                        className="text-blue-400 hover:text-blue-300 font-semibold block pt-1"
                      >
                        View Billing Details →
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">
                  Tax invoice will be generated upon milestone delivery or job completion.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
