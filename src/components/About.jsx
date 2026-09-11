"use client";
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

import TextReveal from './animations/TextReveal';

const About = ({ content }) => {
  const sectionRef = useRef(null);

  useGSAP(() => {
    const elements = gsap.utils.toArray('.about-animate');

    gsap.fromTo(elements,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        }
      }
    );
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} id="about" className="section-padding bg-primary border-t border-white/5 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-6xl text-center">

        <div className="about-animate inline-block text-secondary text-sm font-heading tracking-widest uppercase mb-8 relative after:hidden md:after:block after:content-[''] after:absolute after:top-1/2 after:-right-12 after:w-8 after:h-[1px] after:bg-secondary/50">
          Our Foundation
        </div>

        <h1 className="about-animate text-3xl md:text-5xl lg:text-6xl font-heading font-light text-white leading-tight tracking-tight mb-12">
          Precision engineering for <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-secondary">industrial operations</span>.
        </h1>

        <TextReveal
          as="p"
          delay={0.1}
          className="text-lg md:text-xl text-secondary font-light leading-relaxed mb-8 max-w-3xl mx-auto"
        >
          {content?.mission || 'MECELFAB INDUSTRIAL SOLUTIONS PRIVATE LIMITED is an industrial engineering company. We were founded by mechanical and mechatronics engineers and focus on heavy structural fabrication, equipment installation, and maintenance services.'}
        </TextReveal>

        <TextReveal
          as="p"
          delay={0.2}
          className="text-lg md:text-xl text-secondary font-light leading-relaxed mb-16 max-w-3xl mx-auto"
        >
          {content?.vision || 'Our work covers heavy metal fabrication, structural erection, and maintenance of pneumatic and hydraulic systems. We build and maintain industrial facilities and mechanical systems to reduce downtime.'}
        </TextReveal>

        {/* Enhanced Sections per Master Prompt */}
        <div className="text-left mb-20">
          {/* Who We Are */}
          <div className="about-animate inline-block text-secondary text-sm font-heading tracking-widest uppercase mb-4 relative after:hidden md:after:block after:content-[''] after:absolute after:top-1/2 after:-right-12 after:w-8 after:h-[1px] after:bg-secondary/50">
            Who We Are
          </div>
          <h3 className="about-animate text-2xl font-heading font-light text-white mb-6">
            Who We Are
          </h3>
          <p className="text-secondary text-base font-light leading-relaxed mb-8 max-w-2xl">
            MECELFAB Industrial Solutions provides fabrication, installation, and maintenance work for industrial facilities. Our team of qualified engineers and skilled technicians handles project execution from planning through installation and commissioning.
          </p>

          {/* Our Capabilities */}
          <div className="about-animate inline-block text-secondary text-sm font-heading tracking-widest uppercase mb-4 relative after:hidden md:after:block after:content-[''] after:absolute after:top-1/2 after:-right-12 after:w-8 after:h-[1px] after:bg-secondary/50">
            Our Capabilities
          </div>
          <h3 className="about-animate text-2xl font-heading font-light text-white mb-6">
            Engineering Disciplines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="text-left">
              <h4 className="font-heading text-lg text-white mb-3">Mechanical Engineering</h4>
              <p className="text-secondary text-sm font-light">Structural analysis, machine design, and fabrication processes</p>
            </div>
            <div className="text-left">
              <h4 className="font-heading text-lg text-white mb-3">Electrical Engineering</h4>
              <p className="text-secondary text-sm font-light">Power distribution, control systems, and automation integration</p>
            </div>
            <div className="text-left">
              <h4 className="font-heading text-lg text-white mb-3">Automation</h4>
              <p className="text-secondary text-sm font-light">PLC programming and SCADA systems</p>
            </div>
            <div className="text-left">
              <h4 className="font-heading text-lg text-white mb-3">Fabrication</h4>
              <p className="text-secondary text-sm font-light">Precision welding and structural assembly</p>
            </div>
            <div className="text-left">
              <h4 className="font-heading text-lg text-white mb-3">Installation</h4>
              <p className="text-secondary text-sm font-light">Equipment erection, mechanical alignment, and system commissioning</p>
            </div>
            <div className="text-left">
              <h4 className="font-heading text-lg text-white mb-3">Project Management</h4>
              <p className="text-secondary text-sm font-light">CPM scheduling, resource allocation, and quality control</p>
            </div>
          </div>

          {/* Our Values */}
          <div className="about-animate inline-block text-secondary text-sm font-heading tracking-widest uppercase mb-4 relative after:hidden md:after:block after:content-[''] after:absolute after:top-1/2 after:-right-12 after:w-8 after:h-[1px] after:bg-secondary/50">
            Our Values
          </div>
          <h3 className="about-animate text-2xl font-heading font-light text-white mb-6">
            How We Work
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
            <div className="text-left">
              <h4 className="font-heading text-xl text-white mb-2">PRECISION</h4>
              <p className="text-secondary text-sm font-light">Exact measurements and tight tolerances in all work</p>
            </div>
            <div className="text-left">
              <h4 className="font-heading text-xl text-white mb-2">SAFETY</h4>
              <p className="text-secondary text-sm font-light">Commitment to workplace safety with adherence to industry standards</p>
            </div>
            <div className="text-left">
              <h4 className="font-heading text-xl text-white mb-2">ACCOUNTABILITY</h4>
              <p className="text-secondary text-sm font-light">Full transparency and ownership of project outcomes</p>
            </div>
            <div className="text-left">
              <h4 className="font-heading text-xl text-white mb-2">DELIVERY</h4>
              <p className="text-secondary text-sm font-light">On-time completion with verified performance</p>
            </div>
          </div>

          {/* How We Work */}
          <div className="about-animate inline-block text-secondary text-sm font-heading tracking-widest uppercase mb-4 relative after:hidden md:after:block after:content-[''] after:absolute after:top-1/2 after:-right-12 after:w-8 after:h-[1px] after:bg-secondary/50">
            How We Work
          </div>
          <h3 className="about-animate text-2xl font-heading font-light text-white mb-6">
            How We Work
          </h3>
          <p className="text-secondary text-base font-light leading-relaxed mb-8 max-w-2xl">
            Our team consists of qualified engineers with professional experience in industrial fabrication, automation, and infrastructure projects. We maintain a policy of using only verified team member information and do not publish individual profiles without explicit consent.
          </p>

          {/* Certifications */}
          <div className="about-animate inline-block text-secondary text-sm font-heading tracking-widest uppercase mb-4 relative after:hidden md:after:block after:content-[''] after:absolute after:top-1/2 after:-right-12 after:w-8 after:h-[1px] after:bg-secondary/50">
            Certifications
          </div>
          <h3 className="about-animate text-2xl font-heading font-light text-white mb-6">
            Verified Standards Compliance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-6">
              <h4 className="font-heading text-lg text-white mb-3">ISO 9001:2015</h4>
              <p className="text-secondary text-sm font-light">Quality Management Systems</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-6">
              <h4 className="font-heading text-lg text-white mb-3">ISO 45001:2018</h4>
              <p className="text-secondary text-sm font-light">Occupational Health and Safety</p>
            </div>
          </div>

          {/* Our Practice */}
          <div className="about-animate inline-block text-secondary text-sm font-heading tracking-widest uppercase mb-4 relative after:hidden md:after:block after:content-[''] after:absolute after:top-1/2 after:-right-12 after:w-8 after:h-[1px] after:bg-secondary/50">
            Our Practice
          </div>
          <h3 className="about-animate text-2xl font-heading font-light text-white mb-6">
            Our Practice
          </h3>
          <p className="text-secondary text-base font-light leading-relaxed mb-8 max-w-2xl">
            MECELFAB handles fabrication, erection, and maintenance projects for industrial clients. We focus on completing work to specification, on schedule, and at the agreed cost.
          </p>
        </div>

        <div className="about-animate text-white text-base md:text-lg font-light uppercase tracking-widest border-y border-white/10 py-8 mt-16">
          Fabrication. Erection. Maintenance.
        </div>

      </div>
    </section>
  );
};

export default About;
