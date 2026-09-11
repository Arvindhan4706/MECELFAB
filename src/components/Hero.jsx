"use client";
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

const Hero = ({ content }) => {
  const containerRef = useRef(null);
  const bgRef = useRef(null);

  // ─── GSAP intro + parallax ────────────────────────────────────
  useGSAP(() => {
    const tl = gsap.timeline({ delay: 0.05 });

    // Background image — slow zoom in from scale 1.1
    tl.fromTo(bgRef.current,
      { scale: 1.12, opacity: 0 },
      { scale: 1, opacity: 1, duration: 2.8, ease: 'power2.out' },
      0
    );

    // Top strip — slide in from top
    tl.fromTo('.hero-topstrip',
      { y: -40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' },
      0.4
    );

    // MECELFAB — reveal each letter from below clip
    tl.fromTo('.hero-wordmark',
      { y: '110%' },
      { y: '0%', duration: 1.4, ease: 'power4.out' },
      0.55
    );

    // Tagline — slide up
    tl.fromTo('.hero-tagline',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },
      1.1
    );

    // Description paragraph
    tl.fromTo('.hero-desc',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' },
      1.35
    );

    // Horizontal rule
    tl.fromTo('.hero-rule',
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 1, duration: 1, ease: 'power3.out', transformOrigin: 'left' },
      1.5
    );

    // CTAs
    tl.fromTo('.hero-cta-btn',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out' },
      1.6
    );

    // Pillars
    tl.fromTo('.hero-stat',
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out' },
      1.75
    );

    // Bottom strip
    tl.fromTo('.hero-bottomstrip',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
      1.9
    );



    // Parallax on scroll — disabled on mobile (< 768px)
    if (window.matchMedia('(min-width: 768px)').matches) {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom top',
        animation: gsap.to(bgRef.current, { y: '22%', ease: 'none' }),
        scrub: true,
      });
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom top',
        animation: gsap.to('.hero-outline-text', { y: '-8%', ease: 'none' }),
        scrub: 1.5,
      });
    }

  }, { scope: containerRef });

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden bg-black"
      aria-label="MECELFAB Factory Entrance"
    >
      {/* ─── Background ──────────────────────────────────────────── */}
      <div ref={bgRef} className="absolute inset-0 z-0 will-change-transform opacity-0">
        <Image
          src="/images/hero-bg.png"
          alt="MECELFAB Industrial Operations"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* dark gradient: heavy left, lighter right */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30" />
        {/* bottom fade for clean transition */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/25" />
      </div>

      {/* ─── Decorative giant outline watermark ──────────────────── */}
      <div className="hero-outline-text absolute inset-0 z-[1] flex items-center justify-center pointer-events-none overflow-hidden select-none">
        <span
          className="text-white font-heading font-bold uppercase tracking-tighter whitespace-nowrap"
          style={{
            fontSize: 'clamp(3.5rem, 14vw, 12rem)',
            WebkitTextStroke: '1px rgba(255,255,255,0.03)',
            color: 'transparent',
            lineHeight: 0.88,
          }}
        >
          MECELFAB
        </span>
      </div>

      {/* ─── Top strip ───────────────────────────────────────────── */}
      <div className="hero-topstrip relative z-10 flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-16 pt-28 opacity-0">
        <div className="flex items-center gap-3">
          <div className="w-5 h-[1px] bg-white/40" />
          <span className="text-white/40 text-[11px] font-heading tracking-[0.35em] uppercase">
            Est. India
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <span className="text-white/30 text-[10px] font-heading tracking-[0.25em] uppercase">ISO 9001:2015</span>
          <div className="w-[1px] h-3 bg-white/20" />
          <span className="text-white/30 text-[10px] font-heading tracking-[0.25em] uppercase">ISO 45001:2018</span>
        </div>
      </div>

      {/* ─── Main content ─────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-16 py-16">

        {/* Mobile ISO Badge */}
        <div className="md:hidden flex items-center justify-center mb-6 opacity-0 hero-tagline">
          <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/60 text-[11px] font-heading tracking-[0.25em] uppercase backdrop-blur-sm shadow-[0_0_15px_rgba(255,255,255,0.02)]">
            ISO 9001 Certified · Made in India
          </span>
        </div>

        {/* Company name — the hero wordmark */}
        <div className="overflow-hidden mb-3 md:border-l-[3px] md:border-accent/80 md:pl-6 md:-ml-[27px] flex flex-col items-center md:items-start text-center md:text-left relative">
          <h1
            className="hero-wordmark font-heading font-bold text-white leading-none tracking-tighter uppercase w-full"
            style={{ fontSize: 'clamp(3.5rem, 14vw, 12rem)', lineHeight: 0.88 }}
          >
            {content?.heroTitle?.split(' ')[0] || 'MECELFAB'}
          </h1>
          <div className="w-32 h-[2px] bg-gradient-to-r from-accent/0 via-accent to-accent/0 mt-6 md:hidden opacity-0 hero-tagline"></div>
        </div>

        {/* Full legal name + tagline */}
        <div className="hero-tagline flex flex-col md:flex-row items-center md:items-baseline gap-2 md:gap-x-4 mb-8 opacity-0 text-center md:text-left mt-5 md:mt-0">
          <span className="text-white/40 text-xs md:text-sm font-heading tracking-[0.25em] uppercase">
            {content?.heroTitle?.substring(content.heroTitle.indexOf(' ') + 1) || 'Industrial Solutions Pvt. Ltd.'}
          </span>
          <div className="w-[1px] h-3 bg-white/20 hidden md:block" />
          <span className="text-white/60 text-xs md:text-sm font-heading tracking-[0.2em] uppercase italic">
            Precision Fabrication & Erection
          </span>
        </div>

        {/* Description */}
        <p className="hero-desc text-white/55 text-sm sm:text-base md:text-lg font-light leading-relaxed max-w-xl mb-10 opacity-0 text-center md:text-left mx-auto md:mx-0">
          {content?.heroDescription || 'Industrial erection, heavy fabrication, generator services, hydraulic & pneumatic overhauling, AMC, and equipment rental — executed to documented procedures and safety standards.'}
        </p>

        {/* Horizontal rule */}
        <div className="hero-rule w-full max-w-2xl h-[1px] bg-gradient-to-r from-white/25 to-transparent mb-10 opacity-0 hidden md:block" />

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 md:gap-5 mb-16 mx-auto md:mx-0 w-full max-w-sm sm:max-w-none">

          {/* Primary — REQUEST RFQ */}
          <Link
            href="/contact"
            className="hero-cta-btn group relative inline-flex w-full sm:w-auto items-center justify-center gap-4 overflow-hidden opacity-0"
            style={{ textDecoration: 'none' }}
          >
            <span className="relative z-10 flex w-full justify-center items-center gap-4 px-8 py-4 bg-white text-black font-heading font-semibold text-xs md:text-sm tracking-[0.18em] uppercase transition-all duration-500 group-hover:bg-transparent group-hover:text-white border border-white">
              {/* shimmer sweep on hover */}
              <span
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                }}
              />
              <span className="relative">{content?.heroCta || 'REQUEST RFQ'}</span>
              <span className="relative flex items-center justify-center w-6 h-6 rounded-full bg-black/10 group-hover:bg-white/10 transition-colors duration-300">
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform duration-300" />
              </span>
            </span>
          </Link>

          {/* Secondary — Our Services */}
          <Link
            href="/services"
            className="hero-cta-btn group relative inline-flex w-full sm:w-auto items-center justify-center gap-4 opacity-0"
            style={{ textDecoration: 'none' }}
          >
            {/* animated border glow */}
            <span
              className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.08)' }}
            />
            <span className="relative z-10 flex w-full justify-center items-center gap-4 px-8 py-4 border border-white/20 text-white/60 font-heading text-xs md:text-sm tracking-[0.18em] uppercase group-hover:border-white/40 group-hover:text-white transition-all duration-300">
              <span>{content?.secondaryCta || 'Our Services'}</span>
              <span className="relative flex items-center justify-center w-6 h-6 border border-white/20 group-hover:border-white/50 transition-colors duration-300 rounded-sm">
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform duration-300" />
              </span>
            </span>
          </Link>

        </div>

        {/* Service pillars */}
        <div className="hero-stat-container overflow-x-auto md:overflow-visible pb-6 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 touch-pan-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className="flex md:flex-wrap items-start gap-8 md:gap-14 min-w-max md:min-w-0">
            {[
              { label: '8 Service Lines', sub: 'Fabrication to Commissioning' },
              { label: 'Pan-India Deployment', sub: 'Site-to-Site Mobilization' },
              { label: 'ISO 9001:2015', sub: 'Audited QMS' },
              { label: 'Safety-First', sub: 'Zero LTI Target' },
            ].map(({ label, sub }) => (
              <div key={label} className="hero-stat flex flex-col gap-1.5 opacity-0 pr-8 md:pr-0 border-r border-white/10 md:border-r-0 last:border-r-0">
                <div className="text-[15px] sm:text-base md:text-lg font-heading font-light text-white tracking-tight whitespace-nowrap md:whitespace-normal">
                  {label}
                </div>
                <div className="text-[9px] md:text-[10px] text-white/40 font-heading tracking-[0.25em] uppercase whitespace-nowrap md:whitespace-normal">
                  {sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Bottom strip ─────────────────────────────────────────── */}
      <div className="hero-bottomstrip relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 md:px-8 lg:px-16 pb-10 opacity-0 overflow-hidden gap-4 sm:gap-0">
        {/* Service tags */}
        <div className="flex flex-wrap md:flex-nowrap items-center gap-x-3 gap-y-2 md:gap-5 text-[11px] md:text-xs text-white/40 md:text-white/55 font-heading tracking-[0.15em] md:tracking-[0.18em] uppercase">
          {['Fabrication', 'Erection', 'Generator Services', 'Hydraulic Systems', 'AMC', 'Rentals', 'Turbocharger'].map((s) => (
            <span key={s} className="flex items-center">
              {s}
            </span>
          ))}
        </div>
        {/* Contact quick links */}
        <div className="flex items-center gap-4 text-[11px] md:text-xs font-heading tracking-[0.15em] uppercase shrink-0">
          {content?.phone && (
            <a href={`tel:${content.phone.replace(/[^0-9+]/g, '')}`} className="text-white/40 hover:text-white transition-colors duration-300 py-2 min-h-[44px] flex items-center">
              Call Us
            </a>
          )}
          {content?.email && (
            <a href={`mailto:${content.email}`} className="text-white/40 hover:text-white transition-colors duration-300 py-2 min-h-[44px] flex items-center">
              Email
            </a>
          )}
          {content?.phone && (
            <a
              href={`https://wa.me/${content.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello MECELFAB, I have an industrial service requirement.')}`}
              target="_blank"
              rel="noreferrer"
              className="text-white/40 hover:text-white transition-colors duration-300 py-2 min-h-[44px] flex items-center"
            >
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
