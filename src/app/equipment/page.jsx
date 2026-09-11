import Link from 'next/link';
import { Zap, Wind, Droplets, Settings, Hammer, Clock, ChevronRight } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata = {
  title: 'Equipment & Capabilities | MECELFAB Industrial Solutions',
  description: 'View MECELFAB equipment capabilities — generators, compressors, hydraulic systems, turbochargers, and industrial machinery we service and deploy.',
  openGraph: {
    title: 'Equipment & Capabilities | MECELFAB Industrial Solutions',
    description: 'View MECELFAB equipment capabilities — generators, compressors, hydraulic systems, turbochargers, and industrial machinery we service and deploy.',
    url: 'https://mecelfabpvtltd.com/equipment',
    images: [{ url: '/images/hero-bg.png', width: 1200, height: 630, alt: 'MECELFAB Equipment' }],
    type: 'website',
  },
  alternates: { canonical: 'https://mecelfabpvtltd.com/equipment' },
};

const EQUIPMENT_CATEGORIES = [
  {
    title: 'Power Generation',
    icon: Zap,
    description: 'Diesel generators, silent generators, and temporary power solutions from 20 kVA to 2000 kVA.',
    items: [
      { name: 'Diesel Generators', range: '20 kVA – 2000 kVA', brands: 'Cummins, Kirloskar, Ashok Leyland, Caterpillar' },
      { name: 'Silent Generators', range: '20 kVA – 500 kVA', brands: 'Cummins, Honda, Mahindra Powerol' },
      { name: 'Pin-Rack Generators', range: '250 kVA – 1500 kVA', brands: 'Custom configurations available' },
    ],
  },
  {
    title: 'Compressed Air Systems',
    icon: Wind,
    description: 'Rotary screw, reciprocating, and portable air compressors for industrial and construction applications.',
    items: [
      { name: 'Rotary Screw Compressors', range: '50 CFM – 1500 CFM', brands: 'Atlas Copco, Ingersoll Rand, ELGi' },
      { name: 'Reciprocating Compressors', range: '10 CFM – 200 CFM', brands: 'ELGi, Fini, Kohler' },
      { name: 'Portable Air Compressors', range: '185 CFM – 900 CFM', brands: 'Atlas Copco, Kaeser, Doosan' },
    ],
  },
  {
    title: 'Hydraulic & Pneumatic Systems',
    icon: Droplets,
    description: 'Hydraulic power packs, cylinders, pneumatic actuators, and fluid power systems.',
    items: [
      { name: 'Hydraulic Power Packs', range: '5 HP – 200 HP', brands: 'Yuken, Rexroth, Vickers, HAWE' },
      { name: 'Hydraulic Cylinders', range: 'Bore 40mm – 300mm', brands: 'Custom & OEM cylinders' },
      { name: 'Pneumatic Actuators', range: 'ISO 6432 / ISO 15552', brands: 'Festo, SMC, Parker' },
    ],
  },
  {
    title: 'Turbochargers',
    icon: Settings,
    description: 'Turbocharger rebuilds, repairs, and replacement for diesel generators and marine engines.',
    items: [
      { name: 'Automotive Turbochargers', range: 'Petrol & Diesel', brands: 'Garrett, BorgWarner, IHI' },
      { name: 'Marine Turbochargers', range: 'Medium-speed engines', brands: 'MAN, Wärtsilä,三菱' },
      { name: 'Industrial Turbochargers', range: 'Generator sets', brands: 'Holset, Schwitzer, Napier' },
    ],
  },
  {
    title: 'Industrial Machinery',
    icon: Hammer,
    description: 'CNC machines, press equipment, conveyor systems, and material handling installations.',
    items: [
      { name: 'CNC Machines', range: '3-axis to 5-axis', brands: 'Installation & alignment services' },
      { name: 'Press Equipment', range: 'Hydraulic & Mechanical', brands: 'Installation, foundation & commissioning' },
      { name: 'Conveyor Systems', range: 'Belt & Roller', brands: 'Design, fabrication & erection' },
    ],
  },
  {
    title: 'Maintenance & Support',
    icon: Clock,
    description: 'Annual maintenance contracts, emergency breakdown support, and scheduled servicing.',
    items: [
      { name: 'Generator AMC', range: 'Comprehensive plans', brands: 'Preventive + breakdown coverage' },
      { name: 'Hydraulic System AMC', range: 'Scheduled maintenance', brands: 'Oil analysis, seal replacement, testing' },
      { name: 'Emergency Breakdown', range: '24/7 response', brands: 'Multi-site deployment' },
    ],
  },
];

export default function EquipmentPage() {
  return (
    <div className="pt-24 bg-primary min-h-screen">
      {/* Hero */}
      <section className="pt-8 pb-16 md:pt-12 md:pb-20 border-b border-white/5">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-6xl">
          <Breadcrumbs items={[{ label: 'Equipment & Capabilities' }]} />
          <div className="max-w-3xl">
            <span className="inline-block text-secondary text-sm font-heading tracking-widest uppercase mb-6 relative after:hidden md:after:block after:content-[''] after:absolute after:top-1/2 after:-right-12 after:w-8 after:h-[1px] after:bg-secondary/50">
              Equipment Catalog
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-heading font-light text-white tracking-tight mb-6">
              Industrial Equipment<br />
              <span className="text-white/35 italic font-serif">& Capabilities</span>
            </h1>
            <p className="text-lg text-secondary font-light leading-relaxed max-w-2xl">
              Overview of equipment types, capacity ranges, and brands MECELFAB services, deploys, and maintains across India.
            </p>
          </div>
        </div>
      </section>

      {/* Equipment Grid */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EQUIPMENT_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <div key={cat.title} className="bg-white/[0.02] border border-white/5 rounded-xl p-6 md:p-8 hover:border-white/15 transition-colors duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                      <Icon size={18} className="text-secondary" />
                    </div>
                    <h2 className="text-lg font-heading font-light text-white">{cat.title}</h2>
                  </div>
                  <p className="text-secondary text-sm font-light mb-6 leading-relaxed">{cat.description}</p>
                  <div className="flex flex-col gap-3">
                    {cat.items.map((item) => (
                      <div key={item.name} className="p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <span className="text-white text-sm font-light truncate">{item.name}</span>
                          <span className="text-secondary text-xs font-light shrink-0">{item.range}</span>
                        </div>
                        <p className="text-white/40 text-xs font-light">{item.brands}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-4xl text-center">
          <h2 className="text-2xl md:text-3xl font-heading font-light text-white mb-4">
            Need Specific Equipment Information?
          </h2>
          <p className="text-secondary font-light max-w-xl mx-auto mb-8">
            Our engineering team can provide detailed specifications, availability, and pricing for any equipment requirement.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-heading text-xs tracking-widest uppercase hover:bg-white/90 transition-colors"
            >
              REQUEST RFQ
              <ChevronRight size={14} />
            </Link>
            <Link
              href="/capabilities"
              className="inline-flex items-center gap-2 px-8 py-4 border border-white/15 text-white font-heading text-xs tracking-widest uppercase hover:border-white/40 hover:text-white transition-colors"
            >
              View Full Capabilities
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
