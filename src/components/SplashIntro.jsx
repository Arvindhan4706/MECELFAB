"use client";
import { useState, useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const SplashIntro = () => {
  const [mounted, setMounted] = useState(true);
  const overlayRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    // Animate logo in
    if (imgRef.current) {
      gsap.fromTo(imgRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: "power2.out" }
      );
    }

    // After 1.2s, animate overlay out then remove from DOM
    const timer = setTimeout(() => {
      if (overlayRef.current) {
        gsap.to(overlayRef.current, {
          opacity: 0,
          scale: 0.1,
          duration: 1.0,
          ease: "power2.inOut",
          onComplete: () => setMounted(false)
        });
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#070B13',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img
          ref={imgRef}
          src="/images/logo.jpg"
          alt="MECELFAB Industrial Solutions Logo"
          style={{
            maxWidth: '80%',
            maxHeight: '80%',
            objectFit: 'contain',
            borderRadius: '8px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            opacity: 0
          }}
        />
      </div>
    </div>
  );
};

export default SplashIntro;
