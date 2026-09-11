"use client";
import { ArrowUp } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Footer = ({ contact }) => {
  const pathname = usePathname();

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/auth') || pathname?.startsWith('/portal')) return null;

  return (
    <footer className="bg-primary pt-24 pb-8 relative">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      <div className="container px-4 sm:px-6 md:px-8 mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-12 mb-12 md:mb-16">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="font-heading font-light tracking-widest text-2xl text-white uppercase">
                MECELFAB
              </span>
            </div>
            <p className="text-sm text-secondary font-light leading-relaxed mb-6">
              Engineering reliable solutions for industrial growth. Serving fabrication, erection, power distribution, and heavy industrial utility setups across India.
            </p>

            {/* Contact CTAs */}
            <div className="flex flex-col gap-1 mb-6">
              {contact?.phone && (
                <a href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`} className="text-secondary text-xs font-light hover:text-white transition-colors duration-300 py-2 min-h-[44px] inline-flex items-center">
                  {contact.phone}
                </a>
              )}
              {contact?.email && (
                <a href={`mailto:${contact.email}`} className="text-secondary text-xs font-light hover:text-white transition-colors duration-300 py-2 min-h-[44px] inline-flex items-center">
                  {contact.email}
                </a>
              )}
              {contact?.phone && (
                <a
                  href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello MECELFAB, I have an industrial service requirement.')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-secondary text-xs font-light hover:text-white transition-colors duration-300 py-2 min-h-[44px] inline-flex items-center"
                >
                  WhatsApp
                </a>
              )}
            </div>

            {(contact?.linkedin || contact?.twitter) ? (
              <div className="flex gap-4">
                {contact?.linkedin && (
                  <a
                    href={contact.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="LinkedIn"
                    className="w-[44px] h-[44px] rounded-full bg-white/5 flex items-center justify-center text-secondary hover:bg-white hover:text-primary transition-colors duration-300"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                  </a>
                )}
                {contact?.twitter && (
                  <a
                    href={contact.twitter}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Twitter / X"
                    className="w-[44px] h-[44px] rounded-full bg-white/5 flex items-center justify-center text-secondary hover:bg-white hover:text-primary transition-colors duration-300"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                  </a>
                )}
              </div>
            ) : null}
          </div>

          {/* Combined Navigation & Services - Pill Strip on Mobile, Columns on Desktop */}
          <div className="sm:hidden col-span-1 pt-6 border-t border-white/5">
            <h4 className="text-white text-sm font-heading tracking-widest uppercase mb-6">
              Explore
            </h4>
            <div className="flex flex-wrap gap-2">
              <Link href="/about" className="px-4 py-2.5 min-h-[44px] flex items-center bg-white/5 border border-white/10 rounded-full text-xs font-heading tracking-widest uppercase text-secondary hover:text-white transition-colors">About</Link>
              <Link href="/services" className="px-4 py-2.5 min-h-[44px] flex items-center bg-white/5 border border-white/10 rounded-full text-xs font-heading tracking-widest uppercase text-secondary hover:text-white transition-colors">Services</Link>
              <Link href="/industries" className="px-4 py-2.5 min-h-[44px] flex items-center bg-white/5 border border-white/10 rounded-full text-xs font-heading tracking-widest uppercase text-secondary hover:text-white transition-colors">Industries</Link>
              <Link href="/projects" className="px-4 py-2.5 min-h-[44px] flex items-center bg-white/5 border border-white/10 rounded-full text-xs font-heading tracking-widest uppercase text-secondary hover:text-white transition-colors">Projects</Link>
              <Link href="/resources" className="px-4 py-2.5 min-h-[44px] flex items-center bg-white/5 border border-white/10 rounded-full text-xs font-heading tracking-widest uppercase text-secondary hover:text-white transition-colors">Resources</Link>
              <Link href="/equipment" className="px-4 py-2.5 min-h-[44px] flex items-center bg-white/5 border border-white/10 rounded-full text-xs font-heading tracking-widest uppercase text-secondary hover:text-white transition-colors">Equipment</Link>
              <Link href="/contact" className="px-4 py-2.5 min-h-[44px] flex items-center bg-white/5 border border-white/10 rounded-full text-xs font-heading tracking-widest uppercase text-secondary hover:text-white transition-colors">Contact</Link>
            </div>
          </div>

          {/* Quick Links (Hidden on Mobile) */}
          <div className="hidden sm:block">
            <h4 className="text-white text-sm font-heading tracking-widest uppercase mb-6">
              Navigation
            </h4>
            <ul className="flex flex-col gap-3 text-sm font-light">
              <li>
                <Link href="/about" className="text-secondary hover:text-white transition-colors duration-300">
                  About Company
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-secondary hover:text-white transition-colors duration-300">
                  Core Services
                </Link>
              </li>
              <li>
                <Link href="/industries" className="text-secondary hover:text-white transition-colors duration-300">
                  Industries We Serve
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-secondary hover:text-white transition-colors duration-300">
                  Featured Projects
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-secondary hover:text-white transition-colors duration-300">
                  Resources
                </Link>
              </li>
              <li>
                <Link href="/equipment" className="text-secondary hover:text-white transition-colors duration-300">
                  Equipment Catalog
                </Link>
              </li>
            </ul>
          </div>

          {/* Industry Services (Hidden on Mobile) */}
          <div className="hidden sm:block">
            <h4 className="text-white text-sm font-heading tracking-widest uppercase mb-6">
              Services
            </h4>
            <ul className="flex flex-col gap-3 text-sm font-light">
              <li>
                <Link href="/services/industrial-fabrication" className="text-secondary hover:text-white transition-colors duration-300">
                  Industrial Fabrication
                </Link>
              </li>
              <li>
                <Link href="/services/industrial-erection" className="text-secondary hover:text-white transition-colors duration-300">
                  Industrial Erection
                </Link>
              </li>
              <li>
                <Link href="/services/hydraulic-pneumatic-overhauling" className="text-secondary hover:text-white transition-colors duration-300">
                  Hydraulic Systems
                </Link>
              </li>
              <li>
                <Link href="/services/generator-rental" className="text-secondary hover:text-white transition-colors duration-300">
                  Generator Rental
                </Link>
              </li>
            </ul>
          </div>

          {/* Certifications */}
          <div>
            <h4 className="text-white text-sm font-heading tracking-widest uppercase mb-6">
              Regulatory
            </h4>
            <div className="flex flex-col gap-4 text-xs font-light">
              <div className="px-4 py-3 bg-white/5 border border-white/10 rounded">
                <div className="text-white font-medium tracking-wide mb-1">ISO 9001:2015</div>
                <div className="text-secondary">Quality Management Certified</div>
              </div>
              <div className="px-4 py-3 bg-white/5 border border-white/10 rounded">
                <div className="text-white font-medium tracking-wide mb-1">ISO 45001:2018</div>
                <div className="text-secondary">Occupational Health & Safety</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col items-center justify-center gap-6 text-xs text-secondary font-light text-center break-words w-full relative">
          <div className="leading-relaxed break-words">
            &copy; {new Date().getFullYear()} {contact?.legalName || contact?.companyName || 'MECELFAB INDUSTRIAL SOLUTIONS PRIVATE LIMITED'}. All rights reserved.
          </div>
          <button
            onClick={handleScrollToTop}
            className="md:absolute md:right-0 md:top-8 w-[44px] h-[44px] shrink-0 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white hover:text-primary transition-colors duration-300"
            aria-label="Scroll to top"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

