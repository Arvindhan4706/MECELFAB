"use client";
import { useState, useEffect, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const Testimonials = ({ testimonials = [] }) => {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayIndex, setDisplayIndex] = useState(0);
  const timeoutRef = useRef(null);

  const goTo = (newIndex, auto = false) => {
    if (isAnimating || testimonials.length <= 1) return;
    setIsAnimating(true);
    // Phase 1: fade out
    setDisplayIndex(-1); // triggers exit class
    timeoutRef.current = setTimeout(() => {
      // Phase 2: swap content, fade in
      setCurrent(newIndex);
      setDisplayIndex(newIndex);
      timeoutRef.current = setTimeout(() => setIsAnimating(false), 500);
    }, 500);
  };

  useEffect(() => {
    if (!testimonials || testimonials.length <= 1) return;
    const timer = setInterval(() => {
      const next = (current + 1) % testimonials.length;
      goTo(next, true);
    }, 6000);
    return () => clearInterval(timer);
  }, [current, testimonials, isAnimating]);

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  if (testimonials.length === 0) return null;

  const active = testimonials[current];
  const isVisible = displayIndex >= 0;

  return (
    <section id="testimonials" className="section section-bg-dark" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: '20%', left: '10%',
        width: '300px', height: '300px',
        background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div className="container">
        <div className="section-header">
          <span className="section-badge">Testimonials</span>
          <h2 className="section-title">What Our Clients Say</h2>
          <p className="section-subtitle">
            Read comments from project developers, plant managers, and industrial operators who have worked with us.
          </p>
        </div>

        <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto', minHeight: '320px' }}>
          <div style={{
            position: 'absolute', top: '-20px', left: '20px',
            opacity: 0.05, color: 'var(--white)', pointerEvents: 'none'
          }}>
            <Quote size={120} />
          </div>

          <div
            className="glass-panel"
            style={{
              padding: 'clamp(1.5rem, 5vw, 3.5rem) clamp(1rem, 4vw, 2.5rem)',
              textAlign: 'center',
              background: 'rgba(21, 48, 91, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.04)',
              borderRadius: 'var(--radius-lg)',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateX(0)' : 'translateX(40px)',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem', marginBottom: '1.5rem' }}>
              {[...Array(active.rating)].map((_, i) => (
                <Star key={i} size={18} fill="var(--accent)" color="var(--accent)" />
              ))}
            </div>

            <p style={{
              fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
              lineHeight: 1.6,
              color: 'var(--white)',
              marginBottom: '2rem',
              fontWeight: 400,
              fontStyle: 'italic'
            }}>
              "{active.quote}"
            </p>

            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)' }}>
                {active.name}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#94A3B8' }}>
                {active.role} — <span style={{ fontWeight: 600, color: '#E2E8F0' }}>{active.company}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '2rem' }}>
            <button
              aria-label="Previous testimonial"
              onClick={() => goTo((current - 1 + testimonials.length) % testimonials.length)}
              style={{
                width: '45px', height: '45px', borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                color: 'var(--white)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'var(--transition-fast)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'; e.currentTarget.style.color = 'var(--white)'; }}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              aria-label="Next testimonial"
              onClick={() => goTo((current + 1) % testimonials.length)}
              style={{
                width: '45px', height: '45px', borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                color: 'var(--white)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'var(--transition-fast)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'; e.currentTarget.style.color = 'var(--white)'; }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
