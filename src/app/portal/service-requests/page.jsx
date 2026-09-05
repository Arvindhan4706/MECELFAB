import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Shield, PlusCircle, Clock } from 'lucide-react';

export const metadata = {
  title: 'Service Requests | Customer Portal | MECELFAB',
};

export default async function CustomerServiceRequestsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect('/api/auth/signin?callbackUrl=/portal');

  const customer = await db.customer.findUnique({
    where: { userId: session.user.id },
  });

  if (!customer) redirect('/portal');

  // STRICT ISOLATION: Scoped to this customer's tickets only
  const serviceRequests = await db.inquiry.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: 'desc' },
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'IN_REVIEW':
      case 'CONTACTED':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'QUOTATION':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'WON':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'LOST':
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  const getDisplayStatus = (status) => {
    switch (status) {
      case 'NEW':
        return 'TICKET RECEIVED';
      case 'IN_REVIEW':
      case 'CONTACTED':
        return 'UNDER ENGINEERING REVIEW';
      case 'QUOTATION':
        return 'PROPOSAL DISPATCHED';
      case 'WON':
        return 'ORDER CONFIRMED';
      case 'LOST':
        return 'CLOSED';
      default:
        return status;
    }
  };

  return (
    <div className="pb-12 max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="text-purple-400" />
            <span>Service Requests & Support Tickets</span>
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Track support tickets, emergency breakdown calls, and maintenance inquiries submitted to MECELFAB.
          </p>
        </div>

        <Link
          href="/portal/service-requests/new"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-md font-semibold text-sm flex items-center gap-2 transition-colors w-max shadow-sm"
        >
          <PlusCircle size={16} />
          <span>Raise New Service Request</span>
        </Link>
      </div>

      <div className="bg-white/5 rounded-lg border border-white/10 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/30 text-secondary text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Ticket / Ref No</th>
                <th className="p-4 font-medium">Category / Scope</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Submitted On</th>
                <th className="p-4 font-medium">Notes & Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {serviceRequests.length > 0 ? (
                serviceRequests.map((sr) => (
                  <tr key={sr.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono font-bold text-purple-400 text-sm">
                      {sr.referenceNumber}
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-semibold text-white">{sr.service || 'Industrial Services'}</p>
                      <p className="text-xs text-gray-400 line-clamp-2 mt-1 whitespace-pre-wrap">{sr.message}</p>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-full border ${getStatusBadge(sr.status)}`}>
                        {getDisplayStatus(sr.status)}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-gray-500" />
                        <span>{new Date(sr.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-gray-300 max-w-xs">
                      {sr.status === 'NEW' ? (
                        <span className="text-blue-400">Assigned to duty operations engineer.</span>
                      ) : sr.status === 'IN_REVIEW' ? (
                        <span className="text-purple-400">Under technical assessment. Specialist will reach out.</span>
                      ) : sr.status === 'QUOTATION' ? (
                        <span className="text-amber-400">Quotation generated. Check Invoices / Proposals.</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-400">
                    <Shield size={36} className="mx-auto mb-3 opacity-30 text-purple-400" />
                    <p className="text-base font-semibold text-white">No service requests submitted yet</p>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                      Whenever you need emergency repairs, planned plant shutdowns, or preventative inspections, submit a request here.
                    </p>
                    <Link
                      href="/portal/service-requests/new"
                      className="mt-5 inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded transition-colors"
                    >
                      <PlusCircle size={14} />
                      <span>Submit Service Request</span>
                    </Link>
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
