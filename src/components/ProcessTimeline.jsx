"use client";
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

const ProcessTimeline = () => {
  const containerRef = useRef(null);

  const stages = [
    {
      id: '01',
      title: 'Discover',
      description: 'Understand requirements, site conditions and project constraints.'
    },
    {
      id: '02',
      title: 'Engineer',
      description: 'Develop designs, calculations and execution plans.'
    },
    {
      id: '03',
      title: 'Fabricate',
      description: 'Precision fabrication under controlled processes.'
    },
    {
      id: '04',
      title: 'Install',
      description: 'Professional erection and equipment installation.'
    },
    {
      id: '05',
      title: 'Test',
      description: 'Inspection, testing and validation.'
    },
    {
      id: '06',
      title: 'Commission',
      description: 'Final commissioning and project handover.'
    }
  ];

  useGSAP(() => {
    // Header animation
    gsap.fromTo('.process-header',
      { y: 30, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: containerRef.current, start: 'top 80%' }
      }
    );

    // Continuous Line animation
    gsap.fromTo('.process-line-fill',
      { scaleX: 0, scaleY: 0 },
      {
        scaleX: 1, scaleY: 1, duration: 1.5, ease: 'power3.out',
        transformOrigin: 'left top',
        scrollTrigger: { trigger: '.process-track', start: 'top 80%' }
      }
    );

    // Stage animations
    gsap.fromTo('.process-stage',
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: '.process-track', start: 'top 80%' }
      }
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} id="process" className="section-padding bg-[#030303] border-t border-white/5 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">
        
        {/* Header */}
        <div className="process-header mb-20 md:mb-28 max-w-2xl opacity-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-5 h-[1px] bg-white/30" />
            <span className="text-white/40 text-[10px] font-heading tracking-[0.3em] uppercase">
              Our Engineering Process
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-light text-white tracking-tight mb-6">
            From Concept to <br />
            <span className="text-white/40 italic font-serif">Commissioning</span>
          </h2>
          <p className="text-sm md:text-base text-white/45 font-light leading-relaxed">
            A proven six-stage approach ensuring precision, safety, and successful project delivery from initial site study to final handover.
          </p>
        </div>

        {/* Timeline Track */}
        <div className="process-track relative">
          
          {/* The Continuous Line (Desktop = horizontal, Mobile = vertical) */}
          <div className="absolute top-0 left-[15px] lg:left-0 lg:top-[15px] bottom-0 lg:bottom-auto w-[1px] lg:w-full h-full lg:h-[1px] bg-white/10 z-0">
            <div className="process-line-fill w-full h-full bg-gradient-to-b lg:bg-gradient-to-r from-white/60 to-transparent lg:scale-x-0 scale-y-0 lg:scale-y-100 opacity-0" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-6 gap-y-10 lg:gap-y-0 lg:gap-x-6 relative z-10">
            {stages.map((stage) => (
              <div
                key={stage.id}
                className="process-stage relative flex flex-row lg:flex-col items-start gap-6 lg:gap-8 opacity-0"
              >
                {/* Timeline Dot & Line Area */}
                <div className="flex-shrink-0 flex flex-col lg:flex-row items-center justify-start relative">
                  {/* The Dot */}
                  <div className="w-[31px] h-[31px] rounded-full bg-[#030303] border border-white/20 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-colors duration-500 hover:border-white/60">
                    <div className="w-2 h-2 rounded-full bg-white/40" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-2 pt-1 lg:pt-0">
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-xs font-heading text-white/20 tracking-widest">{stage.id}</span>
                    <h3 className="text-lg md:text-xl font-heading font-light text-white">{stage.title}</h3>
                  </div>
                  <p className="text-sm text-white/40 font-light leading-relaxed lg:max-w-[180px]">
                    {stage.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default ProcessTimeline;