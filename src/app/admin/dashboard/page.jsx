import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import {
  MessageSquare, Activity, Calendar,
  AlertTriangle, FileText, CheckCircle, Wrench,
  TrendingUp, ArrowRight, Clock
} from 'lucide-react';
import Link from 'next/link';
import ScrollReveal from '@/components/animations/ScrollReveal';

export const metadata = { title: 'Dashboard | MECELFAB Admin' };

// Status color + label map for pipeline
const PIPELINE_META = {
  NEW:                  { color: '#0EA5E9', bg: 'rgba(14,165,233,0.12)', label: 'New' },
  CONTACTED:            { color: '#818CF8', bg: 'rgba(129,140,248,0.12)', label: 'Contacted' },
  REQUIREMENT_VERIFIED: { color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', label: 'Req. Verified' },
  QUOTATION:            { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', label: 'Quotation' },
  NEGOTIATION:          { color: '#FB923C', bg: 'rgba(251,146,60,0.12)', label: 'Negotiation' },
  WON:                  { color: '#10B981', bg: 'rgba(16,185,129,0.12)', label: 'Won' },
  LOST:                 { color: '#EF4444', bg: 'rgba(239,68,68,0.12)', label: 'Lost' },
};

// KPI Card component
function KpiCard({ label, value, icon: Icon, color, href, alert = false }) {
  const card = (
    <div className={`
      relative overflow-hidden rounded-md p-5 border transition-all duration-200 group cursor-pointer
      bg-admin-surface border-admin-border hover:border-admin-muted
      ${alert ? 'border-admin-danger/30 hover:border-admin-danger/50' : ''}
    `}>
      <div className="flex justify-between items-start mb-4">
        <p className="text-xs text-admin-muted font-medium uppercase tracking-wider">{label}</p>
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
          style={{ background: `${color}10`, border: `1px solid ${color}20` }}
        >
          <Icon size={14} style={{ color }} />
        </div>
      </div>
      <p className={`text-3xl font-bold font-heading leading-none ${alert ? 'text-admin-danger' : 'text-admin-heading'}`}>
        {value}
      </p>
      {/* Hover arrow */}
      <ArrowRight size={13} className="absolute bottom-4 right-4 text-admin-muted opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5" />
    </div>
  );

  return href ? <Link href={href}>{card}</Link> : card;
}

// Section header component
function SectionHeader({ title, icon: Icon, accent }) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-admin-border">
      <Icon size={14} style={{ color: accent }} className="flex-shrink-0" />
      <h2 className="text-xs font-bold text-admin-heading uppercase tracking-wider">{title}</h2>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  // ── CRM KPIs ────────────────────────────────────────────
  const [newInquiries, openInquiries, quotations, _wonInquiries, portalRequests] = await Promise.all([
    db.inquiry.count({ where: { status: 'NEW' } }),
    db.inquiry.count({ where: { status: { in: ['NEW', 'CONTACTED', 'REQUIREMENT_VERIFIED', 'QUOTATION', 'NEGOTIATION'] } } }),
    db.inquiry.count({ where: { status: 'QUOTATION' } }),
    db.inquiry.count({ where: { status: 'WON' } }),
    // eslint-disable-next-line react-hooks/purity
    db.inquiry.count({ where: { status: 'NEW', createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
  ]);

  // Recent portal inquiries (last 5 new ones)
  const recentPortalInquiries = await db.inquiry.findMany({
    where: { status: 'NEW' },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  // ── Operations KPIs ─────────────────────────────────────
  const [activeWorkOrders, scheduledWorkOrders, activeAMCs] = await Promise.all([
    db.workOrder.count({ where: { status: 'IN_PROGRESS' } }),
    db.workOrder.count({ where: { status: 'SCHEDULED' } }),
    db.aMC.count({ where: { status: 'ACTIVE' } }),
  ]);

  const amcExpiringSoon = new Date();
  amcExpiringSoon.setDate(amcExpiringSoon.getDate() + 30);
  const expiringAMCs = await db.aMC.count({
    where: { status: 'ACTIVE', endDate: { lte: amcExpiringSoon } }
  });

  // ── Follow-ups ──────────────────────────────────────────
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999);

  const [followUpsToday, overdueFollowUps, upcomingFollowUpsList, overdueFollowUpsList] = await Promise.all([
    db.followUp.count({ where: { date: { gte: todayStart, lte: todayEnd }, status: 'PENDING' } }),
    db.followUp.count({ where: { date: { lt: todayStart }, status: 'PENDING' } }),
    db.followUp.findMany({
      where: { date: { gte: todayStart }, status: 'PENDING' },
      orderBy: { date: 'asc' }, take: 5, include: { inquiry: true }
    }),
    db.followUp.findMany({
      where: { date: { lt: todayStart }, status: 'PENDING' },
      orderBy: { date: 'desc' }, take: 5, include: { inquiry: true }
    }),
  ]);

  // ── Service Demand ───────────────────────────────────────
  const servicesData = await db.inquiry.groupBy({
    by: ['service'], _count: { service: true },
    orderBy: { _count: { service: 'desc' } }
  });
  const maxServiceCount = servicesData.length > 0
    ? Math.max(...servicesData.map(s => s._count.service))
    : 1;

  // ── Pipeline ─────────────────────────────────────────────
  const pipelineStatuses = ['NEW', 'CONTACTED', 'REQUIREMENT_VERIFIED', 'QUOTATION', 'NEGOTIATION', 'WON', 'LOST'];
  const pipelineData = await db.inquiry.groupBy({ by: ['status'], _count: { status: true } });
  const pipelineMap = pipelineData.reduce((acc, curr) => {
    acc[curr.status] = curr._count.status; return acc;
  }, {});
  const pipelineTotal = Object.values(pipelineMap).reduce((s, v) => s + v, 0) || 1;

  // Bar colors for service demand
  const barColors = [
    '#0EA5E9', '#818CF8', '#A78BFA', '#10B981', '#F59E0B', '#FB923C', '#EF4444', '#EC4899'
  ];

  const firstName = (session.user.name || 'Admin').split(' ')[0];

  return (
    <div className="space-y-8 pb-8">

      {/* ── Page Header ──────────────────────────────────── */}
      <ScrollReveal delay={0}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-admin-heading font-heading">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
              <span
                className="text-white"
              >
                {firstName}
              </span>
            </h1>
            <p className="text-admin-muted text-sm mt-1">Here's what's happening with your operations today.</p>
          </div>
          <div className="flex items-center gap-2 text-admin-muted text-xs bg-admin-surface border border-admin-border px-3 py-2 rounded-md">
            <Clock size={13} className="text-admin-accent" />
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </ScrollReveal>

      {/* ── CRM KPIs ─────────────────────────────────────── */}
      <ScrollReveal delay={0.1}>
        <section>
          <SectionHeader title="CRM Metrics" icon={MessageSquare} accent="#0EA5E9" />
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            <KpiCard label="New Inquiries"   value={newInquiries}    icon={MessageSquare} color="#0EA5E9" href="/admin/inquiries" />
            <KpiCard label="Open Leads"      value={openInquiries}   icon={Activity}      color="#818CF8" href="/admin/inquiries" />
            <KpiCard label="Follow-ups Today" value={followUpsToday} icon={Calendar}      color="#F59E0B" />
            <KpiCard label="Overdue"         value={overdueFollowUps} icon={AlertTriangle} color="#EF4444" alert />
            <KpiCard label="Quotations"      value={quotations}      icon={FileText}      color="#A78BFA" href="/admin/quotations" />
            <KpiCard label="Portal (7d)"     value={portalRequests}  icon={CheckCircle}   color="#10B981" href="/admin/inquiries" />
          </div>
        </section>
      </ScrollReveal>

      {/* ── Operations KPIs ──────────────────────────────── */}
      <ScrollReveal delay={0.2}>
        <section>
          <SectionHeader title="Operations Metrics" icon={Wrench} accent="#10B981" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard label="Active Work Orders"    value={activeWorkOrders}    icon={Wrench}        color="#0EA5E9" href="/admin/work-orders" />
            <KpiCard label="Scheduled Work Orders" value={scheduledWorkOrders} icon={Calendar}      color="#818CF8" href="/admin/work-orders" />
            <KpiCard label="Active AMCs"           value={activeAMCs}          icon={CheckCircle}   color="#10B981" href="/admin/amcs" />
            <KpiCard label="AMCs Expiring (30d)"   value={expiringAMCs}        icon={AlertTriangle} color="#F59E0B" alert={expiringAMCs > 0} href="/admin/amcs" />
          </div>
        </section>
      </ScrollReveal>

      {/* ── Main Content: Charts + Follow-ups ────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left: 2 columns of charts */}
        <div className="xl:col-span-2 space-y-6">

          {/* Service Demand Chart */}
          <ScrollReveal delay={0.3}>
            <div className="bg-admin-surface border border-admin-border rounded-md p-6">
              <SectionHeader title="Service Demand" icon={TrendingUp} accent="#0EA5E9" />
              {servicesData.length > 0 ? (
                <div className="space-y-3">
                  {servicesData.slice(0, 8).map((item, i) => {
                    const pct = Math.round((item._count.service / maxServiceCount) * 100);
                    const color = barColors[i % barColors.length];
                    return (
                      <div key={item.service || 'Unknown'} className="flex items-center gap-3 group">
                        <div className="w-1/3 text-xs text-admin-text truncate font-medium" title={item.service || 'General'}>
                          {item.service || 'General'}
                        </div>
                        <div className="flex-1 flex items-center gap-3">
                          <div className="flex-1 h-2 bg-admin-elevated rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}99, ${color})` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-admin-muted w-6 text-right tabular-nums">
                            {item._count.service}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <TrendingUp size={32} className="text-admin-border mx-auto mb-3" />
                  <p className="text-sm text-admin-muted">No inquiry data yet.</p>
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Pipeline Funnel */}
          <ScrollReveal delay={0.4}>
            <div className="bg-admin-surface border border-admin-border rounded-md p-6">
              <SectionHeader title="Pipeline Summary" icon={Activity} accent="#818CF8" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {pipelineStatuses.map(status => {
                  const meta = PIPELINE_META[status];
                  const count = pipelineMap[status] || 0;
                  const pct = Math.round((count / pipelineTotal) * 100);
                  return (
                    <Link
                      key={status}
                      href="/admin/inquiries"
                      className="relative p-3.5 rounded-md border transition-all duration-200 hover:border-admin-muted cursor-pointer group bg-admin-bg"
                      style={{ borderColor: `${meta.color}25` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold" style={{ color: meta.color }}>
                          {meta.label}
                        </span>
                        <span className="text-[10px] text-admin-muted">{pct}%</span>
                      </div>
                      <p className="text-2xl font-bold text-admin-heading font-heading">{count}</p>
                      {/* Bottom accent bar */}
                      <div
                        className="absolute bottom-0 left-0 h-0.5 transition-all duration-300"
                        style={{ width: `${pct}%`, background: meta.color, minWidth: count > 0 ? '8px' : '0' }}
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Right: Follow-up columns */}
        <div className="space-y-6">

          {/* Overdue Follow-ups */}
          <ScrollReveal delay={0.4}>
            <div className="bg-admin-surface border border-admin-danger/30 rounded-md overflow-hidden">
              <div className="px-5 py-4 border-b border-admin-danger/20 flex items-center justify-between"
                style={{ background: 'rgba(239,68,68,0.05)' }}>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={15} className="text-admin-danger" />
                  <h3 className="text-sm font-bold text-admin-danger">Overdue</h3>
                </div>
                {overdueFollowUps > 0 && (
                  <span className="text-[11px] font-bold text-white bg-admin-danger px-2 py-0.5 rounded-full">
                    {overdueFollowUps}
                  </span>
                )}
              </div>
              <div className="divide-y divide-admin-border/50 p-3">
                {overdueFollowUpsList.length > 0 ? overdueFollowUpsList.map(fu => (
                  <Link key={fu.id} href={`/admin/inquiries/${fu.inquiryId}`}
                    className="py-3 px-2 flex flex-col gap-1 rounded-md hover:bg-admin-elevated transition-colors group cursor-pointer">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-admin-heading group-hover:text-admin-accent transition-colors leading-snug">
                        {fu.inquiry.name}
                      </p>
                      <span className="text-[10px] font-bold text-admin-danger bg-admin-danger/10 border border-admin-danger/20 px-2 py-0.5 rounded-full flex-shrink-0">
                        {new Date(fu.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    {fu.note && <p className="text-[11px] text-admin-muted truncate">{fu.note}</p>}
                  </Link>
                )) : (
                  <div className="py-8 text-center">
                    <CheckCircle size={24} className="text-admin-success mx-auto mb-2 opacity-60" />
                    <p className="text-xs text-admin-muted">No overdue follow-ups</p>
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>

          {/* Upcoming Follow-ups */}
          <ScrollReveal delay={0.5}>
            <div className="bg-admin-surface border border-admin-border rounded-md overflow-hidden">
              <div className="px-5 py-4 border-b border-admin-border flex items-center gap-2">
                <Calendar size={15} className="text-admin-accent" />
                <h3 className="text-sm font-bold text-admin-heading">Upcoming</h3>
              </div>
              <div className="divide-y divide-admin-border/50 p-3">
                {upcomingFollowUpsList.length > 0 ? upcomingFollowUpsList.map(fu => (
                  <Link key={fu.id} href={`/admin/inquiries/${fu.inquiryId}`}
                    className="py-3 px-2 flex flex-col gap-1 rounded-md hover:bg-admin-elevated transition-colors group cursor-pointer">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-admin-heading group-hover:text-admin-accent transition-colors leading-snug">
                        {fu.inquiry.name}
                      </p>
                      <span className="text-[10px] font-bold text-admin-accent bg-admin-accent/10 border border-admin-accent/20 px-2 py-0.5 rounded-full flex-shrink-0">
                        {new Date(fu.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    {fu.note && <p className="text-[11px] text-admin-muted truncate">{fu.note}</p>}
                  </Link>
                )) : (
                  <div className="py-8 text-center">
                    <Calendar size={24} className="text-admin-border mx-auto mb-2" />
                    <p className="text-xs text-admin-muted">No upcoming follow-ups</p>
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* ── Recent Portal Requests ─────────────────────────── */}
      <ScrollReveal delay={0.6}>
        <div className="bg-admin-surface border border-admin-border rounded-md overflow-hidden">
          <div className="px-5 py-4 border-b border-admin-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare size={14} className="text-admin-accent" />
              <h3 className="text-sm font-bold text-admin-heading">Recent New Requests</h3>
            </div>
            {portalRequests > 0 && (
              <span className="text-[11px] font-bold text-white bg-admin-accent/10 border border-admin-border px-2 py-0.5 rounded-full">
                {portalRequests} in last 7d
              </span>
            )}
          </div>
          <div className="divide-y divide-admin-border/50 p-3">
            {recentPortalInquiries.length > 0 ? recentPortalInquiries.map(inq => (
              <Link key={inq.id} href={`/admin/inquiries/${inq.id}`}
                className="py-3 px-2 flex items-start justify-between gap-3 rounded-md hover:bg-admin-elevated transition-colors group cursor-pointer">
                <div>
                  <p className="text-xs font-semibold text-admin-heading group-hover:text-admin-accent transition-colors">
                    {inq.name} <span className="font-normal text-admin-muted">({inq.company || 'Individual'})</span>
                  </p>
                  <p className="text-[11px] text-admin-muted mt-0.5">{inq.service || 'General Inquiry'} · {inq.referenceNumber}</p>
                </div>
                <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full flex-shrink-0">
                  {new Date(inq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </Link>
            )) : (
              <div className="py-8 text-center">
                <CheckCircle size={24} className="text-admin-success mx-auto mb-2 opacity-60" />
                <p className="text-xs text-admin-muted">No new requests in the inbox</p>
              </div>
            )}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
