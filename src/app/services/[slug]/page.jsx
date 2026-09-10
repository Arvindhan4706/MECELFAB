import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { ArrowLeft, CheckCircle, Shield, ChevronRight, HelpCircle } from 'lucide-react';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const service = await db.service.findUnique({
    where: { slug, status: 'ACTIVE' }
  });

  if (!service) return { title: 'Service Not Found' };

  return {
    title: `${service.title} | MECELFAB Industrial Solutions`,
    description: service.description,
    alternates: {
      canonical: `https://mecelfabpvtltd.com/services/${slug}`,
    },
  };
}

function parseJson(str) {
  if (!str) return [];
  try { return JSON.parse(str); } catch { return []; }
}

function parseFaq(str) {
  if (!str) return [];
  try { return JSON.parse(str); } catch { return []; }
}

export default async function ServicePage({ params }) {
  const { slug } = await params;
  const service = await db.service.findUnique({
    where: { slug, status: 'ACTIVE' }
  });

  if (!service) {
    notFound();
  }

  const capabilities = parseJson(service.capabilities);
  const scopeOfWork = parseJson(service.scopeOfWork);
  const processSteps = parseJson(service.processSteps);
  const equipment = parseJson(service.equipment);
  const industriesServed = parseJson(service.industriesServed);
  const faq = parseFaq(service.faq);

  return (
    <div className="min-h-screen bg-black">
      {/* 01 — Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 border-b border-white/5">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-6xl">
          <Link href="/services" className="inline-flex items-center gap-2 text-white/40 mb-8 hover:text-white transition-colors font-heading text-xs uppercase tracking-widest">
            <ArrowLeft size={14} />
            All Services
          </Link>
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-light text-white tracking-tight leading-tight mb-6">
              {service.title}
            </h1>
            <p className="text-lg md:text-xl text-white/60 font-light leading-relaxed max-w-3xl">
              {service.description}
            </p>
          </div>
        </div>
      </section>

      {/* 02 — What we do */}
      {service.content && (
        <section className="py-16 md:py-24 border-b border-white/5">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-6xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-5 h-[1px] bg-white/30" />
              <span className="text-white/40 text-[10px] font-heading tracking-[0.3em] uppercase">What We Do</span>
            </div>
            <p className="text-white/70 text-lg font-light leading-relaxed max-w-4xl">
              {service.content}
            </p>
          </div>
        </section>
      )}

      {/* 03 — Scope of Work */}
      {scopeOfWork.length > 0 && (
        <section className="py-16 md:py-24 border-b border-white/5">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-6xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-5 h-[1px] bg-white/30" />
              <span className="text-white/40 text-[10px] font-heading tracking-[0.3em] uppercase">Scope of Work</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-heading font-light text-white mb-10">
              Specific Activities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scopeOfWork.map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-white/[0.02] border border-white/5">
                  <CheckCircle className="text-white/30 shrink-0 mt-0.5" size={18} />
                  <span className="text-white/70 text-sm font-light">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 04 — Equipment / Capability */}
      {equipment.length > 0 && (
        <section className="py-16 md:py-24 border-b border-white/5">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-6xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-5 h-[1px] bg-white/30" />
              <span className="text-white/40 text-[10px] font-heading tracking-[0.3em] uppercase">Equipment & Capability</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-heading font-light text-white mb-10">
              Technical Equipment
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {equipment.map((item, i) => (
                <div key={i} className="p-5 bg-white/[0.02] border border-white/5">
                  <p className="text-white/70 text-sm font-light">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 05 — Process */}
      {processSteps.length > 0 && (
        <section className="py-16 md:py-24 border-b border-white/5">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-6xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-5 h-[1px] bg-white/30" />
              <span className="text-white/40 text-[10px] font-heading tracking-[0.3em] uppercase">Process</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-heading font-light text-white mb-10">
              Our Workflow
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {processSteps.map((step, i) => (
                <div key={i} className="relative">
                  <div className="text-5xl font-heading font-bold text-white/[0.04] select-none mb-2">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-white/30 rounded-full" />
                    <span className="text-white/70 text-sm font-heading tracking-wide">{step}</span>
                  </div>
                  {i < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-3 left-full w-full h-[1px] bg-gradient-to-r from-white/10 to-transparent" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 06 — Industries Served */}
      {industriesServed.length > 0 && (
        <section className="py-16 md:py-24 border-b border-white/5">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-6xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-5 h-[1px] bg-white/30" />
              <span className="text-white/40 text-[10px] font-heading tracking-[0.3em] uppercase">Industries Served</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-heading font-light text-white mb-10">
              Sector Applications
            </h2>
            <div className="flex flex-wrap gap-3">
              {industriesServed.map((industry, i) => (
                <Link
                  key={i}
                  href="/industries"
                  className="px-5 py-3 border border-white/10 text-white/60 text-sm font-heading tracking-wide hover:border-white/30 hover:text-white transition-colors"
                >
                  {industry}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 07 — Safety & Quality */}
      <section className="py-16 md:py-24 border-b border-white/5">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-6xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-5 h-[1px] bg-white/30" />
            <span className="text-white/40 text-[10px] font-heading tracking-[0.3em] uppercase">Safety & Quality</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-heading font-light text-white mb-10">
            Quality Assurance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <Shield size={20} className="text-white/40" />
                <h3 className="text-white text-sm font-heading tracking-wide">ISO 9001:2015</h3>
              </div>
              <p className="text-secondary text-sm font-light leading-relaxed">
                Quality management system certified. All work follows documented procedures with traceable inspection records.
              </p>
            </div>
            <div className="p-6 bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <Shield size={20} className="text-white/40" />
                <h3 className="text-white text-sm font-heading tracking-wide">ISO 45001:2018</h3>
              </div>
              <p className="text-secondary text-sm font-light leading-relaxed">
                Occupational health and safety management. Safety-first approach with risk assessment for every project.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 08 — Capabilities */}
      {capabilities.length > 0 && (
        <section className="py-16 md:py-24 border-b border-white/5">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-6xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-5 h-[1px] bg-white/30" />
              <span className="text-white/40 text-[10px] font-heading tracking-[0.3em] uppercase">Capabilities</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-heading font-light text-white mb-10">
              Core Capabilities
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

      {/* 09 — FAQ */}
      {faq.length > 0 && (
        <section className="py-16 md:py-24 border-b border-white/5">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-6xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-5 h-[1px] bg-white/30" />
              <span className="text-white/40 text-[10px] font-heading tracking-[0.3em] uppercase">FAQ</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-heading font-light text-white mb-10">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {faq.map((item, i) => (
                <div key={i} className="border border-white/5 p-6 bg-white/[0.02]">
                  <div className="flex items-start gap-3 mb-3">
                    <HelpCircle size={16} className="text-white/30 mt-0.5 shrink-0" />
                    <h3 className="text-white text-sm font-medium leading-relaxed">{item.question}</h3>
                  </div>
                  <p className="text-secondary text-sm font-light leading-relaxed pl-0 md:pl-7">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 10 — RFQ CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-6xl">
          <div className="p-8 md:p-12 bg-white/[0.02] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <p className="text-white/40 text-[10px] font-heading tracking-[0.3em] uppercase mb-3">Have a similar requirement?</p>
              <h3 className="text-2xl md:text-3xl font-heading font-light text-white mb-2">
                Request Technical Consultation
              </h3>
              <p className="text-white/50 text-sm font-light">
                Our engineering team will review your requirements and respond within 24-48 hours.
              </p>
            </div>
            <Link
              href={`/contact?service=${service.slug}`}
              className="inline-flex items-center justify-center gap-3 w-full md:w-auto px-8 py-4 bg-white text-black font-heading text-xs tracking-widest uppercase hover:bg-white/90 transition-colors shrink-0"
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
