import Link from 'next/link';
import { FileText, Award, Shield, Download, BookOpen, HelpCircle, ChevronRight } from 'lucide-react';
import { db } from '@/lib/db';

export const revalidate = 60;

export const metadata = {
  title: 'Resources | MECELFAB Industrial Solutions',
  description: 'Download company profiles, certifications, capability statements, technical documents, and FAQs from MECELFAB Industrial Solutions.',
  openGraph: {
    title: 'Resources | MECELFAB Industrial Solutions',
    description: 'Download company profiles, certifications, capability statements, technical documents, and FAQs from MECELFAB Industrial Solutions.',
    url: 'https://mecelfabpvtltd.com/resources',
    images: [{ url: '/images/hero-bg.png', width: 1200, height: 630, alt: 'MECELFAB Resources' }],
    type: 'website',
  },
  alternates: {
    canonical: 'https://mecelfabpvtltd.com/resources',
  },
};

const RESOURCE_SECTIONS = [
  {
    icon: FileText,
    title: 'Company Profile',
    description: 'Overview of MECELFAB capabilities, project history, and service portfolio.',
    items: [
      { name: 'Company Profile PDF', desc: 'Complete overview of MECELFAB Industrial Solutions', available: true },
    ],
  },
  {
    icon: Award,
    title: 'Certifications',
    description: 'Quality management and occupational health & safety certifications.',
    items: [
      { name: 'ISO 9001:2015 — Quality Management', desc: 'Certified quality management system', available: true },
      { name: 'ISO 45001:2018 — Occupational H&S', desc: 'Occupational health and safety management', available: true },
    ],
  },
  {
    icon: Shield,
    title: 'Capability Statement',
    description: 'Technical capability summary across all service disciplines.',
    items: [
      { name: 'Capability Statement', desc: 'Fabrication, erection, maintenance, power, hydraulic capabilities', available: true },
    ],
  },
  {
    icon: BookOpen,
    title: 'Technical Documents',
    description: 'Technical references and specifications for MECELFAB services.',
    items: [
      { name: 'Service Specifications', desc: 'Detailed service scope and technical parameters', available: true },
    ],
  },
  {
    icon: HelpCircle,
    title: 'Frequently Asked Questions',
    description: 'Common questions about MECELFAB services and operations.',
    items: [
      { name: 'General FAQ', desc: 'Services, coverage, timelines, and process questions', available: true },
    ],
  },
];

export default async function ResourcesPage() {
  let certifications = [];
  try {
    certifications = await db.certification.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
    });
  } catch {
    // DB unavailable — render with empty certifications
  }

  return (
    <div className="min-h-screen bg-black pt-32 pb-24">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">

        {/* Header */}
        <div className="max-w-3xl mb-20">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-5 h-[1px] bg-white/30" />
            <span className="text-white/40 text-[10px] font-heading tracking-[0.3em] uppercase">Downloads & References</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-light text-white tracking-tight leading-tight mb-6">
            Resources
          </h1>
          <p className="text-lg text-secondary font-light leading-relaxed max-w-2xl">
            Company profile, certifications, capability statements, and technical documentation for MECELFAB Industrial Solutions.
          </p>
        </div>

        {/* Resource Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          {RESOURCE_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="border border-white/5 p-8 bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 border border-white/10 rounded-sm flex items-center justify-center">
                    <Icon size={18} className="text-white/40" />
                  </div>
                  <h2 className="text-xl font-heading font-light text-white">{section.title}</h2>
                </div>
                <p className="text-secondary text-sm font-light mb-6 leading-relaxed">{section.description}</p>
                <div className="flex flex-col gap-3">
                  {section.items.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-4 bg-black/30 border border-white/5 group hover:border-white/15 transition-colors duration-300">
                      <div>
                        <p className="text-white/80 text-sm font-medium">{item.name}</p>
                        <p className="text-secondary text-xs font-light mt-0.5">{item.desc}</p>
                      </div>
                      {item.available ? (
                        <button className="flex items-center gap-2 text-[10px] font-heading tracking-widest uppercase text-white/40 hover:text-white transition-colors px-3 py-3 min-h-[44px] border border-white/10 hover:border-white/30">
                          <Download size={12} />
                          Download
                        </button>
                      ) : (
                        <span className="text-[10px] font-heading tracking-widest uppercase text-white/20 px-3 py-3 min-h-[44px] flex items-center">
                          Coming Soon
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* DB Certifications (if any exist) */}
        {certifications.length > 0 && (
          <div className="mb-24">
            <h2 className="text-2xl font-heading font-light text-white mb-8 border-b border-white/10 pb-4">
              Verified Certifications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certifications.map((cert) => (
                <div key={cert.id} className="border border-white/5 p-6 bg-white/[0.02]">
                  <h3 className="text-white font-heading text-sm mb-1">{cert.title}</h3>
                  <p className="text-secondary text-xs font-light">{cert.issuer}</p>
                  {cert.year && <p className="text-secondary text-xs font-light mt-1">Issued: {cert.year}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mb-24">
          <h2 className="text-2xl font-heading font-light text-white mb-8 border-b border-white/10 pb-4">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { q: 'What services does MECELFAB provide?', a: 'MECELFAB provides industrial fabrication, erection, hydraulic & pneumatic overhauling, generator spare parts, AMC maintenance, generator rental, air compressor rental, and turbocharger services.' },
              { q: 'Does MECELFAB operate across India?', a: 'Yes. MECELFAB provides pan-India industrial services with project site coverage across major industrial zones.' },
              { q: 'What certifications does MECELFAB hold?', a: 'MECELFAB is ISO 9001:2015 (Quality Management) and ISO 45001:2018 (Occupational Health & Safety) certified.' },
              { q: 'How do I request a quotation?', a: 'Use the Request RFQ form on our Contact page or call us directly. Our engineering team will review your requirements and respond within 24-48 hours.' },
              { q: 'Does MECELFAB provide generator rental?', a: 'Yes. MECELFAB offers industrial generator rental with installation, fuel management, and maintenance support.' },
              { q: 'What is the typical project turnaround?', a: 'Timelines depend on scope and scale. Standard fabrication projects range from 2-12 weeks. Emergency breakdown support is available.' },
            ].map((faq, i) => (
              <div key={i} className="border border-white/5 p-6 bg-white/[0.02]">
                <h3 className="text-white text-sm font-medium mb-3">{faq.q}</h3>
                <p className="text-secondary text-sm font-light leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="border-t border-white/10 pt-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-heading text-white mb-2">Need more information?</h3>
            <p className="text-white/50">Contact our team for detailed technical documentation.</p>
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
