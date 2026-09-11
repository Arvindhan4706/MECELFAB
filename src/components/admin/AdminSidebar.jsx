'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, MessageSquare, FileText, Wrench,
  Briefcase, Activity, Banknote, Settings,
  Users, Shield,
  Home, LogOut, ChevronLeft, ChevronRight,
  Zap, ClipboardList, Building2
} from 'lucide-react';

const navGroups = [
  {
    label: 'Core',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'CRM & Sales',
    items: [
      { href: '/admin/inquiries', label: 'Inquiries', icon: MessageSquare, badge: null },
      { href: '/admin/quotations', label: 'Quotations', icon: FileText },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/admin/work-orders', label: 'Work Orders', icon: Wrench },
      { href: '/admin/equipment', label: 'Equipment', icon: Briefcase },
      { href: '/admin/amcs', label: 'AMCs', icon: Activity },
      { href: '/admin/billing', label: 'Billing & Invoices', icon: Banknote },
    ],
  },
  {
    label: 'Projects',
    items: [
      { href: '/admin/projects', label: 'Projects', icon: ClipboardList },
      { href: '/admin/clients', label: 'Clients', icon: Building2 },
    ],
  },
  {
    label: 'Content & Media',
    items: [
      { href: '/admin/services', label: 'Services Config', icon: Zap },
      { href: '/admin/testimonials', label: 'Testimonials', icon: MessageSquare },
    ],
    adminOnly: true,
  },
  {
    label: 'Admin',
    items: [
      { href: '/admin/users', label: 'Users', icon: Users },
      { href: '/admin/settings', label: 'Settings', icon: Settings },
    ],
    adminOnly: true,
  },
];

export default function AdminSidebar({ user }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const role = user?.role || 'VIEWER';
  const isAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN';

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  const isActive = (href) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      <aside
        className={`hidden md:flex flex-col flex-shrink-0 bg-admin-surface border-r border-admin-border transition-all duration-300 ease-out overflow-hidden z-20
          ${collapsed ? 'w-[72px]' : 'w-[260px]'}
        `}
        style={{ height: '100vh' }}
      >
        <div className="flex flex-col h-full">
          {/* Brand Header */}
          <div className={`flex items-center gap-3 p-4 border-b border-admin-border transition-all duration-300 ${collapsed ? 'justify-center px-0' : ''}`}>
            <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center flex-shrink-0">
              <Shield size={16} className="text-black" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <h2 className="text-sm font-bold text-admin-heading tracking-tight font-heading leading-none">MECELFAB</h2>
                <p className="text-[10px] text-admin-accent uppercase tracking-[0.15em] mt-0.5 font-medium">Admin Portal</p>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-4 space-y-5 px-2 scrollbar-thin">
            {navGroups.map((group) => {
              if (group.adminOnly && !isAdmin) return null;
              return (
                <div key={group.label}>
                  {!collapsed && (
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-admin-muted px-3 mb-2 select-none">
                      {group.label}
                    </p>
                  )}
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          title={collapsed ? item.label : undefined}
                          className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group cursor-pointer
                            ${collapsed ? 'justify-center' : ''}
                            ${active
                              ? 'bg-admin-accent/10 text-admin-accent'
                              : 'text-admin-text hover:bg-admin-elevated hover:text-admin-heading'
                            }`}
                        >
                          {/* Active left bar */}
                          {active && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-admin-accent rounded-r-sm" />
                          )}
                          <Icon
                            size={17}
                            className={`flex-shrink-0 transition-colors ${active ? 'text-admin-accent' : 'text-admin-muted group-hover:text-admin-text'}`}
                          />
                          {!collapsed && (
                            <span className="text-sm font-medium leading-none">{item.label}</span>
                          )}
                          {/* Tooltip when collapsed */}
                          {collapsed && (
                            <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-admin-elevated text-admin-heading text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-admin-border z-50 shadow-xl">
                              {item.label}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Footer */}
          <div className={`border-t border-admin-border p-3 space-y-1`}>
            <Link
              href="/"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-admin-text hover:bg-admin-elevated hover:text-admin-heading transition-all duration-200 group cursor-pointer ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? 'Public Website' : undefined}
            >
              <Home size={17} className="flex-shrink-0 text-admin-muted group-hover:text-admin-text" />
              {!collapsed && <span className="text-sm font-medium">Public Website</span>}
              {collapsed && (
                <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-admin-elevated text-admin-heading text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-admin-border z-50 shadow-xl">
                  Public Website
                </span>
              )}
            </Link>
            <Link
              href="/auth/signout"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 group cursor-pointer ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? 'Sign Out' : undefined}
            >
              <LogOut size={17} className="flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
            </Link>

            {/* Collapse Toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-admin-muted hover:bg-admin-elevated hover:text-admin-text transition-all duration-200 mt-2 cursor-pointer ${collapsed ? 'justify-center' : 'justify-between'}`}
            >
              {!collapsed && <span className="text-xs">Collapse sidebar</span>}
              {collapsed
                ? <ChevronRight size={15} />
                : <ChevronLeft size={15} />
              }
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-admin-surface border border-admin-border rounded-xl flex items-center justify-center text-admin-text shadow-xl cursor-pointer"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-50 w-[260px] bg-admin-surface border-r border-admin-border flex flex-col h-full shadow-2xl">
            <div className="flex flex-col h-full">
              {/* Brand Header */}
              <div className={`flex items-center gap-3 p-4 border-b border-admin-border transition-all duration-300 ${collapsed ? 'justify-center px-0' : ''}`}>
                <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center flex-shrink-0">
                  <Shield size={16} className="text-black" />
                </div>
                {!collapsed && (
                  <div className="overflow-hidden">
                    <h2 className="text-sm font-bold text-admin-heading tracking-tight font-heading leading-none">MECELFAB</h2>
                    <p className="text-[10px] text-admin-accent uppercase tracking-[0.15em] mt-0.5 font-medium">Admin Portal</p>
                  </div>
                )}
              </div>

              {/* Nav */}
              <nav className="flex-1 overflow-y-auto py-4 space-y-5 px-2 scrollbar-thin">
                {navGroups.map((group) => {
                  if (group.adminOnly && !isAdmin) return null;
                  return (
                    <div key={group.label}>
                      {!collapsed && (
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-admin-muted px-3 mb-2 select-none">
                          {group.label}
                        </p>
                      )}
                      <div className="space-y-0.5">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          const active = isActive(item.href);
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              title={collapsed ? item.label : undefined}
                              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group cursor-pointer
                                ${collapsed ? 'justify-center' : ''}
                                ${active
                                  ? 'bg-admin-accent/10 text-admin-accent'
                                  : 'text-admin-text hover:bg-admin-elevated hover:text-admin-heading'
                                }`}
                            >
                              {/* Active left bar */}
                              {active && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-admin-accent rounded-r-sm" />
                              )}
                              <Icon
                                size={17}
                                className={`flex-shrink-0 transition-colors ${active ? 'text-admin-accent' : 'text-admin-muted group-hover:text-admin-text'}`}
                              />
                              {!collapsed && (
                                <span className="text-sm font-medium leading-none">{item.label}</span>
                              )}
                              {/* Tooltip when collapsed */}
                              {collapsed && (
                                <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-admin-elevated text-admin-heading text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-admin-border z-50 shadow-xl">
                                  {item.label}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className={`border-t border-admin-border p-3 space-y-1`}>
                <Link
                  href="/"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-admin-text hover:bg-admin-elevated hover:text-admin-heading transition-all duration-200 group cursor-pointer ${collapsed ? 'justify-center' : ''}`}
                  title={collapsed ? 'Public Website' : undefined}
                >
                  <Home size={17} className="flex-shrink-0 text-admin-muted group-hover:text-admin-text" />
                  {!collapsed && <span className="text-sm font-medium">Public Website</span>}
                  {collapsed && (
                    <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-admin-elevated text-admin-heading text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-admin-border z-50 shadow-xl">
                      Public Website
                    </span>
                  )}
                </Link>
                <Link
                  href="/auth/signout"
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 group cursor-pointer ${collapsed ? 'justify-center' : ''}`}
                  title={collapsed ? 'Sign Out' : undefined}
                >
                  <LogOut size={17} className="flex-shrink-0" />
                  {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
                </Link>

                {/* Collapse Toggle */}
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-admin-muted hover:bg-admin-elevated hover:text-admin-text transition-all duration-200 mt-2 cursor-pointer ${collapsed ? 'justify-center' : 'justify-between'}`}
                >
                  {!collapsed && <span className="text-xs">Collapse sidebar</span>}
                  {collapsed
                    ? <ChevronRight size={15} />
                    : <ChevronLeft size={15} />
                  }
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
