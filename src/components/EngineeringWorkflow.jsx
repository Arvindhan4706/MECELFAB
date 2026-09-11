'use client';
import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';

const workflowSteps = [
  { id: '01', title: 'REQUIREMENT', description: 'Understand the service/equipment requirement and initial constraints.' },
  { id: '02', title: 'INSPECTION', description: 'Assess the system/equipment on-site or through technical documentation.' },
  { id: '03', title: 'SOLUTION', description: 'Determine the appropriate engineering service approach.' },
  { id: '04', title: 'EXECUTION', description: 'Perform the required work with precision and compliance.' },
  { id: '05', title: 'TESTING', description: 'Rigorous testing to verify completed work and performance.' },
  { id: '06', title: 'HANDOVER', description: 'Complete the service and provide necessary documentation.' }
];

const EngineeringWorkflow = () => {
  const containerRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo('.wf-card',
      { y: 30, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 75%',
        }
      }
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="section-padding bg-black relative">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">
        <div className="mb-16">
          <span className="text-accent font-heading tracking-widest text-sm uppercase mb-4 block">How We Work</span>
          <h2 className="text-4xl md:text-5xl font-heading font-light text-white tracking-tight">
            ENGINEERING WORKFLOW
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflowSteps.map((step, _index) => (
            <div key={step.id} className="wf-card p-8 border border-white/10 bg-white/[0.02] relative group hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300">
              <div className="absolute top-0 right-4 text-[80px] font-heading font-bold text-white/[0.02] select-none pointer-events-none leading-none pt-4 group-hover:text-white/[0.04] transition-colors">
                {step.id}
              </div>
              <div className="relative z-10">
                <span className="text-accent font-heading font-bold mb-4 block text-sm">{step.id}</span>
                <h3 className="text-xl font-heading font-light text-white mb-3 tracking-wide">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed font-light">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EngineeringWorkflow;
