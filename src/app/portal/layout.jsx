import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { Shield } from 'lucide-react';
import Link from 'next/link';
import PortalSidebar from '@/components/portal/PortalSidebar';
import PortalHeader from '@/components/portal/PortalHeader';

export const metadata = {
  title: 'Customer Portal | MECELFAB',
  robots: 'noindex, nofollow',
};

export default async function PortalLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login?callbackUrl=/portal');
  }

  // Find or create customer record
  let customer = await db.customer.findUnique({
    where: { userId: session.user.id },
  });

  if (!customer && session.user.role === 'CUSTOMER') {
    customer = await db.customer.create({
      data: {
        userId: session.user.id,
        companyName: session.user.name || 'New Customer',
        contactPerson: session.user.name || 'New Customer',
        email: session.user.email,
      },
    });
  } else if (!customer) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col font-sans text-white items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
          <Shield size={32} className="text-red-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2 font-heading">Access Denied</h1>
        <p className="text-zinc-400 max-w-md text-sm leading-relaxed">
          Your account is not authorized for the customer portal. Please contact MECELFAB support.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-100 transition-colors"
        >
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white font-sans">
      <PortalSidebar customer={customer} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PortalHeader customerName={customer.companyName || customer.contactPerson} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-zinc-950">
          {children}
        </main>
      </div>
    </div>
  );
}
