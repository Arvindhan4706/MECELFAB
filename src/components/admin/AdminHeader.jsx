'use client';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  Bell, Check, ChevronDown,
  LogOut, ExternalLink, Clock, Settings
} from 'lucide-react';
import Link from 'next/link';

// Map pathnames to readable breadcrumbs
const breadcrumbMap = {
  '/admin/dashboard': 'Dashboard',
  '/admin/inquiries': 'Inquiries',
  '/admin/quotations': 'Quotations',
  '/admin/work-orders': 'Work Orders',
  '/admin/equipment': 'Equipment Library',
  '/admin/amcs': 'AMCs',
  '/admin/inventory': 'Inventory',
  '/admin/billing': 'Billing & Invoices',
  '/admin/services': 'Services Config',
  '/admin/projects': 'Projects',
  '/admin/clients': 'Clients',
  '/admin/media': 'Media Library',
  '/admin/documents': 'Document Vault',
  '/admin/content': 'Global Content',
  '/admin/testimonials': 'Testimonials',
  '/admin/industries': 'Industries',
  '/admin/certifications': 'Certifications',
  '/admin/users': 'Users',
  '/admin/activity': 'Activity Log',
  '/admin/settings': 'Settings',
};

function useLiveTime() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function AdminHeader({ session, initialNotifications }) {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications ?? []);
  const notifRef = useRef(null);
  const userRef = useRef(null);
  const pathname = usePathname();
  const time = useLiveTime();

  const unreadCount = notifications.filter(n => !n.read).length;

  // Get page title from path
  const getPageTitle = () => {
    // Check exact match first
    if (breadcrumbMap[pathname]) return breadcrumbMap[pathname];
    // Then prefix match (for sub-pages like /admin/inquiries/123)
    const match = Object.entries(breadcrumbMap).find(([key]) =>
      pathname.startsWith(key + '/')
    );
    return match ? match[1] : 'Admin';
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAsRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try { await fetch(`/api/admin/notifications/${id}/read`, { method: 'POST' }); } catch {}
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try { await fetch('/api/admin/notifications/read-all', { method: 'POST' }); } catch {}
  };

  const initials = session?.user?.name
    ? session.user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'A';

  const roleLabel = session?.user?.role?.replace(/_/g, ' ') || 'Viewer';

  return (
    <header className="flex-shrink-0 h-14 bg-admin-bg border-b border-admin-border flex items-center px-5 gap-4 z-30 sticky top-0">
      {/* Page Title / Breadcrumb */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-admin-muted text-xs hidden sm:block">Admin</span>
          <span className="text-admin-muted text-xs hidden sm:block">/</span>
          <h1 className="text-sm font-semibold text-admin-heading truncate">{getPageTitle()}</h1>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">

        {/* Live Time */}
        <div className="hidden lg:flex items-center gap-1.5 text-admin-muted text-xs bg-admin-elevated px-3 py-1.5 rounded-lg border border-admin-border">
          <Clock size={12} className="text-admin-accent" />
          <span className="font-mono tabular-nums">{time}</span>
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifs(!showNotifs); setShowUser(false); }}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl text-admin-muted hover:text-admin-heading hover:bg-admin-elevated transition-all duration-200 cursor-pointer border border-transparent hover:border-admin-border"
            aria-label="Notifications"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-admin-danger rounded-full border-2 border-admin-surface animate-pulse" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 bg-admin-elevated border border-admin-border rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-admin-border">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-admin-accent" />
                  <span className="text-sm font-semibold text-admin-heading">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold text-white bg-admin-danger px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-admin-accent hover:text-sky-300 transition-colors font-medium cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-admin-border/50">
                {notifications.length > 0 ? notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`px-4 py-3 transition-colors hover:bg-admin-surface/50 ${!notif.read ? 'bg-admin-accent/5' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      {!notif.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-admin-accent mt-1.5 flex-shrink-0" />
                      )}
                      <Link
                        href={notif.entityType === 'INQUIRY' ? `/admin/inquiries/${notif.entityId}` : '#'}
                        className="flex-1 min-w-0"
                        onClick={() => { if (!notif.read) markAsRead(notif.id); setShowNotifs(false); }}
                      >
                        <p className={`text-xs font-semibold truncate ${!notif.read ? 'text-admin-heading' : 'text-admin-text'}`}>
                          {notif.title}
                        </p>
                        <p className="text-[11px] text-admin-muted mt-0.5 line-clamp-2">{notif.message}</p>
                        <p className="text-[10px] text-admin-muted/60 mt-1">
                          {new Date(notif.createdAt).toLocaleString()}
                        </p>
                      </Link>
                      {!notif.read && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="text-admin-muted hover:text-admin-success p-1 transition-colors cursor-pointer flex-shrink-0"
                          title="Mark as read"
                        >
                          <Check size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="py-10 text-center">
                    <Bell size={24} className="text-admin-border mx-auto mb-2" />
                    <p className="text-xs text-admin-muted">No notifications</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-admin-border mx-1" />

        {/* User Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => { setShowUser(!showUser); setShowNotifs(false); }}
            className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all duration-200 cursor-pointer border ${showUser ? 'bg-admin-surface border-admin-border' : 'bg-transparent border-transparent hover:bg-admin-surface hover:border-admin-border'} group`}
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-white/10 flex-shrink-0 flex items-center justify-center overflow-hidden">
              <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-white font-bold text-xs">
                {initials}
              </div>
            </div>
            <div className="hidden sm:block text-left leading-none">
              <p className="text-xs font-semibold text-admin-heading group-hover:text-white transition-colors">{session?.user?.name || 'Admin'}</p>
              <p className="text-[10px] text-admin-muted mt-0.5">{roleLabel}</p>
            </div>
            <ChevronDown size={14} className={`text-admin-muted transition-transform duration-300 hidden sm:block ${showUser ? 'rotate-180 text-admin-heading' : 'group-hover:text-admin-text'}`} />
          </button>

          <div
                className={`absolute right-0 mt-3 w-64 bg-admin-elevated border border-admin-border rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-50 origin-top-right transition-all duration-150 ease-out ${
                  showUser ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 translate-y-1 pointer-events-none'
                }`}
              >
                {/* User info header */}
                <div className="px-5 py-4 border-b border-admin-border/50 bg-admin-surface/30">
                  <p className="text-sm font-semibold text-admin-heading">{session?.user?.name}</p>
                  <p className="text-[11px] text-admin-muted truncate mt-0.5">{session?.user?.email}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="inline-block text-[9px] font-bold uppercase tracking-widest text-admin-accent bg-admin-accent/10 border border-admin-accent/20 px-2 py-0.5 rounded-md">
                      {roleLabel}
                    </span>
                    <span className="inline-block text-[9px] font-bold uppercase tracking-widest text-admin-success bg-admin-success/10 border border-admin-success/20 px-2 py-0.5 rounded-md">
                      Active
                    </span>
                  </div>
                </div>

                <div className="p-2 space-y-0.5">
                  <Link
                    href="/admin/settings"
                    onClick={() => setShowUser(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-admin-text hover:bg-admin-surface hover:text-admin-heading transition-all cursor-pointer group"
                  >
                    <Settings size={15} className="text-admin-muted group-hover:text-admin-heading transition-colors" />
                    Account Settings
                  </Link>
                  <Link
                    href="/"
                    target="_blank"
                    onClick={() => setShowUser(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-admin-text hover:bg-admin-surface hover:text-admin-heading transition-all cursor-pointer group"
                  >
                    <ExternalLink size={15} className="text-admin-muted group-hover:text-admin-heading transition-colors" />
                    View Website
                  </Link>
                </div>
                
                <div className="p-2 border-t border-admin-border/50 bg-admin-surface/10">
                  <Link
                    href="/auth/signout"
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <LogOut size={15} className="group-hover:scale-110 transition-transform" />
                      Secure Sign Out
                    </div>
                  </Link>
                </div>
              </div>
          </div>
      </div>
    </header>
  );
}
