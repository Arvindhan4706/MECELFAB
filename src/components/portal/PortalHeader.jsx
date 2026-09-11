'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';

const PAGE_TITLES = {
  '/portal':              'Dashboard',
  '/portal/requests':     'My Requests',
  '/portal/requests/new': 'New Request',
  '/portal/assets':       'My Assets',
  '/portal/billing':      'Billing',
};

export default function PortalHeader({ customerName: _customerName }) {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] || 'Portal';

  return (
    <header className="h-[52px] border-b border-white/[0.06] bg-zinc-950 flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-sm font-semibold text-white font-heading">{title}</h1>
      <Link
        href="/portal/requests/new"
        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-white text-black hover:bg-zinc-100 transition-colors rounded-md"
      >
        <Plus size={13} />
        New Request
      </Link>
    </header>
  );
}
