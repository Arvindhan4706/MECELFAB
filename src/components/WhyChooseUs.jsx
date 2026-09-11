"use client";
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { CheckCircle, ShieldAlert, Lightbulb, Calendar } from 'lucide-react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const reasons = [
  {
    icon: CheckCircle,
    num: '01',
    title: 'Industrial Experience',
    desc: 'Established company with hands-on work in heavy manufacturing and power-sector facilities.',
  },
  {
    icon: ShieldAlert,
    num: '02',
    title: 'Mechanical Expertise',
    desc: 'Work in structural fabrication, mechanical erection, and complete system installation including alignment and commissioning.',
  },
  {
    icon: Lightbulb,
    num: '03',
    title: 'Equipment Support',
    desc: 'Complete generator and compressor rental, spare-part supply and breakdown response.',
  },
  {
    icon: Calendar,
    num: '04',
    title: 'Planned Maintenance',
    desc: 'Scheduled AMC contracts for generators and compressors to reduce unplanned breakdowns.',
  },
];

const WhyChooseUs = () => {
  const containerRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo('.wcu-left',
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: containerRef.current, start: 'top 78%' },
      }
    );
    gsap.fromTo('.wcu-card',
      { opacity: 0, y: 36 },
      {
        opacity: 1, y: 0, duration: 0.85, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.wcu-grid', start: 'top 82%' },
      }
    );
  }, { scope: containerRef });

  return (
    <section
      ref={containerRef}
      id="why-choose-us"
      className="relative section-padding bg-[#060606] border-t border-white/5 overflow-hidden"
    >
      {/* Background diagonal rule */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent"
          style={{ left: '55%' }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-20 lg:gap-28 items-start">

          {/* Left — headline + CTA */}
          <div className="wcu-left opacity-0">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-5 h-[1px] bg-white/30" />
              <span className="text-white/40 text-[10px] font-heading tracking-[0.3em] uppercase">Why MECELFAB</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-heading font-light text-white tracking-tight leading-tight mb-8">
              Fabrication. Erection.<br />
              <span className="text-white/30 italic font-serif">Maintenance.</span>
            </h2>

            <p className="text-sm md:text-base text-white/45 font-light leading-relaxed mb-10 max-w-sm">
              We handle fabrication, safe erection, maintenance callouts, and equipment rental from our project offices.
            </p>

            <Link
              href="/contact"
              className="group inline-flex items-center gap-3 px-6 py-3.5 bg-white text-black font-heading font-semibold text-xs tracking-[0.2em] uppercase hover:bg-white/90 transition-colors duration-300"
            >
              REQUEST RFQ
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>

          {/* Right — reason cards */}
          <div className="wcu-grid grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/5">
            {reasons.map(({ icon: Icon, num, title, desc }) => (
              <div
                key={num}
                className="wcu-card group relative bg-[#060606] p-8 flex flex-col gap-6 hover:bg-white/[0.03] transition-colors duration-500 opacity-0"
              >
                {/* top row */}
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 flex items-center justify-center border border-white/8 group-hover:border-white/25 bg-white/[0.02] transition-all duration-500">
                    <Icon size={16} className="text-white/40 group-hover:text-white/80 transition-colors duration-500" />
                  </div>
                  <span className="text-xs font-heading text-white/15 group-hover:text-white/30 tracking-widest transition-colors duration-500">
                    {num}
                  </span>
                </div>

                {/* content */}
                <div>
                  <h3 className="text-lg font-heading font-light text-white/70 group-hover:text-white tracking-tight mb-2 transition-colors duration-500">
                    {title}
                  </h3>
                  <p className="text-sm text-white/30 group-hover:text-white/55 font-light leading-relaxed transition-colors duration-500">
                    {desc}
                  </p>
                </div>

                {/* bottom accent line */}
                <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full bg-white/20 transition-all duration-700 ease-out" />
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
