"use client";
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FileCheck, Shield, ClipboardCheck, AlertTriangle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const QualitySafety = () => {
  const containerRef = useRef(null);
  const bgRef = useRef(null);

  const complianceCards = [
    {
      icon: <FileCheck size={24} className="text-white" />,
      title: 'Global Engineering Standards',
      desc: 'All 3D kinematic models, automated welding procedures (WPS), and structural assemblies strictly comply with international ISO mechanical standards.'
    },
    {
      icon: <Shield size={24} className="text-white" />,
      title: 'Zero-Tolerance Protocol',
      desc: 'We mandate absolute compliance with environmental and occupational health directives, utilizing predictive IoT sensors to map jobsite hazards.'
    },
    {
      icon: <ClipboardCheck size={24} className="text-white" />,
      title: 'Precision Audit Systems',
      desc: 'Integrating rigorous ultrasonic, dye-penetrant, and magnetic particle non-destructive testing (NDT) to verify absolute weld integrity.'
    },
    {
      icon: <AlertTriangle size={24} className="text-white" />,
      title: 'Predictive Risk Algorithms',
      desc: 'Executing highly detailed algorithmic rigging risk assessments (HIRA) for heavy lifting, overhead erection, and dynamic load installations.'
    }
  ];

  useGSAP(() => {
    // Parallax
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top bottom',
      end: 'bottom top',
      animation: gsap.fromTo(bgRef.current, { y: '-10%' }, { y: '10%', ease: 'none' }),
      scrub: true,
    });

    // Staggered texts
    gsap.fromTo('.qs-text',
      { opacity: 0, x: -30 },
      {
        opacity: 1, x: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
        }
      }
    );

    // Staggered cards
    gsap.fromTo('.qs-card',
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.15,
        scrollTrigger: {
          trigger: '.qs-cards-grid',
          start: 'top 85%',
        }
      }
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} id="quality-safety" className="relative section-padding bg-primary-light overflow-hidden">
      {/* Parallax Background Gradient */}
      <div 
        ref={bgRef}
        className="absolute inset-0 z-0 pointer-events-none opacity-50"
        style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(30,58,138,0.1) 100%)' }}
      />
      
      <div className="container relative z-10 mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Text panel */}
          <div>
            <span className="qs-text inline-block text-secondary text-sm font-heading tracking-widest uppercase mb-6 relative after:content-[''] after:absolute after:top-1/2 after:-right-12 after:w-8 after:h-[1px] after:bg-secondary/50">
              Zero Compromise
            </span>
            <h2 className="qs-text text-4xl md:text-5xl lg:text-6xl font-heading font-light text-white tracking-tight leading-tight mb-8">
              Committed to <br/> Quality & Safety <span className="italic font-serif opacity-90">Excellence</span>
            </h2>
            <p className="qs-text text-lg text-white/90 font-light leading-relaxed mb-6">
              At MECELFAB INDUSTRIAL SOLUTIONS PRIVATE LIMITED, quality execution and industrial health and safety are core corporate values, not optional checkboxes.
            </p>
            <p className="qs-text text-base text-secondary font-light leading-relaxed mb-12">
              We enforce an environment of high discipline across fabrication yards and field job sites. Our engineers work hand-in-hand with safety inspectors to ensure all construction works conform to safety indices, reducing risk exposure and ensuring perfect structural compliance.
            </p>

            <div className="qs-text flex gap-8 pt-8 border-t border-white/5">
              <div>
                <div className="text-4xl font-heading font-light text-white mb-1">Safety-First</div>
                <div className="text-xs text-secondary tracking-widest uppercase font-semibold">Safety Adherence</div>
              </div>
              <div className="pl-8 border-l border-white/5">
                <div className="text-4xl font-heading font-light text-white mb-1">Zero Harm</div>
                <div className="text-xs text-secondary tracking-widest uppercase font-semibold">LTI Incidents</div>
              </div>
            </div>
          </div>

          {/* Cards panel */}
          <div className="qs-cards-grid grid grid-cols-1 sm:grid-cols-2 gap-6">
            {complianceCards.map((card, idx) => (
              <div
                key={idx}
                className="qs-card group p-8 bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/20 transition-all duration-500"
              >
                <div className="w-12 h-12 rounded bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-white/10 group-hover:border-white/20 transition-colors duration-500 mb-6">
                  {card.icon}
                </div>
                <h3 className="text-lg font-heading font-light text-white mb-3">
                  {card.title}
                </h3>
                <p className="text-sm text-secondary font-light leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default QualitySafety;

