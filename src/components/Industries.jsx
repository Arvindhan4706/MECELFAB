"use client";
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import TextReveal from './animations/TextReveal';

// Default industries if no DB data — visual placeholders only
const DEFAULT_INDUSTRIES = [
  {
    id: '01', title: 'Industrial Manufacturing',
    desc: 'Precision fabrication, machine foundations, automation and industrial infrastructure for manufacturing plants.',
    image: '/images/project-fabrication.png',
    capabilities: ['Equipment Erection', 'Machine Foundations', 'Structural Fabrication'],
    slug: 'industrial-manufacturing',
  },
  {
    id: '02', title: 'Power & Energy',
    desc: 'Generator installations, spare parts supply and complete power systems for energy sector clients.',
    image: '/images/project-electrical.png',
    capabilities: ['Generator Services', 'Spare Parts', 'Temporary Power'],
    slug: 'power-energy',
  },
  {
    id: '03', title: 'Industrial Maintenance',
    desc: 'Overhauling and annual maintenance contracts for hydraulic, pneumatic and turbocharger systems.',
    image: '/images/project-maintenance.png',
    capabilities: ['Hydraulic Systems', 'Pneumatic Systems', 'Turbocharger Servicing', 'AMC'],
    slug: 'industrial-maintenance',
  },
  {
    id: '04', title: 'Commercial / Temporary Power',
    desc: 'Flexible rental solutions for generators and air compressors across commercial and event applications.',
    image: '/images/project-commercial.png',
    capabilities: ['Generator Rental', 'Air Compressor Rental', 'Event Power'],
    slug: 'commercial-power',
  },
];

const Industries = ({ industries: propIndustries }) => {
  const containerRef = useRef(null);

  // Use DB industries if passed as props, otherwise use local defaults
  const industries = propIndustries?.length
    ? propIndustries.map((ind, i) => ({
        id: String(i + 1).padStart(2, '0'),
        title: ind.title,
        desc: ind.description,
        image: ind.image || `/images/project-fabrication.png`,
        capabilities: ind.capabilities ? (() => { try { return JSON.parse(ind.capabilities); } catch { return []; } })() : [],
        slug: ind.slug,
      }))
    : DEFAULT_INDUSTRIES;

  useGSAP(() => {
    // Header reveal
    gsap.fromTo('.ind-header-badge',
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.15,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%'
        }
      }
    );

    // Cards staggered reveal
    gsap.fromTo('.ind-card',
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1,
        scrollTrigger: {
          trigger: '.ind-grid',
          start: 'top 85%'
        }
      }
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} id="industries" className="section-padding bg-primary">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">
        <div className="max-w-3xl mb-20">
          <span className="ind-header-badge inline-block text-secondary text-sm font-heading tracking-widest uppercase mb-6 relative after:hidden md:after:block after:content-[''] after:absolute after:top-1/2 after:-right-12 after:w-8 after:h-[1px] after:bg-secondary/50">
            Markets We Serve
          </span>
          <TextReveal as="h1" splitType="char" className="text-4xl md:text-5xl lg:text-7xl font-heading font-light text-white tracking-tight">
            Industries
          </TextReveal>
        </div>

        <div className="ind-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-16 border-t border-white/5 pt-16">
          {industries.map((ind, index) => (
            <div key={index} className="ind-card group flex flex-col bg-white/[0.02] border border-white/5 rounded-lg overflow-hidden hover:border-white/20 transition-all duration-500 relative">
              {/* Tablet Glass Shimmer */}
              <div className="absolute inset-0 hidden md:block lg:hidden bg-gradient-to-b from-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />
              <div className="absolute inset-x-0 top-0 h-[1px] hidden md:block lg:hidden bg-gradient-to-r from-transparent via-accent/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20" />

              {/* Image */}
              <div className="relative h-48 sm:h-56 overflow-hidden bg-primary-light">
                <Image
                  src={ind.image}
                  alt={`${ind.title} industry`}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
                />
                {/* Mobile cinematic gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A09] via-black/40 to-transparent lg:hidden z-10" />
                
                {/* Category Badge */}
                <span className="absolute top-4 left-4 bg-primary/90 border border-white/10 text-white px-3 py-1 text-xs font-heading tracking-widest uppercase z-20 backdrop-blur-md shadow-lg">
                  {ind.id}
                </span>
              </div>

              {/* Details */}
              <div className="p-5 sm:p-6 flex flex-col flex-grow relative z-20">
                <h3 className="text-lg sm:text-xl font-heading font-light text-white mb-3 drop-shadow-md line-clamp-2">
                  {ind.title}
                </h3>
                <p className="text-secondary text-sm flex-grow leading-relaxed mb-4">
                  {ind.desc}
                </p>

                {/* Capability Tags */}
                <div className="flex flex-wrap gap-3 mb-6">
                  {ind.capabilities.map((capability, idx) => (
                    <span key={idx} className="px-3 py-1 text-xs font-heading tracking-widest uppercase bg-white/[0.03] border border-white/10 rounded">
                      {capability}
                    </span>
                  ))}
                </div>

                {/* Explore Button */}
                <Link href={`/industries/${ind.slug}`} className="self-start text-accent font-heading text-sm tracking-widest uppercase hover:text-white transition-colors duration-500 py-3 min-h-[44px] inline-flex items-center">
                  View {ind.title} Details
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View all industries link */}
        <div className="mt-12 flex justify-center">
          <Link
            href="/industries"
            className="group inline-flex items-center gap-3 px-8 py-3.5 border border-white/10 text-white/40 font-heading text-[11px] tracking-widest uppercase hover:border-white/25 hover:text-white transition-all duration-300"
          >
            All Industries
            <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Industries;