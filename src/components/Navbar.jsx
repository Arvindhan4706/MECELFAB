"use client";
import { useState, useRef, useEffect, useCallback } from 'react';
import { Menu, X, ArrowRight, Search, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import GlobalSearch from './GlobalSearch';

const DROPDOWN_MENUS = {
  services: {
    baseHref: '/services',
    items: [
      { name: 'Industrial Fabrication', href: '/services/industrial-fabrication' },
      { name: 'Industrial Erection', href: '/services/industrial-erection' },
      { name: 'Hydraulic & Pneumatic Overhauling', href: '/services/hydraulic-pneumatic-overhauling' },
      { name: 'Generator Spare Parts', href: '/services/generator-spare-parts' },
      { name: 'Generator Rental', href: '/services/generator-rental' },
      { name: 'Air Compressor Rental', href: '/services/air-compressor-rental' },
      { name: 'Turbocharger Services', href: '/services/turbocharger-services' },
      { name: 'Annual Maintenance Contract (AMC)', href: '/services/amc' },
    ],
  },
  industries: {
    baseHref: '/industries',
    items: [
      { name: 'Industrial Manufacturing', href: '/industries/industrial-manufacturing' },
      { name: 'Power & Energy', href: '/industries/power-energy' },
      { name: 'Industrial Maintenance', href: '/industries/industrial-maintenance' },
      { name: 'Commercial & Temporary Power', href: '/industries/commercial-power' },
    ],
  },
  equipment: {
    baseHref: '/equipment',
    items: [
      { name: 'Diesel Generators (20–2000 kVA)', href: '/equipment/diesel-generators' },
      { name: 'Silent Acoustic Generators', href: '/equipment/silent-generators' },
      { name: 'Industrial Air Compressors', href: '/equipment/industrial-air-compressors' },
      { name: 'Hydraulic Power Packs & Cylinders', href: '/equipment/hydraulic-power-packs' },
      { name: 'Heavy Rigging & Erection Cranes', href: '/equipment/rigging-cranes' },
      { name: 'View All Equipment Catalog', href: '/equipment' },
    ],
  },
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownTimeoutRef = useRef(null);
  const pathname = usePathname();
  const { data: session } = useSession();
  const navRef = useRef(null);
  const menuDrawerRef = useRef(null);

  const navLinks = [
    { name: 'Home', id: '' },
    { name: 'About', id: 'about' },
    { name: 'Services', id: 'services' },
    { name: 'Industries', id: 'industries' },
    { name: 'Equipment', id: 'equipment' },
    { name: 'Projects', id: 'projects' },
    { name: 'Resources', id: 'resources' },
    { name: 'Contact', id: 'contact' },
  ];

  useGSAP(() => {
    if (!navRef.current) return;

    // Entrance animation
    gsap.fromTo(navRef.current,
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.3 }
    );
  }, [isOpen]);

  const toggleMenu = useCallback(() => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    
    // Toggle body scroll (iOS-safe)
    if (nextState) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      // Animate menu in
      gsap.fromTo(menuDrawerRef.current,
        { yPercent: -100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
      );
      gsap.fromTo('.mobile-nav-link',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, delay: 0.3, ease: 'power3.out' }
      );
    } else {
      const scrollY = document.body.style.top ? parseInt(document.body.style.top, 10) * -1 : 0;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY || 0);
      // Animate menu out
      gsap.to(menuDrawerRef.current, {
        yPercent: -100, opacity: 0, duration: 0.5, ease: 'power3.in'
      });
    }
  }, [isOpen]);

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  // Hide-on-scroll-down / show-on-scroll-up matching Youthfest 2026
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 50);

      // Prevent small pixel jitters (like iOS scroll bounce) from rapidly toggling the navbar
      if (Math.abs(y - lastScrollY.current) > 10) {
        setHidden(y > lastScrollY.current && y > 100);
        if (y < lastScrollY.current || y <= 100) setHidden(false);
        lastScrollY.current = y;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Handle ESC key to close mobile menu
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        toggleMenu();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, toggleMenu]);

  // Global search shortcut (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleSearchShortcut = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleSearchShortcut);
    return () => window.removeEventListener('keydown', handleSearchShortcut);
  }, []);

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/auth') || pathname?.startsWith('/portal')) return null;

  const handleDropdownEnter = (id) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(id);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  return (
    <>
      {/* Invisible top hover trigger strip — reveals navbar when cursor hits top */}
      <div
        className="fixed top-0 left-0 w-full h-12 z-[99]"
        onMouseEnter={() => setHidden(false)}
      />

      <header
        ref={navRef}
        className={`fixed left-1/2 -translate-x-1/2 w-[95%] sm:w-[96%] max-w-[1600px] z-[100] transition-all duration-500 rounded-2xl sm:rounded-3xl ${
          hidden ? '-top-32 opacity-0 pointer-events-none' : 'top-3 sm:top-4 md:top-5 opacity-100'
        } ${
          scrolled || isOpen
            ? 'bg-[#0a0a0a]/75 border border-white/20 shadow-[0_16px_45px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-2xl backdrop-saturate-150 px-4 sm:px-6 md:px-8 py-1.5 sm:py-2'
            : 'bg-white/[0.04] border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-2xl backdrop-saturate-150 px-4 sm:px-6 md:px-8 py-1.5 sm:py-2'
        } ${isOpen ? 'lg:block hidden' : ''}`}
      >
        {/* Top ambient glass light sheen accent matching rounded curve */}
        <div className="absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none rounded-t-2xl sm:rounded-t-3xl" />
        {/* Bottom subtle edge glass ambient reflection */}
        <div className="absolute inset-x-6 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none rounded-b-2xl sm:rounded-b-3xl" />

        <div className="flex items-center justify-between w-full relative z-10">
          <Link 
            href="/" 
            onClick={() => isOpen && toggleMenu()} 
            className={`flex items-center gap-3 relative z-[101] -ml-2 sm:-ml-3 md:-ml-4 transition-opacity duration-300 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            {/* Desktop: full logo | Mobile: compact mark */}
            <span className="hidden sm:flex items-center overflow-hidden rounded-xl bg-black/40 backdrop-blur-md p-1 border border-white/10 shadow-sm">
              <Image
                src="/images/logo-full.jpeg"
                alt="MECELFAB Industrial Solutions"
                width={700}
                height={140}
                className="h-14 md:h-16 w-auto object-contain origin-left rounded-lg"
                priority
              />
            </span>
            <span className="block sm:hidden rounded-xl overflow-hidden bg-black/40 backdrop-blur-md p-1 border border-white/10 shadow-sm">
              <Image
                src="/images/logo-mark.jpeg"
                alt="MECELFAB"
                width={48}
                height={48}
                className="h-10 w-10 rounded-lg object-contain"
                priority
              />
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => {
              const hasDropdown = Boolean(DROPDOWN_MENUS[link.id]);
              const isDropdownOpen = activeDropdown === link.id;
              const isCurrentActive = pathname === `/${link.id}` || (link.id && pathname?.startsWith(`/${link.id}/`));

              if (hasDropdown) {
                const menuData = DROPDOWN_MENUS[link.id];
                return (
                  <div
                    key={link.id}
                    className="relative group py-2"
                    onMouseEnter={() => handleDropdownEnter(link.id)}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <Link
                      href={`/${link.id}`}
                      className="flex items-center gap-1.5 text-sm uppercase tracking-widest font-heading font-medium"
                      aria-expanded={isDropdownOpen}
                      aria-haspopup="true"
                    >
                      <span className={`transition-all duration-300 ${isCurrentActive ? 'text-white font-semibold' : 'text-white/55 hover:text-white'}`}>
                        {link.name}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-300 ease-out ${
                          isDropdownOpen
                            ? 'rotate-180 text-white'
                            : isCurrentActive
                            ? 'text-white/70'
                            : 'text-white/40 group-hover:text-white/70'
                        }`}
                      />
                    </Link>

                    {/* Active underline indicator */}
                    <span className={`absolute bottom-0 left-0 w-full h-[1.5px] bg-white/70 transform origin-left transition-transform duration-300 ${isCurrentActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>

                    {/* Dropdown Menu Container */}
                    <div
                      className={`absolute left-1/2 -translate-x-1/2 top-full pt-2 w-64 sm:w-72 transition-all duration-250 ease-out z-50 ${
                        isDropdownOpen
                          ? 'opacity-100 translate-y-0 pointer-events-auto visible'
                          : 'opacity-0 translate-y-1 pointer-events-none invisible'
                      }`}
                    >
                      <div className="rounded-2xl bg-[#0a0a0a]/85 backdrop-blur-2xl backdrop-saturate-150 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.15)] p-1.5 overflow-hidden">
                        <div className="flex flex-col py-1">
                          {menuData.items.map((item) => {
                            const isItemActive = pathname === item.href;
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setActiveDropdown(null)}
                                className={`px-3.5 py-2.5 rounded-lg text-xs font-heading tracking-wider uppercase transition-all duration-200 flex items-center justify-between ${
                                  isItemActive
                                    ? 'bg-white/10 text-white font-semibold pl-4'
                                    : 'text-white/60 hover:text-white hover:bg-white/5 hover:pl-4'
                                }`}
                              >
                                <span>{item.name}</span>
                                {isItemActive && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={link.id}
                  href={`/${link.id}`}
                  className="relative group text-sm uppercase tracking-widest font-heading font-medium py-2"
                >
                  <span className={`transition-all duration-300 ${pathname === `/${link.id}` || (link.id && pathname?.startsWith(`/${link.id}/`)) ? 'text-white font-semibold' : 'text-white/55 hover:text-white'}`}>
                    {link.name}
                  </span>
                  <span className={`absolute bottom-0 left-0 w-full h-[1.5px] bg-white/70 transform origin-left transition-transform duration-300 ${pathname === `/${link.id}` || (link.id && pathname?.startsWith(`/${link.id}/`)) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                </Link>
              );
            })}

            <div className="w-[1px] h-4 bg-white/15 mx-1" />

            {!session ? (
              <>
                <Link
                  href="/auth/login"
                  className="text-xs uppercase tracking-widest text-white/55 hover:text-white transition-colors duration-300"
                >
                  Login
                </Link>
                <Link
                  href="/contact"
                  className="group relative inline-flex items-center p-1 pl-1 pr-4 sm:pr-4.5 bg-white/90 hover:bg-white text-black/90 border border-white/30 rounded-full font-heading text-xs sm:text-[13px] tracking-wider uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.25)] overflow-hidden select-none backdrop-blur-sm -mr-1 sm:-mr-2 md:-mr-3 ml-2"
                >
                  <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/80 text-white/90 transition-all duration-300 ease-out group-hover:w-8 sm:group-hover:w-8.5">
                    <ArrowRight size={12} className="transition-transform duration-300 ease-out group-hover:translate-x-1 text-white/90" />
                  </span>
                  <span className="ml-2 sm:ml-2.5 font-bold whitespace-nowrap text-black/90 group-hover:text-black transition-colors">
                    REQUEST RFQ
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/contact"
                  className="group relative inline-flex items-center p-1 pl-1 pr-4 sm:pr-4.5 bg-white/90 hover:bg-white text-black/90 border border-white/30 rounded-full font-heading text-xs sm:text-[13px] tracking-wider uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.25)] overflow-hidden select-none backdrop-blur-sm -mr-1 sm:-mr-2 md:-mr-3 ml-2"
                >
                  <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/80 text-white/90 transition-all duration-300 ease-out group-hover:w-8 sm:group-hover:w-8.5">
                    <ArrowRight size={12} className="transition-transform duration-300 ease-out group-hover:translate-x-1 text-white/90" />
                  </span>
                  <span className="ml-2 sm:ml-2.5 font-bold whitespace-nowrap text-black/90 group-hover:text-black transition-colors">
                    REQUEST RFQ
                  </span>
                </Link>
                <Link
                  href={session.user?.role === 'CUSTOMER' ? '/portal' : '/admin/dashboard'}
                  className="inline-flex items-center gap-2 px-4 py-1.5 border border-white/15 text-white/70 font-heading text-[11px] tracking-widest uppercase hover:text-white hover:bg-white/10 transition-colors duration-300 rounded-full"
                >
                  Dashboard
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center relative z-[101]">
            <button
              onClick={toggleMenu}
              className={`text-white hover:text-white/70 transition-colors p-2.5 -mr-2 flex items-center justify-center min-h-[44px] min-w-[44px] ${isOpen ? 'hidden' : ''}`}
              aria-label="Open navigation menu"
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              <Menu size={26} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen Mobile Menu Drawer */}
      <div
        ref={menuDrawerRef}
        id="mobile-menu"
        className="fixed inset-0 bg-black z-[90] flex flex-col px-6 sm:px-8 pb-10 lg:hidden"
        style={{ display: isOpen ? 'flex' : 'none', pointerEvents: isOpen ? 'auto' : 'none' }}
      >
        {/* Close button at top */}
        <div className="flex justify-end pt-[max(1rem,env(safe-area-inset-top))]">
          <button
            onClick={toggleMenu}
            className="text-white hover:text-white/70 transition-colors p-3 flex items-center justify-center min-h-[44px] min-w-[44px]"
            aria-label="Close navigation menu"
          >
            <X size={28} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-sm mx-auto overflow-y-auto flex-1 pt-4 pb-8" style={{ paddingBottom: 'max(2rem, calc(2rem + env(safe-area-inset-bottom)))' }}>
          {/* Mobile Drawer Search Bar */}
          <button
            onClick={() => {
              toggleMenu();
              setIsSearchOpen(true);
            }}
            className="mobile-nav-link flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/50 text-sm font-light mb-2 min-h-[44px]"
            aria-label="Open search dialog"
          >
            <span className="flex items-center gap-2.5">
              <Search size={16} />
              <span>Search equipment & services...</span>
            </span>
            <kbd className="px-2 py-0.5 text-[10px] bg-white/10 text-white/40 rounded border border-white/10">Search</kbd>
          </button>

          {navLinks.map((link, index) => (
            <Link
              key={link.id}
              href={`/${link.id}`}
              onClick={() => toggleMenu()}
              className="mobile-nav-link group flex items-baseline gap-3 text-white font-heading font-light text-2xl md:text-3xl tracking-wider uppercase border-b border-white/10 pb-3 pl-4 border-l-2 border-l-transparent hover:border-l-accent hover:pl-6 hover:text-white/90 transition-all duration-300"
            >
              <span className="text-sm text-white/30 font-medium mt-1 transition-colors duration-300 group-hover:text-accent/60">
                {String(index + 1).padStart(2, '0')}
              </span>
              {link.name}
            </Link>
          ))}
          
          {!session ? (
            <>
              <Link
                href="/auth/login"
                onClick={() => toggleMenu()}
                className="mobile-nav-link mt-4 flex w-full items-center justify-between px-6 py-4 border border-white/15 text-white font-heading font-light text-sm tracking-widest uppercase min-h-[44px] hover:border-white/30 transition-all"
              >
                Login <ArrowRight size={16} />
              </Link>
              <Link
                href="/contact"
                onClick={() => toggleMenu()}
                className="mobile-nav-link flex w-full items-center justify-between px-6 py-5 bg-white text-black font-heading font-medium text-sm tracking-widest uppercase min-h-[44px]"
              >
                REQUEST RFQ
                <ArrowRight size={18} />
              </Link>
            </>
          ) : (
            <Link
              href={session.user?.role === 'CUSTOMER' ? '/portal' : '/admin/dashboard'}
              onClick={() => toggleMenu()}
              className="mobile-nav-link mt-8 flex w-full items-center justify-between px-6 py-5 bg-white text-black font-heading font-medium text-sm tracking-widest uppercase min-h-[44px]"
            >
              Dashboard <ArrowRight size={18} />
            </Link>
          )}

          <div className="mobile-nav-link mt-4 pt-6 border-t border-white/10 flex flex-col gap-1.5 opacity-60">
            <span className="text-white text-[11px] font-heading tracking-[0.25em] uppercase">MECELFAB Industrial Solutions</span>
            <span className="text-white/50 text-[11px] font-heading tracking-[0.2em] uppercase italic">            Precision Fabrication & Erection</span>
          </div>
        </div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;
