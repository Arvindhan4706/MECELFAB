import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { Home, Briefcase, FileText, Wrench, Shield } from 'lucide-react';
import { db } from '@/lib/db';

export const metadata = {
  title: 'Customer Portal | MECELFAB',
  robots: 'noindex, nofollow'
};

export default async function PortalLayout({ children }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/portal');
  }

  // Find the customer linked to this user via Customer.userId
  const customer = await db.customer.findUnique({
    where: { userId: session.user.id }
  });

  if (!customer) {
    // This user is not linked to a customer account. If they are admin, they shouldn't be here, or maybe they just don't have a linked customer record.
    return (
      <div className="min-h-screen bg-primary flex flex-col font-sans text-white items-center justify-center p-6 text-center">
        <Shield size={48} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-secondary max-w-md">
          Your account is not linked to any active customer profile. If you believe this is an error, please contact support.
        </p>
        <Link href="/" className="mt-6 bg-white text-black px-6 py-2 rounded font-medium hover:bg-gray-200 transition-colors">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-white/5 flex flex-col hidden md:flex z-20">
        <div className="p-6 border-b border-white/10 text-center">
          <h2 className="text-xl font-heading font-bold tracking-tight uppercase text-white">MECELFAB</h2>
          <p className="text-[10px] text-blue-400 mt-1 uppercase tracking-widest font-heading">Client Portal</p>
        </div>
        
        <div className="p-4 border-b border-white/10">
          <p className="text-xs text-secondary uppercase tracking-wider mb-1">Welcome,</p>
          <p className="text-sm font-semibold truncate">{customer.companyName || customer.contactPerson}</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <Link href="/portal" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 transition-colors text-sm text-gray-300 hover:text-white">
            <Home size={18} className="text-blue-400" />
            Dashboard
          </Link>
          <Link href="/portal/work-orders" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 transition-colors text-sm text-gray-300 hover:text-white">
            <Wrench size={18} className="text-blue-400" />
            My Work Orders
          </Link>
          <Link href="/portal/equipment" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 transition-colors text-sm text-gray-300 hover:text-white">
            <Briefcase size={18} className="text-amber-400" />
            My Equipment & AMCs
          </Link>
          <Link href="/portal/service-requests" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 transition-colors text-sm text-gray-300 hover:text-white">
            <Shield size={18} className="text-purple-400" />
            Service Requests
          </Link>
          <Link href="/portal/invoices" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 transition-colors text-sm text-gray-300 hover:text-white">
            <FileText size={18} className="text-green-400" />
            Invoices & Billing
          </Link>
        </nav>
        
        <div className="p-4 border-t border-white/10 bg-black/40">
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-red-500/10 text-red-400 transition-colors text-sm">
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950 relative">
        <main className="flex-1 overflow-y-auto p-6 md:p-10 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
