"use client";
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, Play, Image as ImageIcon, Video, X } from 'lucide-react';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { DEFAULT_PROJECTS } from '@/data/projectsData';

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
  const [activeVideoModal, setActiveVideoModal] = useState(null);
  const containerRef = useRef(null);
  const gridRef = useRef(null);

  const effectiveProjects = (projects && projects.length > 0) ? projects : DEFAULT_PROJECTS;

  // Derive real categories from project data
  const rawCategories = ['All', ...Array.from(new Set(effectiveProjects.map(p => p.category).filter(Boolean)))];
  const categories = rawCategories.length > 1 ? rawCategories
    : ['All', 'Hydraulic & Pneumatic', 'Generator Services', 'Fabrication', 'Erection'];

  const filteredProjects = activeFilter === 'All'
    ? effectiveProjects
    : effectiveProjects.filter(p => p.category === activeFilter);

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

  // Helper to parse media info
  const getMediaInfo = (project) => {
    let list = [];
    if (project.mediaList && Array.isArray(project.mediaList)) {
      list = project.mediaList;
    } else {
      try {
        const parsed = typeof project.images === 'string' ? JSON.parse(project.images) : (project.images || []);
        list = parsed.map(url => ({
          type: url.endsWith('.mp4') ? 'video' : 'image',
          url
        }));
      } catch {
        if (project.image) list.push({ type: 'image', url: project.image });
      }
    }
    const videos = list.filter(m => m.type === 'video' || (typeof m === 'string' && m.endsWith('.mp4')));
    const images = list.filter(m => m.type === 'image' || (typeof m === 'string' && !m.endsWith('.mp4')));
    const hasVideo = videos.length > 0 || !!project.video;
    const firstVideoUrl = videos[0]?.url || (typeof videos[0] === 'string' ? videos[0] : project.video);

    return {
      totalMedia: list.length,
      imageCount: images.length,
      videoCount: videos.length,
      hasVideo,
      firstVideoUrl
    };
  };

  return (
    <section ref={containerRef} id="projects" className="section-padding bg-primary border-t border-white/5">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">
        <div className="gallery-header max-w-3xl mb-16">
          <span className="inline-block text-secondary text-sm font-heading tracking-widest uppercase mb-6 relative after:hidden md:after:block after:content-[''] after:absolute after:top-1/2 after:-right-12 after:w-8 after:h-[1px] after:bg-secondary/50">
            Our Portfolio
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-heading font-light text-white tracking-tight mb-8">
            Featured Projects
          </h1>
          <p className="text-lg text-secondary font-light leading-relaxed max-w-2xl">
            Explore our recently executed contracts. Filter projects by engineering discipline to inspect our workshop overhauls, on-site erections, and live machinery testing.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex overflow-x-auto whitespace-nowrap gap-3 mb-16 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              aria-pressed={activeFilter === cat}
              className={`flex-shrink-0 px-6 py-2.5 min-h-[44px] rounded-full text-sm font-heading tracking-widest uppercase transition-all duration-300 ${
                activeFilter === cat 
                  ? 'bg-white text-primary border border-white font-medium shadow-lg shadow-white/10' 
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
              
              const mediaInfo = getMediaInfo(project);

              return (
                <div
                  key={project.id || project.slug}
                  className="group flex flex-col bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden hover:border-accent/40 transition-all duration-500 hover:shadow-2xl hover:shadow-accent/5 flex-grow"
                >
                  {/* Media Wrapper */}
                  <div className="relative h-64 overflow-hidden bg-primary-light">
                    <Image
                      src={imgSrc}
                      alt={project.title}
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
                    />
                    
                    {/* Dark gradient overlay for contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-black/30 pointer-events-none" />

                    {/* Category Badge */}
                    <span className="absolute top-4 left-4 bg-primary/90 border border-white/10 text-white px-3 py-1 text-xs font-heading tracking-widest uppercase z-20 backdrop-blur-md rounded">
                      {project.category}
                    </span>

                    {/* Media Type & Count Badges */}
                    <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                      {mediaInfo.hasVideo && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-heading font-medium tracking-wider uppercase bg-accent text-white rounded shadow-md backdrop-blur-md animate-pulse">
                          <Video size={12} />
                          {mediaInfo.videoCount > 1 ? `${mediaInfo.videoCount} Videos` : 'Live Video'}
                        </span>
                      )}
                      {mediaInfo.imageCount > 1 && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-heading font-medium tracking-wider uppercase bg-white/20 text-white rounded border border-white/20 backdrop-blur-md">
                          <ImageIcon size={12} />
                          {mediaInfo.imageCount} Photos
                        </span>
                      )}
                    </div>

                    {/* Video Quick Play Trigger or Link Overlay */}
                    {mediaInfo.hasVideo && mediaInfo.firstVideoUrl ? (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setActiveVideoModal({
                              title: project.title,
                              url: mediaInfo.firstVideoUrl
                            });
                          }}
                          aria-label={`Play video for ${project.title}`}
                          className="w-14 h-14 rounded-full bg-accent/90 hover:bg-accent text-white flex items-center justify-center shadow-xl shadow-accent/30 transition-transform duration-300 hover:scale-110 group-hover:scale-105 backdrop-blur-sm"
                        >
                          <Play size={24} className="fill-white translate-x-0.5" />
                        </button>
                      </div>
                    ) : (
                      <Link 
                        href={`/projects/${project.slug}`}
                        className="absolute inset-0 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 backdrop-blur-xs bg-primary/40"
                      >
                        <span className="px-6 py-2.5 bg-white text-primary font-heading uppercase tracking-widest text-xs font-medium rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                          View Project
                        </span>
                      </Link>
                    )}

                    {/* Mobile-visible CTA */}
                    <Link
                      href={`/projects/${project.slug}`}
                      className="absolute bottom-3 right-3 md:hidden z-20 px-3 py-1.5 bg-white/10 border border-white/20 text-white text-[10px] font-heading tracking-widest uppercase rounded backdrop-blur-sm"
                    >
                      View Details →
                    </Link>
                  </div>

                  {/* Project Details */}
                  <div className="p-6 flex flex-col flex-grow">
                    <Link href={`/projects/${project.slug}`} className="hover:text-accent transition-colors">
                      <h3 className="text-lg md:text-xl font-heading font-normal text-white mb-3 line-clamp-2 leading-snug">
                        {project.title}
                      </h3>
                    </Link>
                    <p className="text-secondary text-sm font-light leading-relaxed mb-6 flex-grow line-clamp-3">
                      {project.description}
                    </p>

                    <div className="flex items-center justify-between pt-5 border-t border-white/5 text-xs text-secondary font-light mt-auto">
                      <div className="flex items-center gap-2">
                        <User size={13} className="text-accent" />
                        <span className="truncate max-w-[150px]">{project.client}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-accent" />
                        <span>{project.year || '2026'}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                      <Link
                        href={`/projects/${project.slug}`}
                        className="text-xs font-heading tracking-widest uppercase text-accent hover:text-white transition-colors flex items-center gap-1.5 font-medium"
                      >
                        Explore Project Specs →
                      </Link>
                      {mediaInfo.hasVideo && (
                        <button
                          onClick={() => setActiveVideoModal({
                            title: project.title,
                            url: mediaInfo.firstVideoUrl
                          })}
                          className="text-[11px] font-heading tracking-wider uppercase text-white/70 hover:text-accent flex items-center gap-1 transition-colors"
                        >
                          <Play size={10} className="fill-current" /> Watch Clip
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12">
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-8 md:p-12 text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-heading font-light text-white mb-4">
                Project Experience & Capabilities
              </h3>
              <p className="text-secondary font-light max-w-2xl mx-auto mb-8">
                Our verified project portfolio is being compiled. Below is an overview of the sectors, project types, and service disciplines we execute.
              </p>
              <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-heading text-xs tracking-widest uppercase hover:bg-white/90 transition-colors duration-300">
                REQUEST RFQ
              </Link>
            </div>
          </div>
        )}

        {/* Video Lightbox Modal */}
        {activeVideoModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md animate-fade-in"
            onClick={() => setActiveVideoModal(null)}
          >
            <div 
              className="relative w-full max-w-4xl bg-primary border border-white/20 rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent animate-ping" />
                  <h4 className="text-white font-heading text-sm md:text-base tracking-wide truncate max-w-xl">
                    {activeVideoModal.title}
                  </h4>
                </div>
                <button
                  onClick={() => setActiveVideoModal(null)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label="Close video"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Video Player */}
              <div className="relative aspect-video bg-black flex items-center justify-center">
                <video
                  src={activeVideoModal.url}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3 bg-white/[0.02] border-t border-white/10 flex items-center justify-between text-xs text-secondary">
                <span>Verified MECELFAB field test footage</span>
                <span className="text-accent">Official Inspection Documentation</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectsGallery;
