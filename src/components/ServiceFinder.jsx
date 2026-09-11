'use client';
import { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';

const ServiceFinder = ({ services = [] }) => {
  const containerRef = useRef(null);

  const servicesOptions = services.length > 0 
    ? services.map(s => ({ label: `I need ${s.title.toLowerCase()}.`, value: s.slug }))
    : [
        { label: 'I need industrial erection.', value: 'industrial-erection' },
        { label: 'I need fabrication.', value: 'industrial-fabrication' },
        { label: 'I need hydraulic/pneumatic servicing.', value: 'hydraulic-pneumatic-overhauling' },
        { label: 'I need generator spare parts.', value: 'generator-spare-parts' },
        { label: 'I need AMC.', value: 'amc-maintenance' },
        { label: 'I need generator rental.', value: 'generator-rental' },
        { label: 'I need air compressor rental.', value: 'air-compressor-rental' },
        { label: 'I need turbocharger service.', value: 'turbocharger-services' },
      ];

  useGSAP(() => {
    gsap.fromTo('.sf-heading',
      { y: 30, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
        }
      }
    );

    gsap.fromTo('.sf-option',
      { y: 20, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power2.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 75%',
        }
      }
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="section-padding bg-black/50 border-y border-white/5 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-5xl relative z-10">
        <div className="text-center mb-12">
          <h2 className="sf-heading text-3xl md:text-5xl font-heading font-light text-white tracking-tight">
            WHAT DO YOU NEED HELP WITH?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {servicesOptions.map((opt, i) => (
            <Link
              key={i}
              href={`/contact?service=${opt.value}`}
              className="sf-option group flex items-center justify-between p-6 bg-white/[0.02] border border-white/10 hover:border-accent hover:bg-white/[0.05] transition-all duration-300 rounded-sm"
            >
              <span className="text-white/80 group-hover:text-white font-light text-lg transition-colors">
                {opt.label}
              </span>
              <div className="w-10 h-10 border border-white/10 group-hover:border-accent/50 flex items-center justify-center bg-black/20 group-hover:bg-accent/10 transition-all duration-300">
                <ArrowRight size={18} className="text-white/50 group-hover:text-accent transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceFinder;
