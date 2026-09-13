import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ChevronRight, ArrowRight } from 'lucide-react';
import { db } from '@/lib/db';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getEquipmentByIndustrySlug } from '@/lib/equipmentData';

const DEFAULT_INDUSTRIES = {
  'industrial-manufacturing': {
    title: 'Industrial Manufacturing',
    description: 'Precision fabrication, machine foundations, automation and industrial infrastructure for manufacturing plants.',
    capabilities: ['Equipment Erection', 'Machine Foundations', 'Structural Fabrication', 'Maintenance Contracts'],
    services: ['industrial-erection', 'industrial-fabrication', 'amc'],
    commonRequirements: [
      'New production line installation',
      'Machine relocation and reinstallation',
      'Structural modifications for expansion',
      'Preventive maintenance programs',
      'Emergency breakdown support',
      'Custom fabrication for production equipment'
    ],
  },
  'power-energy': {
    title: 'Power & Energy',
    description: 'Generator installations, spare parts supply and complete power systems for energy sector clients.',
    capabilities: ['Generator Services', 'Spare Parts', 'Temporary Power', 'Turbocharger Maintenance'],
    services: ['generator-rental', 'generator-spare-parts', 'turbocharger-services'],
    commonRequirements: [
      'Generator installation and commissioning',
      'Emergency power backup solutions',
      'Spare parts supply and inventory',
      'Turbocharger rebuild and maintenance',
      'Power system design and setup',
      'Load management and monitoring'
    ],
  },
  'industrial-maintenance': {
    title: 'Industrial Maintenance',
    description: 'Overhauling and annual maintenance contracts for hydraulic, pneumatic and turbocharger systems.',
    capabilities: ['Hydraulic Systems', 'Pneumatic Systems', 'Turbocharger Servicing', 'AMC'],
    services: ['hydraulic-pneumatic-overhauling', 'amc', 'turbocharger-services'],
    commonRequirements: [
      'Hydraulic cylinder repair and resealing',
      'Pneumatic system troubleshooting',
      'Scheduled maintenance contracts',
      'Emergency breakdown response',
      'System performance optimization',
      'Component life extension programs'
    ],
  },
  'commercial-power': {
    title: 'Commercial / Temporary Power',
    description: 'Flexible rental solutions for generators and air compressors across commercial and event applications.',
    capabilities: ['Generator Rental', 'Air Compressor Rental', 'Event Power'],
    services: ['generator-rental', 'air-compressor-rental'],
    commonRequirements: [
      'Temporary power for construction sites',
      'Event power supply',
      'Plant shutdown backup power',
      'Compressed air for industrial applications',
      'Remote location power solutions',
      'Seasonal capacity augmentation'
    ],
  },
};

export async function generateMetadata({ params }) {
  const { slug } = await params;

  let industry;
  try {
    industry = await db.industry.findUnique({ where: { slug, status: 'PUBLISHED' } });
  } catch {
    industry = null;
  }
  if (!industry) industry = DEFAULT_INDUSTRIES[slug];

  if (!industry) return { title: 'Industry Not Found' };

  return {
    title: `${industry.title} | MECELFAB Industrial Solutions`,
    description: industry.description,
    alternates: {
      canonical: `https://mecelfabpvtltd.com/industries/${slug}`,
    },
    openGraph: {
      title: `${industry.title} | MECELFAB`,
      description: industry.description,
      images: [{ url: '/images/hero-bg.png', width: 1200, height: 630, alt: industry.title }],
    },
  };
}

export default async function IndustryDetailPage({ params }) {
  const { slug } = await params;

  let industry = null;
  let isDb = false;
  try {
    industry = await db.industry.findUnique({ where: { slug, status: 'PUBLISHED' } });
    isDb = true;
  } catch {
    // DB unavailable — fall through to DEFAULT_INDUSTRIES
  }

  if (!industry) {
    industry = DEFAULT_INDUSTRIES[slug];
    isDb = false;
  }

  if (!industry) {
    notFound();
  }

  const capabilities = isDb
    ? (industry.capabilities ? JSON.parse(industry.capabilities) : [])
    : (industry.capabilities || []);

  const serviceSlugs = industry.services || [];
  let relatedServices = [];
  if (serviceSlugs.length > 0) {
    try {
      relatedServices = await db.service.findMany({
        where: { slug: { in: serviceSlugs }, status: 'ACTIVE' },
      });
    } catch {
      // DB unavailable — render without related services
    }
  }

  const commonRequirements = industry.commonRequirements || [];
  const relatedEquipment = getEquipmentByIndustrySlug(slug);

  return (
    <div className="min-h-screen bg-black">
      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 border-b border-white/5">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-6xl">
          <Breadcrumbs items={[{ label: 'Industries', href: '/industries' }, { label: industry.title }]} />
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-light text-white tracking-tight leading-tight mb-6">
              {industry.title}
            </h1>
            <p className="text-lg md:text-xl text-white/60 font-light leading-relaxed max-w-3xl">
              {industry.description}
            </p>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      {capabilities.length > 0 && (
        <section className="py-16 md:py-24 border-b border-white/5">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-6xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-5 h-[1px] bg-white/30" />
              <span className="text-white/40 text-[10px] font-heading tracking-[0.3em] uppercase">Capabilities</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-heading font-light text-white mb-10">
              MECELFAB Capabilities for {industry.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {capabilities.map((cap, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-white/[0.02] border border-white/5">
                  <CheckCircle className="text-white/30 shrink-0 mt-0.5" size={18} />
                  <span className="text-white/70 text-sm font-light">{cap}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Common Requirements */}
      {commonRequirements.length > 0 && (
        <section className="py-16 md:py-24 border-b border-white/5">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-6xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-5 h-[1px] bg-white/30" />
              <span className="text-white/40 text-[10px] font-heading tracking-[0.3em] uppercase">Common Requirements</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-heading font-light text-white mb-10">
              Typical Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {commonRequirements.map((req, i) => (
                <div key={i} className="p-4 bg-white/[0.02] border border-white/5">
                  <span className="text-white/70 text-sm font-light">{req}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related Services */}
      {relatedServices.length > 0 && (
        <section className="py-16 md:py-24 border-b border-white/5">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-6xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-5 h-[1px] bg-white/30" />
              <span className="text-white/40 text-[10px] font-heading tracking-[0.3em] uppercase">Relevant Services</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-heading font-light text-white mb-10">
              MECELFAB Services for {industry.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedServices.map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${service.slug}`}
                  className="flex items-center justify-between p-5 border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/15 transition-all group"
                >
                  <div>
                    <h3 className="text-white text-sm font-heading tracking-wide group-hover:text-white/90 transition-colors">{service.title}</h3>
                    <p className="text-secondary text-xs font-light mt-1 line-clamp-1">{service.description}</p>
                  </div>
                  <ChevronRight size={14} className="text-white/20 group-hover:text-white/50 transition-colors shrink-0 ml-4" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Relevant Industrial Machinery & Equipment */}
      {relatedEquipment.length > 0 && (
        <section className="py-16 md:py-24 border-b border-white/5">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-6xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-5 h-[1px] bg-white/30" />
                <span className="text-white/40 text-[10px] font-heading tracking-[0.3em] uppercase">Machinery & Systems</span>
              </div>
              <Link 
                href="/equipment"
                className="text-xs font-heading tracking-wider uppercase text-white/50 hover:text-white inline-flex items-center gap-1.5 transition-colors"
              >
                Catalog <ArrowRight size={13} />
              </Link>
            </div>
            <h2 className="text-2xl md:text-3xl font-heading font-light text-white mb-10">
              Equipment Deployed in {industry.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedEquipment.map((item) => (
                <Link
                  key={item.slug}
                  href={`/equipment/${item.slug}`}
                  className="p-5 bg-white/[0.02] border border-white/10 rounded-lg hover:border-white/25 hover:bg-white/[0.04] transition-all group flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-heading tracking-widest uppercase text-accent/80 block mb-1">
                      {item.capacityRange}
                    </span>
                    <h3 className="text-base font-heading font-light text-white group-hover:text-white transition-colors mb-2">
                      {item.title}
                    </h3>
                    <p className="text-white/50 text-xs font-light line-clamp-2 leading-relaxed mb-4">
                      {item.shortDescription}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-heading tracking-wider uppercase text-white/70 group-hover:text-white">
                    <span>View Specifications</span>
                    <ArrowRight size={13} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-6xl">
          <div className="p-8 md:p-12 bg-white/[0.02] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <p className="text-white/40 text-[10px] font-heading tracking-[0.3em] uppercase mb-3">Have a requirement in this sector?</p>
              <h3 className="text-2xl md:text-3xl font-heading font-light text-white mb-2">
                REQUEST RFQ
              </h3>
              <p className="text-white/50 text-sm font-light">
                Our engineering team will assess your requirement and provide a technical consultation.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-heading text-xs tracking-widest uppercase hover:bg-white/90 transition-colors shrink-0"
            >
              REQUEST RFQ
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
