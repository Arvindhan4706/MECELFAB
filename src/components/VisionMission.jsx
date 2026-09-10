"use client";

import { motion } from 'framer-motion';
import { Eye, Rocket } from 'lucide-react';

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
          {/* Vision Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="glass-panel"
            style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              background: 'rgba(15, 23, 42, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              position: 'relative'
            }}
          >
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
          </motion.div>

          {/* Mission Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="glass-panel"
            style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              background: 'rgba(15, 23, 42, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              position: 'relative'
            }}
          >
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
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default VisionMission;
