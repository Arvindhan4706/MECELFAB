"use client";
import { ArrowUp, Phone, Mail, ChevronRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const Footer = ({ contact }) => {
  const pathname = usePathname();

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/auth') || pathname?.startsWith('/portal')) return null;

  return (
    <footer className="bg-primary/95 backdrop-blur-xl pt-14 pb-10 relative rounded-t-3xl sm:rounded-t-[40px] border-t border-white/10 shadow-[0_-15px_40px_rgba(0,0,0,0.6)] overflow-hidden">
      {/* Smooth top edge light blend & soft ambient glow */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-accent/5 blur-2xl pointer-events-none" />

      <div className="container px-4 sm:px-6 md:px-8 mx-auto relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-12 mb-12 md:mb-16">
          {/* Brand Info & Contact Points */}
          <div className="lg:pr-4">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/images/logo-dark-mode.png"
                alt="MECELFAB Industrial Solutions"
                width={500}
                height={166}
                className="h-14 sm:h-16 w-auto object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] transition-transform duration-300 hover:scale-[1.02]"
              />
            </Link>
            <p className="text-base sm:text-lg text-white/90 font-light leading-relaxed mb-6">
              Engineering reliable solutions for industrial growth. Serving fabrication, erection, power distribution, and heavy industrial utility setups across Tamil Nadu and South India.
            </p>

            {/* Contact Points */}
            <div className="flex flex-col gap-3.5 pt-5 mb-6 border-t border-white/10 text-sm">
              {/* Phone */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-accent shrink-0 mt-0.5">
                  <Phone size={14} />
                </div>
                <div>
                  <span className="text-[11px] font-heading uppercase tracking-wider text-secondary block mb-0.5">Phone</span>
                  <div className="flex items-center gap-2 flex-wrap text-white/90 font-light">
                    <a href="tel:+919840620571" className="hover:text-accent transition-colors">
                      +91 9840620571
                    </a>
                    <span className="text-white/30">•</span>
                    <a href="tel:+919444067012" className="hover:text-accent transition-colors">
                      +91 9444067012
                    </a>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-accent shrink-0 mt-0.5">
                  <Mail size={14} />
                </div>
                <div>
                  <span className="text-[11px] font-heading uppercase tracking-wider text-secondary block mb-0.5">Email</span>
                  <a
                    href={`mailto:${contact?.email || 'mecelfab@gmail.com'}`}
                    className="text-white/90 font-light hover:text-accent transition-colors break-all block"
                  >
                    {contact?.email || 'mecelfab@gmail.com'}
                  </a>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div>
                  <span className="text-[11px] font-heading uppercase tracking-wider text-secondary block mb-0.5">WhatsApp</span>
                  <a
                    href={`https://wa.me/${(contact?.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello MECELFAB, I have an industrial service requirement.')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-white/90 font-light hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>WhatsApp Inquiries</span>
                    <span className="text-xs text-emerald-400">↗</span>
                  </a>
                </div>
              </div>
            </div>

            {(contact?.linkedin || contact?.twitter) ? (
              <div className="flex gap-3 pt-2">
                {contact?.linkedin && (
                  <a
                    href={contact.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="LinkedIn"
                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-secondary hover:bg-white hover:text-primary transition-colors duration-300"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                  </a>
                )}
                {contact?.twitter && (
                  <a
                    href={contact.twitter}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Twitter / X"
                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-secondary hover:bg-white hover:text-primary transition-colors duration-300"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                  </a>
                )}
              </div>
            ) : null}
          </div>

          {/* Combined Navigation & Services - Pill Strip on Mobile, Columns on Desktop */}
          <div className="sm:hidden col-span-1 pt-6 border-t border-white/5">
            <h4 className="text-white text-xs font-heading tracking-widest uppercase mb-4 text-secondary">
              Quick Navigation
            </h4>
            <div className="flex flex-wrap gap-2">
              <Link href="/about" className="px-3.5 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-heading tracking-wider uppercase text-secondary hover:text-white transition-colors">About</Link>
              <Link href="/services" className="px-3.5 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-heading tracking-wider uppercase text-secondary hover:text-white transition-colors">Services</Link>
              <Link href="/industries" className="px-3.5 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-heading tracking-wider uppercase text-secondary hover:text-white transition-colors">Industries</Link>
              <Link href="/projects" className="px-3.5 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-heading tracking-wider uppercase text-secondary hover:text-white transition-colors">Projects</Link>
              <Link href="/equipment" className="px-3.5 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-heading tracking-wider uppercase text-secondary hover:text-white transition-colors">Equipment</Link>
              <Link href="/contact" className="px-3.5 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-heading tracking-wider uppercase text-secondary hover:text-white transition-colors">Contact</Link>
            </div>
          </div>

          {/* Quick Links (Hidden on Mobile) */}
          <div className="hidden sm:block">
            <h4 className="text-white text-xs font-heading tracking-widest uppercase mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Navigation
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm font-light">
              {[
                { href: '/about', label: 'About Company' },
                { href: '/services', label: 'Core Services' },
                { href: '/industries', label: 'Industries We Serve' },
                { href: '/projects', label: 'Featured Projects' },
                { href: '/equipment', label: 'Equipment Catalog' },
                { href: '/contact', label: 'Contact Us' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-secondary hover:text-white transition-all duration-300 inline-flex items-center gap-1.5 group py-0.5"
                  >
                    <ChevronRight size={12} className="text-accent/40 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Industry Services (Hidden on Mobile) */}
          <div className="hidden sm:block">
            <h4 className="text-white text-xs font-heading tracking-widest uppercase mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Services
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm font-light">
              {[
                { href: '/services/industrial-fabrication', label: 'Industrial Fabrication' },
                { href: '/services/industrial-erection', label: 'Industrial Erection' },
                { href: '/services/hydraulic-pneumatic-overhauling', label: 'Hydraulic Systems' },
                { href: '/services/generator-rental', label: 'Generator Rental' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-secondary hover:text-white transition-all duration-300 inline-flex items-center gap-1.5 group py-0.5"
                  >
                    <ChevronRight size={12} className="text-accent/40 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Standards & Certifications */}
          <div>
            <h4 className="text-white text-xs font-heading tracking-widest uppercase mb-6 flex items-center gap-2">
              <ShieldCheck size={15} className="text-accent" />
              Regulatory
            </h4>
            <div className="space-y-4 text-sm font-light">
              <div className="border-l-2 border-accent/60 pl-3.5">
                <div className="text-white font-medium text-sm">ISO 9001:2015</div>
                <div className="text-secondary text-xs mt-0.5">Quality Management System</div>
              </div>
              <div className="border-l-2 border-accent/60 pl-3.5">
                <div className="text-white font-medium text-sm">ISO 45001:2018</div>
                <div className="text-secondary text-xs mt-0.5">Occupational Health & Safety</div>
              </div>
              <p className="text-xs text-secondary/70 pt-2 border-t border-white/5 leading-relaxed">
                Industrial fabrication, erection & power setups compliant with statutory quality standards.
              </p>
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
            className="md:absolute md:right-0 md:top-8 w-[44px] h-[44px] shrink-0 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-accent hover:border-accent hover:text-white hover:shadow-lg hover:shadow-accent/30 transition-all duration-300"
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

