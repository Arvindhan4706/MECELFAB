"use client";
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { Calendar, User, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const IMAGE_FALLBACKS = {
  'Erection':               '/images/project-erection.png',
  'Fabrication':            '/images/project-fabrication.png',
  'Hydraulic & Pneumatic':  '/images/project-maintenance.png',
  'Generator Services':     '/images/project-electrical.png',
  'AMC':                    '/images/project-maintenance.png',
  'Rental':                 '/images/project-commercial.png',
  'Turbocharger':           '/images/project-maintenance.png',
  'default':                '/images/project-fabrication.png',
};

const ProjectsGallery = ({ projects = [] }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const containerRef = useRef(null);
  const gridRef = useRef(null);

  // Derive real categories from DB data
  const rawCategories = ['All', ...Array.from(new Set(projects.map(p => p.category).filter(Boolean)))];
  const categories = rawCategories.length > 1 ? rawCategories
    : ['All', 'Erection', 'Fabrication', 'Hydraulic & Pneumatic', 'Generator Services', 'AMC', 'Rental', 'Turbocharger'];

  const filteredProjects = activeFilter === 'All'
    ? projects
    : projects.filter(p => p.category === activeFilter);

  useGSAP(() => {
    // Header Animation
    gsap.fromTo('.gallery-header',
      { y: 30, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.15,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%'
        }
      }
    );
  }, { scope: containerRef });

  // Handle filtering animation
  useEffect(() => {
    if (gridRef.current) {
      const cards = gridRef.current.children;
      gsap.fromTo(cards,
        { opacity: 0, scale: 0.95, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out', clearProps: 'all' }
      );
    }
  }, [activeFilter]);

  return (
    <section ref={containerRef} id="projects" className="section-padding bg-primary border-t border-white/5">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">
        <div className="gallery-header max-w-3xl mb-16">
          <span className="inline-block text-secondary text-sm font-heading tracking-widest uppercase mb-6 relative after:hidden md:after:block after:content-[''] after:absolute after:top-1/2 after:-right-12 after:w-8 after:h-[1px] after:bg-secondary/50">
            Our Portfolio
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-heading font-light text-white tracking-tight mb-8">
            Featured Projects
          </h2>
          <p className="text-lg text-secondary font-light leading-relaxed max-w-2xl">
            Explore our recently executed contracts. Filter projects by engineering discipline to inspect our work quality and execution compliance.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex overflow-x-auto whitespace-nowrap gap-3 mb-16 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`flex-shrink-0 px-6 py-2.5 min-h-[44px] rounded-full text-sm font-heading tracking-widest uppercase transition-all duration-300 ${
                activeFilter === cat 
                  ? 'bg-white text-primary border border-white' 
                  : 'bg-transparent text-secondary border border-white/10 hover:border-white/30 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => {
              const imgSrc = project.image
                || IMAGE_FALLBACKS[project.category]
                || IMAGE_FALLBACKS.default;

              return (
              <div
                key={project.id}
                className="group flex flex-col bg-white/[0.02] border border-white/5 rounded-none overflow-hidden hover:border-white/20 transition-colors duration-500"
              >
                {/* Project Image Wrapper with Clip Path Reveal logic (handled via simple hover for now) */}
                <div className="relative h-64 overflow-hidden bg-primary-light">
                  <Image
                    src={imgSrc}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-center transform transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-primary/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 backdrop-blur-sm">
                    <Link 
                      href={`/projects/${project.slug}`} 
                      className="px-8 py-3 bg-white text-primary font-heading uppercase tracking-widest text-sm rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 hover:scale-105"
                    >
                      View Project
                    </Link>
                  </div>
                  
                  {/* Category Badge */}
                  <span className="absolute top-4 left-4 bg-primary/90 border border-white/10 text-white px-3 py-1 text-xs font-heading tracking-widest uppercase z-20 backdrop-blur-md">
                    {project.category}
                  </span>
                  
                  {/* Status Badge */}
                  <span className={`absolute top-4 right-4 px-3 py-1 text-xs font-heading tracking-widest uppercase z-20 backdrop-blur-md text-primary font-bold ${
                    project.status === 'Completed' ? 'bg-emerald-500/90' : 'bg-amber-500/90'
                  }`}>
                    {project.status}
                  </span>
                </div>

                {/* Project Details */}
                <div className="p-5 sm:p-6 md:p-8 flex flex-col flex-grow">
                  <h3 className="text-xl font-heading font-light text-white mb-3">
                    {project.title}
                  </h3>
                  <p className="text-secondary text-sm font-light leading-relaxed mb-8 flex-grow">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-6 pt-6 border-t border-white/5 text-xs text-secondary font-light">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-white" />
                      <span>{project.client}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-white" />
                      <span>{project.year}</span>
                    </div>
                  </div>
                </div>
              </div>
            )})}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] border border-white/5 rounded-lg text-center">
            <h3 className="text-2xl md:text-3xl font-heading font-light text-white mb-4">
              PROJECTS COMING SOON
            </h3>
            <p className="text-secondary font-light max-w-lg mx-auto">
              Our project portfolio is currently being updated with our latest industrial executions. Check back soon for verified case studies.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectsGallery;
