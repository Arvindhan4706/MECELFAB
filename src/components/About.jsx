"use client";
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { Settings, Zap, Wrench, Shield, Clock, Target, Award, CheckCircle, FileCheck } from 'lucide-react';

import TextReveal from './animations/TextReveal';

const disciplines = [
  { icon: Wrench, name: 'Mechanical Engineering', desc: 'Structural analysis, machine design, and fabrication processes' },
  { icon: Zap, name: 'Electrical Engineering', desc: 'Power distribution, control systems, and automation integration' },
  { icon: Settings, name: 'Automation', desc: 'PLC programming and SCADA systems' },
  { icon: Target, name: 'Fabrication', desc: 'Precision welding and structural assembly' },
  { icon: Wrench, name: 'Installation', desc: 'Equipment erection, mechanical alignment, and system commissioning' },
  { icon: Clock, name: 'Project Management', desc: 'CPM scheduling, resource allocation, and quality control' },
];

const values = [
  { label: 'PRECISION', desc: 'Exact measurements and tight tolerances in all work', icon: Target },
  { label: 'SAFETY', desc: 'Commitment to workplace safety with adherence to industry standards', icon: Shield },
  { label: 'ACCOUNTABILITY', desc: 'Full transparency and ownership of project outcomes', icon: CheckCircle },
  { label: 'DELIVERY', desc: 'On-time completion with verified performance', icon: Clock },
];

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
        stagger: 0.12,
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
      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-6xl">

        {/* ═══════════════════════════════════════════
            1. OUR FOUNDATION
        ═══════════════════════════════════════════ */}
        <div className="text-center mb-20 md:mb-28">
          <h2 className="about-animate text-3xl md:text-5xl lg:text-6xl font-heading font-light text-white leading-tight tracking-tight mb-8">
            Our Foundation
          </h2>
          <div className="about-animate w-16 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mb-8" />
          <TextReveal
            as="p"
            delay={0.1}
            className="text-base md:text-lg text-secondary font-light leading-relaxed max-w-3xl mx-auto"
          >
            {content?.mission || 'MECELFAB INDUSTRIAL SOLUTIONS PRIVATE LIMITED is an industrial engineering company. We were founded by mechanical and mechatronics engineers and focus on heavy structural fabrication, equipment installation, and maintenance services.'}
          </TextReveal>
        </div>

        {/* ═══════════════════════════════════════════
            2. WHO WE ARE
        ═══════════════════════════════════════════ */}
        <div className="mb-24 md:mb-32">
          <h2 className="about-animate text-3xl md:text-4xl font-heading font-light text-white text-center mb-4">
            Who We Are
          </h2>
          <div className="about-animate w-16 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mb-12" />
          <div className="max-w-3xl mx-auto text-center">
            <p className="about-animate text-secondary text-base md:text-lg font-light leading-relaxed mb-8">
              {content?.vision || 'Our work covers heavy metal fabrication, structural erection, and maintenance of pneumatic and hydraulic systems. We build and maintain industrial facilities and mechanical systems to reduce downtime.'}
            </p>
            <div className="about-animate flex items-start gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-lg text-left">
              <div className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center shrink-0 mt-0.5">
                <Award size={18} className="text-white/60" />
              </div>
              <p className="text-secondary text-sm font-light leading-relaxed">
                MECELFAB handles fabrication, erection, and maintenance projects for industrial clients. We focus on completing work to specification, on schedule, and at the agreed cost.
              </p>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            3. OUR CAPABILITIES
        ═══════════════════════════════════════════ */}
        <div className="mb-24 md:mb-32">
          <h2 className="about-animate text-3xl md:text-4xl font-heading font-light text-white text-center mb-4">
            Our Capabilities
          </h2>
          <div className="about-animate w-16 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mb-12" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {disciplines.map((d) => (
              <div
                key={d.name}
                className="about-animate group flex items-start gap-3 p-5 bg-white/[0.02] border border-white/5 rounded-lg hover:border-white/10 transition-colors duration-300"
              >
                <div className="w-10 h-10 rounded-md bg-white/[0.04] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-white/[0.06] transition-colors">
                  <d.icon size={18} className="text-white/50 group-hover:text-white/70 transition-colors" />
                </div>
                <div>
                  <h4 className="font-heading text-sm text-white mb-1">{d.name}</h4>
                  <p className="text-secondary text-xs font-light leading-relaxed">{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            4. OUR VALUES
        ═══════════════════════════════════════════ */}
        <div className="mb-24 md:mb-32">
          <h2 className="about-animate text-3xl md:text-4xl font-heading font-light text-white text-center mb-4">
            Our Values
          </h2>
          <div className="about-animate w-16 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mb-12" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map((v) => (
              <div
                key={v.label}
                className="about-animate text-center p-6 bg-white/[0.02] border border-white/5 rounded-lg hover:border-white/10 transition-colors duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                  <v.icon size={20} className="text-white/50" />
                </div>
                <h4 className="font-heading text-base text-white mb-2 tracking-wide">{v.label}</h4>
                <p className="text-secondary text-sm font-light leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            5. CERTIFICATIONS
        ═══════════════════════════════════════════ */}
        <div className="mb-24 md:mb-32">
          <h2 className="about-animate text-3xl md:text-4xl font-heading font-light text-white text-center mb-4">
            Certifications
          </h2>
          <div className="about-animate w-16 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="about-animate flex items-center gap-5 p-6 bg-white/[0.02] border border-white/5 rounded-lg">
              <div className="w-14 h-14 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                <Award size={24} className="text-white/50" />
              </div>
              <div>
                <h4 className="font-heading text-lg text-white mb-1">ISO 9001:2015</h4>
                <p className="text-secondary text-sm font-light">Quality Management Systems</p>
              </div>
            </div>
            <div className="about-animate flex items-center gap-5 p-6 bg-white/[0.02] border border-white/5 rounded-lg">
              <div className="w-14 h-14 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                <Shield size={24} className="text-white/50" />
              </div>
              <div>
                <h4 className="font-heading text-lg text-white mb-1">ISO 45001:2018</h4>
                <p className="text-secondary text-sm font-light">Occupational Health and Safety</p>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            6. OUR TEAM
        ═══════════════════════════════════════════ */}
        <div className="mb-24 md:mb-32">
          <h2 className="about-animate text-3xl md:text-4xl font-heading font-light text-white text-center mb-4">
            Our Team
          </h2>
          <div className="about-animate w-16 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mb-12" />
          <div className="max-w-3xl mx-auto text-center">
            <p className="about-animate text-secondary text-base md:text-lg font-light leading-relaxed">
              Our team consists of qualified engineers with professional experience in industrial fabrication, automation, and infrastructure projects. We maintain a policy of using only verified team member information and do not publish individual profiles without explicit consent.
            </p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            7. QUALITY ASSURANCE
        ═══════════════════════════════════════════ */}
        <div className="mb-20 md:mb-28">
          <h2 className="about-animate text-3xl md:text-4xl font-heading font-light text-white text-center mb-4">
            Quality Assurance
          </h2>
          <div className="about-animate w-16 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mb-12" />
          <div className="max-w-3xl mx-auto">
            <div className="about-animate grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="p-5 bg-white/[0.02] border border-white/5 rounded-lg">
                <FileCheck size={24} className="text-white/50 mx-auto mb-3" />
                <h4 className="font-heading text-sm text-white mb-2">Documented Procedures</h4>
                <p className="text-secondary text-xs font-light leading-relaxed">Every project follows verified work procedures with recorded checkpoints</p>
              </div>
              <div className="p-5 bg-white/[0.02] border border-white/5 rounded-lg">
                <CheckCircle size={24} className="text-white/50 mx-auto mb-3" />
                <h4 className="font-heading text-sm text-white mb-2">Inspection & Testing</h4>
                <p className="text-secondary text-xs font-light leading-relaxed">Systematic quality checks at each fabrication and erection stage</p>
              </div>
              <div className="p-5 bg-white/[0.02] border border-white/5 rounded-lg">
                <Shield size={24} className="text-white/50 mx-auto mb-3" />
                <h4 className="font-heading text-sm text-white mb-2">Standards Compliance</h4>
                <p className="text-secondary text-xs font-light leading-relaxed">Work executed to ISO 9001 and project-specific quality requirements</p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Bottom tagline ─── */}
        <div className="about-animate text-center text-white text-base md:text-lg font-light uppercase tracking-[0.2em] border-y border-white/10 py-8">
          Fabrication. Erection. Maintenance.
        </div>

      </div>
    </section>
  );
};

export default About;
