"use client";

import { useRef, useEffect, useState } from 'react';
import { Eye, Rocket } from 'lucide-react';

const FadeInCard = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="glass-panel"
      style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        background: 'rgba(15, 23, 42, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        position: 'relative',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

const VisionMission = () => {
  return (
    <section id="vision-mission" className="section section-bg-light">
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))',
            gap: '2.5rem'
          }}
        >
          <FadeInCard delay={0}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <Eye size={28} style={{ color: 'var(--accent)' }} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
              Our Vision
            </h3>
            <p style={{ color: '#E2E8F0', fontSize: '1.05rem', lineHeight: 1.6, fontWeight: 400 }}>
              "To advance industrial engineering excellence through mechanical precision, structural resilience, and automated infrastructure solutions."
            </p>
          </FadeInCard>

          <FadeInCard delay={0.15}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <Rocket size={28} style={{ color: 'var(--accent)' }} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
              Our Mission
            </h3>
            <p style={{ color: '#E2E8F0', fontSize: '1.05rem', lineHeight: 1.6, fontWeight: 400 }}>
              "To architect and execute heavy-mechanical solutions that support our clients' operational success, with focus on safety, quality, and reliable delivery across every project phase."
            </p>
          </FadeInCard>
        </div>
      </div>
    </section>
  );
};

export default VisionMission;
