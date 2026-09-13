import Link from 'next/link';
import { FileText, Award, Shield, Download, BookOpen, ChevronRight, HelpCircle } from 'lucide-react';

const RESOURCE_SECTIONS = [
  {
    icon: FileText,
    title: 'Company Profile',
    description: 'Overview of MECELFAB capabilities, project history, and service portfolio.',
    items: [
      { name: 'Company Profile PDF', desc: 'Complete overview of MECELFAB Industrial Solutions', available: false },
    ],
  },
  {
    icon: Award,
    title: 'Certifications',
    description: 'Quality management and occupational health & safety certifications.',
    items: [
      { name: 'ISO 9001:2015 — Quality Management', desc: 'Certified quality management system', available: false },
      { name: 'ISO 45001:2018 — Occupational H&S', desc: 'Occupational health and safety management', available: false },
    ],
  },
  {
    icon: Shield,
    title: 'Capability Statement',
    description: 'Technical capability summary across all service disciplines.',
    items: [
      { name: 'Capability Statement', desc: 'Fabrication, erection, maintenance, power, hydraulic capabilities', available: false },
    ],
  },
  {
    icon: BookOpen,
    title: 'Technical Documents',
    description: 'Technical references and specifications for MECELFAB services.',
    items: [
      { name: 'Service Specifications', desc: 'Detailed service scope and technical parameters', available: false },
    ],
  },
];

const FAQS = [
  { q: 'What services does MECELFAB provide?', a: 'MECELFAB provides industrial fabrication, erection, hydraulic & pneumatic overhauling, generator spare parts, AMC maintenance, generator rental, air compressor rental, and turbocharger services.' },
  { q: 'What regions does MECELFAB serve?', a: 'MECELFAB serves industrial clients across Tamil Nadu and South India, with project site coverage in major industrial zones.' },
  { q: 'What certifications does MECELFAB hold?', a: 'MECELFAB is ISO 9001:2015 (Quality Management) and ISO 45001:2018 (Occupational Health & Safety) certified.' },
  { q: 'How do I request a quotation?', a: 'Use the Request RFQ form on our Contact page or call us directly. Our engineering team will review your requirements and respond within 24-48 hours.' },
  { q: 'Does MECELFAB provide generator rental?', a: 'Yes. MECELFAB offers industrial generator rental with installation, fuel management, and maintenance support.' },
  { q: 'What is the typical project turnaround?', a: 'Timelines depend on scope and scale. Standard fabrication projects range from 2-12 weeks. Emergency breakdown support is available.' },
];

export default function CompanyResources({ certifications = [] }) {
  return (
    <section id="company-resources" className="section-padding bg-black border-t border-white/5 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-6xl">

        {/* Section Header */}
        <div className="text-center mb-16 md:mb-24">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-5 h-[1px] bg-white/30" />
            <span className="text-white/40 text-[10px] font-heading tracking-[0.3em] uppercase">Downloads & References</span>
            <div className="w-5 h-[1px] bg-white/30" />
          </div>
          <h2 className="text-3xl md:text-5xl font-heading font-light text-white leading-tight tracking-tight mb-6">
            Company Resources & Downloads
          </h2>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mb-6" />
          <p className="text-base md:text-lg text-secondary font-light leading-relaxed max-w-2xl mx-auto">
            Access official company profiles, certifications, capability statements, and technical documentation.
          </p>
        </div>

        {/* Resource Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-20">
          {RESOURCE_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.title}
                className="border border-white/5 p-6 md:p-8 bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-300 rounded-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 border border-white/10 rounded-md flex items-center justify-center bg-white/[0.03]">
                      <Icon size={18} className="text-white/60" />
                    </div>
                    <h3 className="text-xl font-heading font-light text-white">{section.title}</h3>
                  </div>
                  <p className="text-secondary text-sm font-light mb-6 leading-relaxed">
                    {section.description}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  {section.items.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded group hover:border-white/15 transition-colors duration-300"
                    >
                      <div>
                        <p className="text-white/90 text-sm font-medium">{item.name}</p>
                        <p className="text-secondary text-xs font-light mt-0.5">{item.desc}</p>
                      </div>
                      {item.available ? (
                        <button className="flex items-center gap-2 text-[10px] font-heading tracking-widest uppercase text-white hover:text-white transition-colors px-3 py-2 min-h-[40px] border border-white/20 hover:border-white/40 rounded">
                          <Download size={12} />
                          Download
                        </button>
                      ) : (
                        <span className="text-[10px] font-heading tracking-widest uppercase text-white/30 px-3 py-2 min-h-[40px] flex items-center">
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

        {/* Database Verified Certifications (if populated) */}
        {certifications.length > 0 && (
          <div className="mb-20">
            <h3 className="text-xl md:text-2xl font-heading font-light text-white mb-6 border-b border-white/10 pb-4">
              Verified Compliance Certifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certifications.map((cert) => (
                <div key={cert.id} className="border border-white/5 p-6 bg-white/[0.02] rounded-lg">
                  <h4 className="text-white font-heading text-sm mb-1">{cert.title}</h4>
                  <p className="text-secondary text-xs font-light">{cert.issuer}</p>
                  {cert.year && <p className="text-secondary text-xs font-light mt-1">Issued: {cert.year}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Section inside About */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <HelpCircle size={20} className="text-white/40" />
            <h3 className="text-xl md:text-2xl font-heading font-light text-white">
              Frequently Asked Questions
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-white/5 p-6 bg-white/[0.02] rounded-lg">
                <h4 className="text-white text-sm font-medium mb-2.5">{faq.q}</h4>
                <p className="text-secondary text-sm font-light leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action strip */}
        <div className="border border-white/10 p-8 rounded-lg bg-gradient-to-r from-white/[0.03] to-transparent flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h4 className="text-xl font-heading text-white mb-1">Need specific technical documentation?</h4>
            <p className="text-secondary text-sm font-light">
              Contact our engineering team to request custom capability statements, drawings, or procedure specs.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-black font-heading text-xs tracking-widest uppercase hover:bg-white/90 transition-colors shrink-0 rounded-sm"
          >
            REQUEST RFQ / DOCS
            <ChevronRight size={14} />
          </Link>
        </div>

      </div>
    </section>
  );
}
