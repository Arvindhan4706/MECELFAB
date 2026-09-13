"use client";
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { Award, ShieldCheck, Cog, TrendingUp } from 'lucide-react';

const pillars = [
  {
    icon: Award,
    label: 'Quality Management',
    value: 'ISO 9001:2015',
    sub: 'Certified Operations',
  },
  {
    icon: ShieldCheck,
    label: 'Safety Standard',
    value: 'ISO 45001:2018',
    sub: 'Zero LTI Target',
  },
  {
    icon: Cog,
    label: 'Fabrication & Erection',
    value: 'Structural Steel',
    sub: 'Welding & Assembly',
  },
  {
    icon: TrendingUp,
    label: 'Project Delivery',
    value: 'On-Time',
    sub: 'Documented Handover',
  },
];

const TrustSection = () => {
  const ref = useRef(null);

  useGSAP(() => {
    gsap.fromTo('.trust-card',
      { opacity: 0, y: 36 },
      {
        opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 85%' },
      }
    );
  }, { scope: ref });

  return (
    <section ref={ref} className="relative bg-black border-t border-white/5 section-padding overflow-hidden">
      {/* subtle grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <div className="relative container mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">
        {/* top rule */}
        <div className="trust-line w-full h-[1px] bg-gradient-to-r from-white/20 via-white/10 to-transparent mb-14" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
          {pillars.map(({ icon: Icon, label, value, sub }) => (
            <div
              key={label}
              className="trust-card group flex flex-col gap-5 px-8 py-6 first:pl-0 last:pr-0 opacity-0 hover:bg-white/[0.02] transition-colors duration-500"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center border border-white/10 group-hover:border-white/25 transition-colors duration-500">
                  <Icon size={15} className="text-white/50 group-hover:text-white transition-colors duration-500" />
                </div>
                <span className="text-white/35 text-[10px] font-heading tracking-[0.25em] uppercase">{label}</span>
              </div>
              <div>
                <div className="text-2xl font-heading font-light text-white tracking-tight mb-1">{value}</div>
                <div className="text-xs text-white/40 font-light tracking-wide">{sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* bottom rule */}
        <div className="trust-line w-full h-[1px] bg-gradient-to-r from-white/20 via-white/10 to-transparent mt-14" />
      </div>
    </section>
  );
};

export default TrustSection;