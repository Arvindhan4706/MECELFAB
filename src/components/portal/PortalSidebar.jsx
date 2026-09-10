'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ClipboardList, Cpu, FileText,
  LogOut, Menu, X, ExternalLink, ChevronRight, Zap
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/portal',          label: 'Dashboard',   icon: LayoutDashboard, exact: true },
  { href: '/portal/requests', label: 'My Requests', icon: ClipboardList },
  { href: '/portal/quotations', label: 'Quotations', icon: FileText },
  { href: '/portal/assets',   label: 'My Assets',   icon: Cpu },
  { href: '/portal/billing',  label: 'Billing',     icon: FileText },
];

export default function PortalSidebar({ customer }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (item) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + '/');

  const initials = (customer?.companyName || customer?.contactPerson || 'C')
    .split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-3">
        <div className="w-7 h-7 bg-white flex items-center justify-center rounded flex-shrink-0">
          <Zap size={14} className="text-black" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-white tracking-tight font-heading leading-none">MECELFAB</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.12em] mt-0.5">Client Portal</p>
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-zinc-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 font-heading">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate leading-none">
              {customer?.companyName || customer?.contactPerson}
            </p>
            <p className="text-[11px] text-zinc-600 mt-0.5 truncate">{customer?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-150 group relative
                ${active
                  ? 'bg-white text-black font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                }`}
            >
              <Icon size={16} className="flex-shrink-0" />
              <span className="leading-none">{item.label}</span>
              {active && <ChevronRight size={13} className="ml-auto opacity-40" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/[0.06] space-y-0.5">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-zinc-500 hover:text-white hover:bg-white/[0.05] transition-all duration-150 group"
          onClick={() => setMobileOpen(false)}
        >
          <ExternalLink size={15} className="flex-shrink-0" />
          <span>Main Website</span>
        </Link>
        <Link
          href="/auth/signout"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-zinc-500 hover:text-red-400 hover:bg-red-500/[0.06] transition-all duration-150 cursor-pointer"
          onClick={() => setMobileOpen(false)}
        >
          <LogOut size={15} className="flex-shrink-0" />
          <span>Sign Out</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex w-[220px] flex-shrink-0 flex-col bg-zinc-900 border-r border-white/[0.06] h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 w-9 h-9 bg-zinc-900 border border-white/10 rounded-md flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer transition-colors"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={17} /> : <Menu size={17} />}
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-50 w-[220px] bg-zinc-900 border-r border-white/[0.06] flex flex-col h-full">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
