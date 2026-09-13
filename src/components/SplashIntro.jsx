"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";

const SplashIntro = () => {
  // Start with shouldShow = true so the overlay exists immediately on frame 0
  const [shouldShow, setShouldShow] = useState(true);
  const [animating, setAnimating] = useState(false);
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const spinnerRef = useRef(null);

  useEffect(() => {
    // Check session on mount:
    // If already visited this tab/session, hide immediately (0ms)
    // If first time this tab/session, keep visible and start 3s animation
    try {
      localStorage.removeItem("mecelfab_first_visit_complete");
      const hasVisited = sessionStorage.getItem("mecelfab_visited");
      if (hasVisited) {
        setShouldShow(false);
        setAnimating(false);
      } else {
        sessionStorage.setItem("mecelfab_visited", "true");
        setAnimating(true);
      }
    } catch {
      setAnimating(true);
    }
  }, []);

  useEffect(() => {
    if (!animating) return;

    // 1. Silky smooth entrance timeline with staged reveals
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { scale: 0.97, opacity: 0, y: 10 },
        { scale: 1, opacity: 1, y: 0, duration: 1.2, ease: "power2.out" }
      );
    }

    // 2. Continuous silky spin of the outer glow ring
    if (spinnerRef.current) {
      gsap.to(spinnerRef.current, {
        rotation: 360,
        repeat: -1,
        duration: 3.5,
        ease: "none"
      });
    }

    // 3. Gentle ambient breathe on the central mark
    gsap.to(".splash-mark", {
      scale: 1.04,
      repeat: -1,
      yoyo: true,
      duration: 1.8,
      ease: "sine.inOut"
    });

    // 4. After 5s display window, silky smooth cinematic fade-out transition
    const timer = setTimeout(() => {
      if (overlayRef.current) {
        gsap.to(overlayRef.current, {
          opacity: 0,
          scale: 1.015,
          duration: 1.0,
          ease: "power2.inOut",
          onComplete: () => {
            setShouldShow(false);
            setAnimating(false);
          }
        });
      } else {
        setShouldShow(false);
        setAnimating(false);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [animating]);

  if (!shouldShow) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#070B13] px-6 select-none"
      aria-label="Loading MECELFAB"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-[140px] pointer-events-none" />

      <div ref={contentRef} className="relative z-10 flex flex-col items-center justify-center gap-10">
        {/* Upper Logo: Full Logo with smooth rounded edges */}
        <div className="flex items-center justify-center max-w-[280px] sm:max-w-[360px] md:max-w-[420px] rounded-xl overflow-hidden">
          <Image
            src="/images/logo-full.jpeg"
            alt="MECELFAB Industrial Solutions"
            width={420}
            height={84}
            className="w-full h-auto object-contain rounded-xl drop-shadow-[0_10px_35px_rgba(0,0,0,0.8)]"
            priority
          />
        </div>

        {/* Below Loading Animation: logo-mark with spinning ring */}
        <div className="relative flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32">
          {/* Animated spinning ring */}
          <div
            ref={spinnerRef}
            className="absolute inset-0 rounded-full border-2 border-white/5 border-t-accent border-r-accent/60"
          />
          
          {/* Subtle counter-rotating dashed ring */}
          <div 
            className="absolute inset-2 rounded-full border border-dashed border-white/15 animate-spin" 
            style={{ animationDirection: 'reverse', animationDuration: '4s' }}
          />

          {/* Core Logo Mark with smooth rounded corners and gentle breathing animation */}
          <div className="splash-mark relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(255,100,20,0.25)]">
            <Image
              src="/images/logo-mark.jpeg"
              alt="MECELFAB Mark"
              width={72}
              height={72}
              className="w-full h-full object-contain rounded-2xl"
              priority
            />
          </div>
        </div>

        {/* Soft, continuous flowing shimmer line */}
        <div className="w-36 sm:w-44 h-[2px] bg-white/10 rounded-full overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent rounded-full -translate-x-full animate-[shimmer_1.8s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
};

export default SplashIntro;
