"use client";
import { useState, useRef, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
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
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.5 }
    );

    // Scroll effect
    ScrollTrigger.create({
      start: 'top -50',
      end: 99999,
      onEnter: () => {
        if (navRef.current && !isOpen) {
          navRef.current.classList.add('bg-black/90', 'backdrop-blur-xl', 'border-b', 'border-white/5');
          gsap.to(navRef.current, { paddingTop: '1rem', paddingBottom: '1rem', duration: 0.5, ease: 'power2.out' });
        }
      },
      onLeaveBack: () => {
        if (navRef.current && !isOpen) {
          navRef.current.classList.remove('bg-black/90', 'backdrop-blur-xl', 'border-b', 'border-white/5');
          gsap.to(navRef.current, { paddingTop: '1.5rem', paddingBottom: '1.5rem', duration: 0.5, ease: 'power2.out' });
        }
      }
    });
  }, [isOpen]);

  const toggleMenu = () => {
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
  };

  // Handle ESC key to close mobile menu
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        toggleMenu();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/auth') || pathname?.startsWith('/portal')) return null;

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 pt-[max(1rem,env(safe-area-inset-top))] pb-4 md:pb-6 ${isOpen ? 'lg:block hidden' : ''}`}
      >
        <div className="container flex items-center justify-between mx-auto px-4 sm:px-6 md:px-8">
          <Link 
            href="/" 
            onClick={() => isOpen && toggleMenu()} 
            className={`flex items-center gap-3 relative z-[101] transition-opacity duration-300 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            <span className="font-heading font-light tracking-widest text-lg sm:text-xl md:text-2xl text-white uppercase">
              MECELFAB
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={`/${link.id}`}
                className="relative group text-sm uppercase tracking-widest"
              >
                <span className={`transition-colors duration-300 ${pathname === `/${link.id}` || (link.id && pathname?.startsWith(`/${link.id}/`)) ? 'text-white' : 'text-white/60 hover:text-white'}`}>
                  {link.name}
                </span>
                <span className={`absolute -bottom-2 left-0 w-full h-[1px] bg-white transform origin-left transition-transform duration-300 ${pathname === `/${link.id}` || (link.id && pathname?.startsWith(`/${link.id}/`)) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
              </Link>
            ))}
            
            <div className="w-[1px] h-4 bg-white/20 mx-2" />

            {!session ? (
              <>
                <Link
                  href="/auth/login"
                  className="text-xs uppercase tracking-widest text-white/60 hover:text-white transition-colors duration-300"
                >
                  Login
                </Link>
                <Link
                  href="/contact"
                  className="ml-4 inline-flex items-center gap-2 px-6 py-2.5 bg-white text-black font-heading text-xs tracking-widest uppercase hover:bg-white/90 transition-colors"
                >
                  REQUEST RFQ
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/contact"
                  className="ml-2 inline-flex items-center gap-2 px-6 py-2.5 bg-white text-black font-heading text-xs tracking-widest uppercase hover:bg-white/90 transition-colors"
                >
                  REQUEST RFQ
                </Link>
                <Link
                  href={session.user?.role === 'CUSTOMER' ? '/portal' : '/admin/dashboard'}
                  className="inline-flex items-center gap-2 px-6 py-2.5 border border-white/20 text-white font-heading text-xs tracking-widest uppercase hover:bg-white/10 transition-colors duration-300"
                >
                  Dashboard
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle — hidden when menu is open (close button is in drawer) */}
          <button
            onClick={toggleMenu}
            className={`lg:hidden relative z-[101] text-white hover:text-white/70 transition-colors p-3 -mr-3 flex items-center justify-center min-h-[44px] min-w-[44px] ${isOpen ? 'hidden' : ''}`}
            aria-label="Open navigation menu"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            <Menu size={28} strokeWidth={1.5} />
          </button>
        </div>
      </nav>

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

        <div className="flex flex-col gap-4 w-full max-w-sm mx-auto overflow-y-auto flex-1 pt-4 pb-8">
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
    </>
  );
};

export default Navbar;
