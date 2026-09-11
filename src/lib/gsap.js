import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Respect prefers-reduced-motion for GSAP animations
if (typeof window !== 'undefined') {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  
  const applyReducedMotion = (matches) => {
    if (matches) {
      gsap.globalTimeline.pause();
      ScrollTrigger.getAll().forEach(st => st.kill());
      // Make all GSAP-animated elements immediately visible
      document.querySelectorAll('.gsap-hidden').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    } else {
      gsap.globalTimeline.resume();
    }
  };

  applyReducedMotion(prefersReducedMotion.matches);
  prefersReducedMotion.addEventListener('change', (e) => applyReducedMotion(e.matches));
}

export { gsap, ScrollTrigger };
