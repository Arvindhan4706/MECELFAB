import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, CheckCircle, Video, ShieldCheck } from 'lucide-react';
import { db } from '@/lib/db';
import { DEFAULT_PROJECTS } from '@/data/projectsData';

export async function generateStaticParams() {
  try {
    const projects = await db.project.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true }
    });
    if (projects && projects.length > 0) {
      return projects.map((p) => ({ slug: p.slug }));
    }
  } catch {
    // Fall back to DEFAULT_PROJECTS
  }
  return DEFAULT_PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  let project = null;
  try {
    project = await db.project.findUnique({
      where: { slug }
    });
  } catch {
    // ignore DB errors
  }

  if (!project) {
    project = DEFAULT_PROJECTS.find(p => p.slug === slug);
  }

  if (!project) return { title: 'Project Not Found | MECELFAB' };

  return {
    title: `${project.title} | MECELFAB Industrial Solutions`,
    description: project.description,
    alternates: {
      canonical: `https://mecelfabpvtltd.com/projects/${slug}`,
    },
    openGraph: {
      title: project.title,
      description: project.description,
      images: [project.image || '/images/hero-bg.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.description,
      images: [project.image || '/images/hero-bg.png'],
    },
  };
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  let project = null;
  try {
    project = await db.project.findUnique({
      where: { slug }
    });
  } catch {
    project = null;
  }

  if (!project) {
    project = DEFAULT_PROJECTS.find(p => p.slug === slug);
  }

  if (!project) {
    notFound();
  }

  // Find fallback default project for rich mediaList if DB lacks mediaList
  const matchedDefault = DEFAULT_PROJECTS.find(p => p.slug === slug);

  // Extract industry mapping
  const industryMap = {
    'Fabrication': 'Heavy Manufacturing',
    'Fabrication Works': 'Manufacturing',
    'Erection': 'Infrastructure & Plant Setup',
    'Erection Works': 'Construction',
    'Hydraulic & Pneumatic': 'Precision Hydraulics & Heavy Machinery',
    'Generator Services': 'Power & Energy Systems',
    'Turbocharger Services': 'Heavy Machinery',
    'Industrial Maintenance': 'Manufacturing',
    'Other': 'Commercial'
  };

  const industry = industryMap[project.category] || 'Industrial Engineering';

  // Parse media items
  let mediaList = [];
  if (matchedDefault?.mediaList) {
    mediaList = matchedDefault.mediaList;
  } else if (project.images) {
    try {
      const parsed = typeof project.images === 'string' ? JSON.parse(project.images) : project.images;
      mediaList = parsed.map((item, idx) => ({
        type: typeof item === 'string' && item.endsWith('.mp4') ? 'video' : 'image',
        url: item,
        caption: `Project Documentation #${idx + 1}`
      }));
    } catch {
      mediaList = [];
    }
  }

  // Ensure main image is in mediaList if not already
  if (project.image && !mediaList.some(m => m.url === project.image)) {
    mediaList.unshift({
      type: 'image',
      url: project.image,
      caption: project.title
    });
  }

  const videoItems = mediaList.filter(m => m.type === 'video');
  const imageItems = mediaList.filter(m => m.type === 'image');
  const isPrimaryVideo = project.video || videoItems.length > 0 && !project.image;

  return (
    <div className="pt-28 pb-20 bg-primary min-h-screen text-white">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-6xl">
        {/* Navigation link */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-accent hover:text-white mb-8 transition-colors text-sm font-heading tracking-wider uppercase"
        >
          <ArrowLeft size={18} />
          Back to Projects Portfolio
        </Link>

        {/* Hero Card */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8 md:p-12 mb-12 shadow-2xl backdrop-blur-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 flex flex-col">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="bg-accent/20 border border-accent/40 text-accent text-xs font-heading tracking-widest uppercase px-3 py-1 rounded">
                  {project.category}
                </span>
                <span className="bg-white/10 text-white/80 text-xs font-heading tracking-wider uppercase px-3 py-1 rounded">
                  {industry}
                </span>
                {videoItems.length > 0 && (
                  <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-heading tracking-wider uppercase px-2.5 py-1 rounded flex items-center gap-1.5">
                    <Video size={12} />
                    {videoItems.length} Video{videoItems.length > 1 ? 's' : ''} Included
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-light tracking-tight text-white mb-6 leading-tight">
                {project.title}
              </h1>

              <p className="text-secondary text-base sm:text-lg font-light leading-relaxed mb-8">
                {project.description}
              </p>

              {/* Key metadata chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10 text-xs">
                <div>
                  <span className="block text-secondary text-[11px] uppercase tracking-wider mb-1">Client / Sector</span>
                  <div className="flex items-center gap-1.5 font-medium text-white">
                    <User size={13} className="text-accent shrink-0" />
                    <span className="truncate">{project.client || 'Confidential Client'}</span>
                  </div>
                </div>

                <div>
                  <span className="block text-secondary text-[11px] uppercase tracking-wider mb-1">Execution Year</span>
                  <div className="flex items-center gap-1.5 font-medium text-white">
                    <Calendar size={13} className="text-accent shrink-0" />
                    <span>{project.year || '2026'}</span>
                  </div>
                </div>

                <div>
                  <span className="block text-secondary text-[11px] uppercase tracking-wider mb-1">Compliance Status</span>
                  <div className="flex items-center gap-1.5 font-medium text-emerald-400">
                    <CheckCircle size={13} className="shrink-0" />
                    <span>{project.status || 'Completed'}</span>
                  </div>
                </div>

                <div>
                  <span className="block text-secondary text-[11px] uppercase tracking-wider mb-1">Quality Assurance</span>
                  <div className="flex items-center gap-1.5 font-medium text-accent">
                    <ShieldCheck size={13} className="shrink-0" />
                    <span>ISO Certified QA</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Media Showcase */}
            <div className="lg:col-span-5 relative w-full aspect-4/3 rounded-xl overflow-hidden border border-white/10 bg-primary-light shadow-xl">
              {isPrimaryVideo && matchedDefault?.video ? (
                <video
                  src={matchedDefault.video}
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : project.image ? (
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 450px"
                  className="object-cover object-center"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-secondary">
                  No preview available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Video Documentation Section (If Videos exist) */}
        {videoItems.length > 0 && (
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-0.5 bg-accent" />
              <h2 className="text-xl md:text-2xl font-heading font-light tracking-wide text-white uppercase">
                Operational Video Footage & Testing
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {videoItems.map((video, idx) => (
                <div
                  key={idx}
                  className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden p-4 flex flex-col"
                >
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4 border border-white/5">
                    <video
                      src={video.url}
                      poster={video.poster}
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-contain"
                    >
                      Your browser does not support HTML5 video.
                    </video>
                  </div>
                  <div className="flex items-start gap-2">
                    <Video size={16} className="text-accent shrink-0 mt-0.5" />
                    <p className="text-sm text-secondary font-light">
                      {video.caption || `Operational field recording #${idx + 1}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* High-Resolution Photo Gallery Section (If Multiple Photos exist) */}
        {imageItems.length > 0 && (
          <div className="mb-14">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="w-8 h-0.5 bg-accent" />
                <h2 className="text-xl md:text-2xl font-heading font-light tracking-wide text-white uppercase">
                  Workshop & Field Inspection Photos
                </h2>
              </div>
              <span className="text-xs text-secondary font-heading tracking-widest uppercase">
                {imageItems.length} High-Res Document{imageItems.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {imageItems.map((item, idx) => (
                <div
                  key={idx}
                  className="group bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:border-accent/40 flex flex-col"
                >
                  <div className="relative h-60 w-full overflow-hidden bg-primary-light">
                    <Image
                      src={item.url}
                      alt={item.caption || `${project.title} photo #${idx + 1}`}
                      fill
                      loading="lazy"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {item.caption && (
                    <div className="p-4 border-t border-white/5 bg-white/[0.01] flex-grow">
                      <p className="text-xs text-secondary font-light leading-relaxed">
                        {item.caption}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Engineering Overview & Execution Scope */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 sm:p-8 md:p-12 mb-12">
          <h3 className="text-xl md:text-2xl font-heading font-light text-white mb-6 border-b border-white/10 pb-4">
            Scope of Engineering & Execution
          </h3>
          <p className="text-secondary text-base font-light leading-relaxed mb-8">
            {project.content || project.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/5">
            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
              <h4 className="text-sm font-heading tracking-widest text-white uppercase mb-2">Quality Assurance</h4>
              <p className="text-xs text-secondary font-light leading-relaxed">
                Adheres strictly to ISO 9001:2015 quality control checklists, micrometric runout verification, and calibrated torque specifications.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
              <h4 className="text-sm font-heading tracking-widest text-white uppercase mb-2">Safety Compliance</h4>
              <p className="text-xs text-secondary font-light leading-relaxed">
                Executed under ISO 45001:2018 occupational safety protocols, certified rigging, PPE compliance, and zero-accident target execution.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
              <h4 className="text-sm font-heading tracking-widest text-white uppercase mb-2">Client Handover</h4>
              <p className="text-xs text-secondary font-light leading-relaxed">
                Comprehensive commissioning documentation including FAT/SAT reports, dynamic vibration logs, and warranty certificate.
              </p>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-accent/20 via-primary to-accent/10 border border-accent/30 text-center">
          <h3 className="text-2xl font-heading font-light text-white mb-3">
            Have a Similar Project Requirement?
          </h3>
          <p className="text-secondary text-sm max-w-xl mx-auto mb-6">
            Consult our engineering team for precision fabrication, on-site heavy erection, hydraulic rebuilds, or industrial generator support.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="px-8 py-3 bg-accent hover:bg-accent/90 text-white font-heading text-xs tracking-widest uppercase rounded-full shadow-lg transition-transform hover:scale-105"
            >
              Request Engineering RFQ
            </Link>
            <Link
              href="/projects"
              className="px-8 py-3 bg-transparent border border-white/20 hover:border-white text-white font-heading text-xs tracking-widest uppercase rounded-full transition-colors"
            >
              Browse All Projects
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}