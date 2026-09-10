"use client";
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

const TextReveal = ({ children, className = "", as: Component = "h2", delay = 0, splitType = "word" }) => {
  const containerRef = useRef(null);

  // Split string into words or characters
  const isString = typeof children === 'string';
  let segments = [];
  
  if (isString) {
    segments = splitType === 'char' ? children.split('') : children.split(' ');
  }

  useGSAP(() => {
    if (segments.length > 0) {
      gsap.fromTo(
        '.reveal-segment',
        { y: '120%', opacity: 0 },
        {
          y: '0%',
          opacity: 1,
          duration: splitType === 'char' ? 0.6 : 1,
          stagger: splitType === 'char' ? 0.02 : 0.04,
          ease: 'power4.out',
          delay: delay,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%',
          }
        }
      );
    }
  }, { scope: containerRef });

  if (!isString) {
    return <Component className={className}>{children}</Component>;
  }

  return (
    <Component ref={containerRef} className={className}>
      {segments.map((segment, index) => {
        // Handle spaces for character split
        if (splitType === 'char' && segment === ' ') {
          return <span key={index} className="inline-block w-[0.25em]">&nbsp;</span>;
        }
        return (
          <span key={index} className="inline-block whitespace-pre">
            <span className="inline-block overflow-hidden align-bottom pb-2 -mb-2">
              <span className="reveal-segment inline-block transform translate-y-[120%] opacity-0 origin-bottom-left">
                {segment}
              </span>
            </span>
            {splitType === 'word' && index !== segments.length - 1 && ' '}
          </span>
        );
      })}
    </Component>
  );
};

export default TextReveal;
