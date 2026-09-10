"use client";
import { useContext, useEffect, useRef } from 'react';
import { CMSContext } from '../context/CMSContext';
import { gsap, ScrollTrigger } from '@/lib/gsap';

const CounterItem = ({ targetValue, label, suffix = '' }) => {
  const countRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const end = parseInt(targetValue, 10) || 0;
    if (end === 0) return;

    const obj = { val: 0 };

    ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: end,
          duration: 2,
          ease: 'power2.out',
          onUpdate: () => {
            if (countRef.current) {
              countRef.current.innerText = Math.round(obj.val) + suffix;
            }
          }
        });

        gsap.fromTo(containerRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
        );
      }
    });
  }, [targetValue, suffix]);

  return (
    <div ref={containerRef} className="text-center p-4 opacity-0">
      <div
        ref={countRef}
        className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-white leading-tight mb-2"
      >
        {parseInt(targetValue, 10) || 0}{suffix}
      </div>
      <div className="text-sm font-heading uppercase tracking-widest text-secondary font-semibold">
        {label}
      </div>
    </div>
  );
};

const Stats = () => {
  const { stats } = useContext(CMSContext);

  const statsItems = [
    { key: 'projectsCompleted', label: 'Projects Completed', value: stats.projectsCompleted, suffix: '+' },
    { key: 'industrialClients', label: 'Industrial Clients', value: stats.industrialClients, suffix: '+' },
    { key: 'serviceCategories', label: 'Service Categories', value: stats.serviceCategories, suffix: '' },
    { key: 'safetyCompliance', label: 'Safety Compliance', value: stats.safetyCompliance, suffix: '%' },
  ];

  return (
    <section
      id="statistics"
      className="section-padding bg-primary border-y border-white/5"
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 items-center">
          {statsItems.map((item) => (
            <CounterItem
              key={item.key}
              targetValue={item.value}
              label={item.label}
              suffix={item.suffix}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
