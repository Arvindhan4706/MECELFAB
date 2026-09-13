import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft, 
  FileText, 
  MessageCircle, 
  ShieldCheck, 
  Settings2,
  Wrench,
  Factory
} from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getEquipmentBySlug, getAllEquipment } from '@/lib/equipmentData';
import { getCompanyProfile } from '@/lib/companyConfig';

export async function generateStaticParams() {
  const items = getAllEquipment();
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const item = getEquipmentBySlug(slug);

  if (!item) {
    return { title: 'Equipment Not Found | MECELFAB' };
  }

  return {
    title: `${item.title} (${item.capacityRange}) | MECELFAB Equipment`,
    description: item.shortDescription,
    alternates: {
      canonical: `https://mecelfabpvtltd.com/equipment/${slug}`,
    },
    openGraph: {
      title: `${item.title} | MECELFAB Industrial Solutions`,
      description: item.shortDescription,
      url: `https://mecelfabpvtltd.com/equipment/${slug}`,
      type: 'website',
    },
  };
}

const SERVICE_TITLES = {
  'generator-rental': 'Industrial Generator Rental',
  'generator-spare-parts': 'Industrial Generator Spare Parts',
  'amc': 'Annual Maintenance Contract (AMC)',
  'industrial-erection': 'Industrial Erection',
  'industrial-fabrication': 'Industrial Fabrication',
  'hydraulic-pneumatic-overhauling': 'Hydraulic & Pneumatic System Overhauling',
  'air-compressor-rental': 'Air Compressor Rental',
  'turbocharger-services': 'Turbocharger Services',
};

const INDUSTRY_TITLES = {
  'industrial-manufacturing': 'Industrial Manufacturing',
  'power-energy': 'Power & Energy',
  'industrial-maintenance': 'Industrial Maintenance',
  'commercial-power': 'Commercial / Temporary Power',
};

export default async function EquipmentDetailPage({ params }) {
  const { slug } = await params;
  const item = getEquipmentBySlug(slug);

  if (!item) {
    notFound();
  }

  const company = await getCompanyProfile();
  const whatsappNumber = (company?.phone || '').replace(/[^0-9]/g, '');
  const whatsappMessage = encodeURIComponent(
    `Hello MECELFAB, I would like to inquire about ${item.title} (${item.capacityRange}).`
  );

  return (
    <div className="pt-24 bg-primary min-h-screen">
      {/* 01 — Hero Header */}
      <section className="pt-8 pb-14 md:pt-12 md:pb-18 border-b border-white/5">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-5xl">
          <Breadcrumbs 
            items={[
              { label: 'Equipment', href: '/equipment' }, 
              { label: item.title }
            ]} 
          />

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-4">
            <div className="max-w-3xl">
              <span className="text-accent/90 text-xs font-heading tracking-widest uppercase mb-3 inline-block">
                {item.categoryLabel}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-light text-white tracking-tight leading-tight mb-4">
                {item.title}
              </h1>
              <p className="text-base sm:text-lg text-secondary font-light leading-relaxed">
                {item.shortDescription}
              </p>
            </div>

            {/* Quick CTAs */}
            <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
              <Link
                href={`/contact?equipment=${item.slug}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-black font-heading text-xs tracking-wider uppercase rounded hover:bg-white/90 transition-colors min-h-[44px]"
              >
                <FileText size={14} />
                REQUEST RFQ
              </Link>
              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] font-heading text-xs tracking-wider uppercase rounded hover:bg-[#25D366]/25 transition-colors min-h-[44px]"
                >
                  <MessageCircle size={15} />
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 02 — Main Content Body */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* Left Column (2 Cols): Overview, Applications, Technical Parameters */}
            <div className="lg:col-span-2 space-y-12">
              {/* Overview */}
              <div>
                <h2 className="text-xl font-heading text-white font-light tracking-tight mb-4 flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  Equipment Overview
                </h2>
                <p className="text-secondary text-sm sm:text-base font-light leading-relaxed">
                  {item.overview}
                </p>
              </div>

              {/* Technical Highlights Table / Cards */}
              {item.technicalHighlights?.length > 0 && (
                <div>
                  <h2 className="text-xl font-heading text-white font-light tracking-tight mb-4 flex items-center gap-2.5">
                    <Settings2 size={18} className="text-white/40" />
                    Key Technical Parameters
                  </h2>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl divide-y divide-white/5">
                    {item.technicalHighlights.map((tech) => (
                      <div key={tech.label} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm">
                        <span className="text-white/40 font-heading text-xs uppercase tracking-wider">
                          {tech.label}
                        </span>
                        <span className="text-white font-light sm:text-right">
                          {tech.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Primary Applications */}
              {item.applications?.length > 0 && (
                <div>
                  <h2 className="text-xl font-heading text-white font-light tracking-tight mb-4 flex items-center gap-2.5">
                    <CheckCircle2 size={18} className="text-white/40" />
                    Industrial Applications
                  </h2>
                  <ul className="grid grid-cols-1 gap-3">
                    {item.applications.map((app, i) => (
                      <li 
                        key={i} 
                        className="p-4 bg-white/[0.02] border border-white/5 rounded-lg flex items-start gap-3 text-sm text-secondary font-light"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40 mt-1.5 shrink-0" />
                        <span>{app}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Column (1 Col): Related Services, Related Industries, Quick Inquire */}
            <div className="space-y-8">
              {/* Related Services */}
              {item.relatedServiceSlugs?.length > 0 && (
                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-xl">
                  <h3 className="text-xs font-heading uppercase tracking-widest text-white/50 mb-4 flex items-center gap-2">
                    <Wrench size={14} />
                    Available MECELFAB Services
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    {item.relatedServiceSlugs.map((serviceSlug) => {
                      const title = SERVICE_TITLES[serviceSlug] || serviceSlug;
                      return (
                        <Link
                          key={serviceSlug}
                          href={`/services/${serviceSlug}`}
                          className="group p-3 bg-white/[0.02] border border-white/5 rounded-lg text-sm font-light text-white/80 hover:text-white hover:border-white/20 transition-all flex items-center justify-between"
                        >
                          <span className="line-clamp-1">{title}</span>
                          <ChevronRight size={14} className="text-white/30 group-hover:text-white transition-colors shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Related Industries */}
              {item.relatedIndustrySlugs?.length > 0 && (
                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-xl">
                  <h3 className="text-xs font-heading uppercase tracking-widest text-white/50 mb-4 flex items-center gap-2">
                    <Factory size={14} />
                    Target Industry Sectors
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    {item.relatedIndustrySlugs.map((indSlug) => {
                      const title = INDUSTRY_TITLES[indSlug] || indSlug;
                      return (
                        <Link
                          key={indSlug}
                          href={`/industries/${indSlug}`}
                          className="group p-3 bg-white/[0.02] border border-white/5 rounded-lg text-sm font-light text-white/80 hover:text-white hover:border-white/20 transition-all flex items-center justify-between"
                        >
                          <span>{title}</span>
                          <ChevronRight size={14} className="text-white/30 group-hover:text-white transition-colors shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quality & Safety Assurance */}
              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-xl text-xs font-light text-secondary space-y-3">
                <div className="flex items-center gap-2 text-white font-heading text-xs uppercase tracking-wider">
                  <ShieldCheck size={16} className="text-accent" />
                  MECELFAB Quality Promise
                </div>
                <p className="leading-relaxed">
                  Every equipment deployment, overhauling, or erection job is executed under documented ISO 9001:2015 QA procedures and calibrated measurement standards.
                </p>
              </div>

              {/* Direct RFQ Box */}
              <div className="p-6 bg-white/5 border border-white/15 rounded-xl text-center space-y-4">
                <p className="text-xs uppercase tracking-widest text-white/60 font-heading">
                  Specific Requirements?
                </p>
                <h4 className="text-base font-heading font-light text-white">
                  Request a Formal Quotation for {item.title}
                </h4>
                <Link
                  href={`/contact?equipment=${item.slug}`}
                  className="block w-full py-3 bg-white text-black font-heading text-xs tracking-wider uppercase rounded hover:bg-white/90 transition-colors"
                >
                  REQUEST RFQ NOW
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 03 — Bottom Navigation */}
      <section className="py-8 border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-5xl flex items-center justify-between">
          <Link
            href="/equipment"
            className="inline-flex items-center gap-2 text-xs font-heading tracking-wider uppercase text-white/50 hover:text-white transition-colors min-h-[44px]"
          >
            <ArrowLeft size={14} /> Back to Equipment Catalog
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-xs font-heading tracking-wider uppercase text-white/50 hover:text-white transition-colors min-h-[44px]"
          >
            Explore Core Services <ChevronRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}
