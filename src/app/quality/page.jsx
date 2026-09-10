import Link from 'next/link';
import { Shield, Award, CheckCircle, FileCheck, Users, ChevronRight } from 'lucide-react';
import { db } from '@/lib/db';

export const revalidate = 60;

export const metadata = {
  title: 'Quality & Safety | MECELFAB Industrial Solutions',
  description: 'ISO 9001:2015 and ISO 45001:2018 certified quality and safety management systems at MECELFAB Industrial Solutions.',
  openGraph: {
    title: 'Quality & Safety | MECELFAB Industrial Solutions',
    description: 'ISO 9001:2015 and ISO 45001:2018 certified quality and safety management systems at MECELFAB Industrial Solutions.',
    url: 'https://mecelfabpvtltd.com/quality',
    images: [{ url: '/images/hero-bg.png', width: 1200, height: 630, alt: 'MECELFAB Quality & Safety' }],
    type: 'website',
  },
  alternates: {
    canonical: 'https://mecelfabpvtltd.com/quality',
  },
};

export default async function QualityPage() {
  const certifications = await db.certification.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-black pt-32 pb-24">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-6xl">

        {/* Header */}
        <div className="max-w-3xl mb-20">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-5 h-[1px] bg-white/30" />
            <span className="text-white/40 text-[10px] font-heading tracking-[0.3em] uppercase">Quality Management</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-light text-white tracking-tight leading-tight mb-6">
            Quality & Safety
          </h1>
          <p className="text-lg text-secondary font-light leading-relaxed max-w-2xl">
            MECELFAB maintains ISO-certified quality and safety management systems across all service operations.
          </p>
        </div>

        {/* Core Certifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <div className="p-8 border border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 border border-white/10 rounded-sm flex items-center justify-center">
                <Shield size={22} className="text-white/40" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-light text-white">ISO 9001:2015</h2>
                <p className="text-secondary text-xs font-light">Quality Management System</p>
              </div>
            </div>
            <p className="text-white/60 text-sm font-light leading-relaxed mb-6">
              Our quality management system ensures consistent service delivery, continuous improvement, and customer satisfaction across all industrial operations.
            </p>
            <div className="flex flex-col gap-3">
              {[
                'Documented quality procedures',
                'Regular internal audits',
                'Non-conformance tracking',
                'Corrective and preventive actions',
                'Management review processes',
                'Customer feedback integration'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle size={14} className="text-white/20 shrink-0" />
                  <span className="text-secondary text-sm font-light">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 border border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 border border-white/10 rounded-sm flex items-center justify-center">
                <Shield size={22} className="text-white/40" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-light text-white">ISO 45001:2018</h2>
                <p className="text-secondary text-xs font-light">Occupational Health & Safety</p>
              </div>
            </div>
            <p className="text-white/60 text-sm font-light leading-relaxed mb-6">
              Our occupational health and safety management system protects workers and stakeholders through systematic hazard identification, risk assessment, and control.
            </p>
            <div className="flex flex-col gap-3">
              {[
                'Hazard identification and risk assessment',
                'Safety training and competency',
                'Incident investigation and reporting',
                'Emergency preparedness',
                'Worker consultation and participation',
                'Legal compliance monitoring'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle size={14} className="text-white/20 shrink-0" />
                  <span className="text-secondary text-sm font-light">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quality System */}
        <div className="mb-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-5 h-[1px] bg-white/30" />
            <span className="text-white/40 text-[10px] font-heading tracking-[0.3em] uppercase">Our System</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-heading font-light text-white mb-10">
            Quality Management System
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: FileCheck, title: 'Documentation', desc: 'All procedures, work instructions, and quality plans are documented and version-controlled.' },
              { icon: Users, title: 'Competence', desc: 'Personnel are trained and qualified for their roles. Competency records are maintained.' },
              { icon: Award, title: 'Continuous Improvement', desc: 'Regular audits, management reviews, and corrective actions drive ongoing improvement.' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="p-6 border border-white/5 bg-white/[0.02]">
                  <Icon size={20} className="text-white/30 mb-4" />
                  <h3 className="text-white text-sm font-heading tracking-wide mb-2">{item.title}</h3>
                  <p className="text-secondary text-sm font-light leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Safety Procedures */}
        <div className="mb-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-5 h-[1px] bg-white/30" />
            <span className="text-white/40 text-[10px] font-heading tracking-[0.3em] uppercase">Safety Procedures</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-heading font-light text-white mb-10">
            Safety Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              'Pre-job safety analysis and risk assessment',
              'Toolbox talks and safety briefings',
              'Personal protective equipment (PPE) requirements',
              'Permit-to-work system for high-risk activities',
              'Equipment inspection and certification',
              'Fire prevention and emergency response',
              'Environmental protection procedures',
              'Near-miss and incident reporting'
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-white/[0.02] border border-white/5">
                <CheckCircle className="text-white/20 shrink-0 mt-0.5" size={16} />
                <span className="text-white/60 text-sm font-light">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* DB Certifications */}
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

        {/* CTA */}
        <div className="border-t border-white/10 pt-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-heading text-white mb-2">Need quality documentation?</h3>
            <p className="text-white/50">Request copies of our certifications or quality procedures.</p>
          </div>
          <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-heading text-xs tracking-widest uppercase hover:bg-white/90 transition-colors">
            Request Documentation
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
