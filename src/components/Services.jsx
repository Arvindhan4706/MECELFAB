"use client";
import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { ArrowRight, Wrench, Hammer, Droplets, Zap, Clock, Battery, Wind, Settings } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const ICON_MAP = {
  'industrial-erection': Hammer,
  'industrial-fabrication': Wrench,
  'hydraulic-pneumatic-overhauling': Droplets,
  'generator-spare-parts': Zap,
  'amc': Clock,
  'generator-rental': Battery,
  'air-compressor-rental': Wind,
  'turbocharger-services': Settings,
};

const getServiceIcon = (slug) => {
  return ICON_MAP[slug] || Settings;
};

const Services = ({ services = [] }) => {
  const sectionRef = useRef(null);
  const [hoveredId, setHoveredId] = useState(null);

  useGSAP(() => {
    gsap.fromTo('.svc-eyebrow',
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      }
    );
    gsap.fromTo('.svc-heading',
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.1,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      }
    );
    gsap.fromTo('.svc-row',
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.8, stagger: 0.07, ease: 'power3.out',
        scrollTrigger: { trigger: '.svc-list', start: 'top 85%' },
      }
    );
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} id="services" className="section-padding bg-black border-t border-white/5">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 mb-12 md:mb-20">
          <div>
            <div className="svc-eyebrow flex items-center gap-3 mb-5 opacity-0">
              <div className="w-5 h-[1px] bg-white/30" />
              <span className="text-white/40 text-[10px] font-heading tracking-[0.3em] uppercase">Our Capabilities</span>
            </div>
            <h2 className="svc-heading text-3xl md:text-5xl lg:text-6xl font-heading font-light text-white tracking-tight leading-tight opacity-0">
              Eight Disciplines.<br />
              <span className="text-white/35 italic font-serif">One Partner.</span>
            </h2>
          </div>
          <Link
            href="/services"
            className="svc-eyebrow group self-start md:self-end inline-flex items-center gap-3 px-6 py-3 border border-white/15 text-white/50 font-heading text-xs tracking-[0.2em] uppercase hover:border-white/40 hover:text-white transition-all duration-300 opacity-0"
          >
            View All Services
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>

        {/* Services List */}
        <div className="svc-list grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-col gap-6 lg:gap-0">
          {services.map((service, index) => {
            const Icon = getServiceIcon(service.slug);
            const displayId = String(index + 1).padStart(2, '0');
            const isHovered = hoveredId === service.id;
            const capabilities = service.capabilities ? JSON.parse(service.capabilities) : [];
            
            return (
              <div
                key={service.id}
                className="svc-row group border border-white/5 lg:border-0 lg:border-t lg:border-white/5 lg:last:border-b opacity-0 bg-white/[0.02] lg:bg-transparent rounded-lg overflow-hidden relative"
                onMouseEnter={() => setHoveredId(service.id)}
                onMouseLeave={() => setHoveredId(null)}
                onFocus={() => setHoveredId(service.id)}
                onBlur={() => setHoveredId(null)}
                tabIndex={-1}
              >
                {/* Mobile Ghost Number */}
                <div className="absolute top-0 right-4 text-[80px] font-heading font-bold text-white/[0.02] select-none pointer-events-none lg:hidden leading-none pt-4">
                  {displayId}
                </div>

                <div className="flex flex-col lg:flex-row items-start lg:items-stretch gap-5 lg:gap-0 py-6 px-6 lg:px-0 lg:py-7 transition-all duration-500 relative z-10">
                  
                  <div className="flex items-center gap-4 lg:contents">
                    {/* Number - Desktop only */}
                    <div className="hidden lg:flex w-auto lg:w-16 flex-shrink-0 items-start pt-1">
                      <span className="text-xs font-heading text-white/20 group-hover:text-white/50 transition-colors duration-500 tracking-widest">
                        {displayId}
                      </span>
                    </div>

                    {/* Icon */}
                    <div className="w-auto lg:w-12 flex-shrink-0 flex items-start pt-0.5">
                      <div className="w-10 h-10 lg:w-9 lg:h-9 flex items-center justify-center border border-white/8 group-hover:border-white/25 bg-white/[0.04] group-hover:bg-white/[0.06] transition-all duration-500 rounded-sm">
                        <Icon size={16} className="text-white/35 group-hover:text-accent transition-colors duration-500" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col lg:flex-row lg:items-start gap-5 lg:gap-12 w-full">
                    <div className="flex-1">
                      <h3 className="text-xl lg:text-2xl font-heading font-light text-white/90 lg:text-white/70 group-hover:text-white tracking-tight mb-2 transition-colors duration-500 pr-8 lg:pr-0">
                        {service.title}
                      </h3>
                      <p className="text-sm text-white/50 lg:text-white/30 group-hover:text-white/55 font-light leading-relaxed max-w-lg transition-colors duration-500">
                        {service.description}
                      </p>
                    </div>

                    {/* Tags — visible on mobile, hover-reveal on desktop */}
                    <div className={`flex flex-col gap-3 w-full lg:w-auto lg:max-w-xs transition-all duration-500 lg:h-auto lg:overflow-visible lg:opacity-0 group-hover:opacity-100 ${isHovered ? 'lg:opacity-100' : ''}`}>
                      <div className="flex flex-wrap gap-2 items-start">
                        {capabilities.map((cap) => (
                          <span key={cap} className="px-2.5 py-1 text-[10px] font-heading tracking-widest uppercase border border-white/10 text-white/40 bg-black/20 lg:bg-transparent">
                            {cap}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Arrow CTA & Details Toggle */}
                  <div className="flex-shrink-0 flex items-center justify-between w-full lg:w-auto mt-4 lg:mt-0 pt-4 border-t border-white/5 lg:border-0 lg:pt-0 lg:pl-8">
                    
                    <Link
                      href={`/services/${service.slug}`}
                      className="text-[10px] font-heading tracking-[0.2em] uppercase text-accent/80 hover:text-accent flex items-center gap-2 px-2 py-2 -ml-2"
                    >
                      View Details
                    </Link>

                    <Link
                      href={`/services/${service.slug}`}
                      className={`flex items-center justify-center w-10 h-10 border border-white/10 group-hover:border-white/40 group-hover:bg-white group-hover:text-black text-white/30 transition-all duration-500 rounded-sm ml-auto lg:ml-0`}
                    >
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default Services;