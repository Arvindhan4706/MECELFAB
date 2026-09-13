import Link from 'next/link';
import { Wrench, Hammer, Droplets, Zap, Clock, Wind, ChevronRight } from 'lucide-react';
import { db } from '@/lib/db';

export const revalidate = 60;

export const metadata = {
  title: 'Capabilities | MECELFAB Industrial Solutions',
  description: 'Technical capability matrix across fabrication, erection, maintenance, power, hydraulic, and rental services at MECELFAB.',
  openGraph: {
    title: 'Capabilities | MECELFAB Industrial Solutions',
    description: 'Technical capability matrix across fabrication, erection, maintenance, power, hydraulic, and rental services at MECELFAB.',
    url: 'https://mecelfabpvtltd.com/capabilities',
    images: [{ url: '/images/hero-bg.png', width: 1200, height: 630, alt: 'MECELFAB Capabilities' }],
    type: 'website',
  },
  alternates: {
    canonical: 'https://mecelfabpvtltd.com/capabilities',
  },
};

const CAPABILITY_MATRIX = [
  {
    icon: Hammer,
    service: 'Erection',
    slug: 'industrial-erection',
    sections: [
      { heading: 'Equipment', items: ['Mobile cranes 25T-200T', 'Hydraulic jacking systems', 'Laser alignment instruments', 'Grouting equipment'] },
      { heading: 'Lifting', items: ['Critical lift planning', 'Rigging engineering', 'Multi-crane lifts', 'Heavy transport coordination'] },
      { heading: 'Alignment', items: ['Laser shaft alignment', 'Dial indicator methods', 'Precision leveling', 'Thermal growth compensation'] },
      { heading: 'Commissioning', items: ['Pre-commissioning checks', 'Dry/wet testing', 'Performance validation', 'Handover documentation'] },
    ]
  },
  {
    icon: Wrench,
    service: 'Fabrication',
    slug: 'industrial-fabrication',
    sections: [
      { heading: 'Materials', items: ['Mild steel', 'Stainless steel (304/316)', 'Aluminum', 'Alloy steels'] },
      { heading: 'Processes', items: ['CNC plasma/gas cutting', 'Plate rolling (up to 50mm)', 'MIG/TIG/SAW welding', 'Shot blasting & painting'] },
      { heading: 'Equipment', items: ['CNC cutting tables', 'Press brakes', 'Overhead cranes 10T-30T', 'Welding stations'] },
      { heading: 'Inspection', items: ['Dimensional inspection', 'Weld testing (NDT)', 'Material traceability', 'Test certificates'] },
    ]
  },
  {
    icon: Clock,
    service: 'Maintenance',
    slug: 'amc',
    sections: [
      { heading: 'Preventive', items: ['Scheduled maintenance visits', 'Oil & filter replacement', 'Belt & hose inspection', 'Electrical checks'] },
      { heading: 'Breakdown', items: ['Emergency response', 'Fault diagnosis', 'Component replacement', 'System restoration'] },
      { heading: 'AMC', items: ['Customizable contracts', '4-12 visits/year', 'Priority support', 'Detailed reporting'] },
      { heading: 'Overhauling', items: ['Engine rebuilds', 'Alternator servicing', 'Control panel upgrades', 'Performance testing'] },
    ]
  },
  {
    icon: Zap,
    service: 'Power',
    slug: 'generator-rental',
    sections: [
      { heading: 'Generators', items: ['20 kVA - 500 kVA range', 'Silent canopy options', 'Parallel operation', 'ATS integration'] },
      { heading: 'Fuel', items: ['Fuel supply management', 'Consumption monitoring', 'Storage solutions', 'Environmental compliance'] },
      { heading: 'Monitoring', items: ['24/7 remote monitoring', 'Load management', 'Performance reporting', 'Alert systems'] },
      { heading: 'Support', items: ['Installation & commissioning', 'Maintenance during rental', '24/7 breakdown support', 'Pickup & de-installation'] },
    ]
  },
  {
    icon: Droplets,
    service: 'Hydraulic',
    slug: 'hydraulic-pneumatic-overhauling',
    sections: [
      { heading: 'Diagnostics', items: ['Pressure testing', 'Oil analysis', 'Leak detection', 'Thermal imaging'] },
      { heading: 'Repair', items: ['Cylinder resealing', 'Pump/motor rebuilds', 'Valve servicing', 'Hose replacement'] },
      { heading: 'Testing', items: ['Test benches up to 700 bar', 'System flushing', 'Performance validation', 'Flow testing'] },
      { heading: 'Documentation', items: ['Test reports', 'Oil analysis reports', 'Component certificates', 'As-maintained records'] },
    ]
  },
  {
    icon: Wind,
    service: 'Compressor',
    slug: 'air-compressor-rental',
    sections: [
      { heading: 'Units', items: ['Rotary screw: 50-1000 CFM', 'Reciprocating: 25-200 CFM', 'Silent canopy options', 'Variable speed drive'] },
      { heading: 'Air Treatment', items: ['Refrigerated dryers', 'Desiccant dryers', 'Inline filtration', 'Air receivers'] },
      { heading: 'Rental', items: ['Flexible rental terms', 'Maintenance included', 'Performance monitoring', 'Upgrade options'] },
      { heading: 'Support', items: ['Installation & piping', 'Scheduled maintenance', 'Emergency support', 'Oil & filter changes'] },
    ]
  },
];

export default async function CapabilitiesPage() {
  let services = [];
  try {
    services = await db.service.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
    });
  } catch {
    // DB unavailable — render with empty services
  }

  return (
    <div className="min-h-screen bg-black pt-32 pb-24">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">

        {/* Header */}
        <div className="max-w-3xl mb-20">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-5 h-[1px] bg-white/30" />
            <span className="text-white/40 text-[10px] font-heading tracking-[0.3em] uppercase">Technical Capability</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-light text-white tracking-tight leading-tight mb-6">
            Capabilities
          </h1>
          <p className="text-lg text-secondary font-light leading-relaxed max-w-2xl">
            Can MECELFAB actually handle your requirement? This page answers that question with specifics.
          </p>
        </div>

        {/* Capability Matrix */}
        <div className="flex flex-col gap-16 mb-24">
          {CAPABILITY_MATRIX.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.service} className="border-t border-white/10 pt-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 border border-white/10 rounded-sm flex items-center justify-center">
                    <Icon size={18} className="text-white/40" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-heading font-light text-white">{section.service}</h2>
                    <Link href={`/services/${section.slug}`} className="text-white/30 text-xs font-heading tracking-widest uppercase hover:text-white/60 transition-colors py-2 min-h-[44px] inline-flex items-center">
                      View Service Details
                    </Link>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {section.sections.map((sub) => (
                    <div key={sub.heading}>
                      <h3 className="text-xs font-heading tracking-widest uppercase text-white/50 mb-4">{sub.heading}</h3>
                      <ul className="flex flex-col gap-2">
                        {sub.items.map((item, i) => (
                          <li key={i} className="text-secondary text-sm font-light leading-relaxed flex items-start gap-2">
                            <span className="text-white/15 mt-1.5 text-[6px]">●</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Services List */}
        {services.length > 0 && (
          <div className="mb-24">
            <h2 className="text-2xl font-heading font-light text-white mb-8 border-b border-white/10 pb-4">
              All Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
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
        )}

        {/* CTA */}
        <div className="border-t border-white/10 pt-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-heading text-white mb-2">Have a technical requirement?</h3>
            <p className="text-white/50">Our engineering team will assess feasibility and respond with a solution.</p>
          </div>
          <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-heading text-xs tracking-widest uppercase hover:bg-white/90 transition-colors">
            REQUEST RFQ
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
