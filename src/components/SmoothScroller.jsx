"use client";
import { useEffect } from 'react';
import Lenis from 'lenis';
import { usePathname } from 'next/navigation';

export default function SmoothScroller({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    if (
      pathname?.startsWith('/admin') || 
      pathname?.startsWith('/portal') ||
      pathname?.startsWith('/auth')
    ) {
      return;
    }

    let lenis;
    let rafId;

    try {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        syncTouch: true,
      });

      function raf(time) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }

      rafId = requestAnimationFrame(raf);
    } catch (e) {
      console.warn('Lenis failed to initialize:', e);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (lenis) {
        try {
          lenis.destroy();
        } catch (e) {
          console.warn('Lenis destroy error:', e);
        }
      }
    };
  }, [pathname]);

  return <>{children}</>;
}
