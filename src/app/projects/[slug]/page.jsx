import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, CheckCircle } from 'lucide-react';
import { db } from '@/lib/db';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = await db.project.findUnique({
    where: { slug }
  });
  if (!project) return { title: 'Project Not Found' };

  return {
    title: `${project.title} | MECELFAB Industrial Solutions`,
    description: project.description,
    alternates: {
      canonical: `https://mecelfabpvtltd.com/projects/${slug}`,
    },
    openGraph: {
      title: project.title,
      description: project.description,
      images: [project.image],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.description,
      images: [project.image],
    },
  };
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  let project;
  try {
    project = await db.project.findUnique({
      where: { slug }
    });
  } catch {
    project = null;
  }

  if (!project) {
    notFound();
  }

  // Extract industry from category or use a mapping
  const industryMap = {
    'Fabrication Works': 'Manufacturing',
    'Erection Works': 'Construction',
    'Electrical Works': 'Energy',
    'Turbocharger Services': 'Heavy Machinery',
    'Industrial Maintenance': 'Manufacturing',
    'Other': 'Commercial'
  };

  const industry = industryMap[project.category] || 'Industrial';

  return (
    <div style={{ paddingTop: 'clamp(80px, 15vw, 100px)', paddingBottom: 'clamp(60px, 10vw, 100px)', backgroundColor: 'var(--bg-dark)' }}>
      <div className="container">
        <Link href="/#projects" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', marginBottom: '2rem', textDecoration: 'none', fontWeight: 600 }}>
          <ArrowLeft size={20} />
          Back to Portfolio
        </Link>

        <div className="glass-panel" style={{ padding: 'clamp(1rem, 4vw, 3rem)', background: 'rgba(15, 23, 42, 0.4)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }} className="project-grid">
            <div>
              <span className="section-badge">{project.category}</span>
              <h1 style={{ fontSize: '2.5rem', color: 'var(--white)', marginBottom: '1rem', marginTop: '1rem' }}>{project.title}</h1>

              {/* HERO SECTION - Enhanced per Master Prompt */}
              <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <span className="bg-primary-light text-secondary text-xs font-heading px-3 py-1 rounded">{industry}</span>
                </div>
                <p style={{ color: '#94A3B8', fontSize: '1.125rem', lineHeight: 1.6, maxWidth: '600px' }}>
                  {project.description.split('.')[0]}. {project.description.split('.')[1] || ''}
                </p>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem', color: '#94A3B8' }}>
                {project.client && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={18} style={{ color: 'var(--accent)' }} />
                    <span><strong>Client:</strong> {project.client}</span>
                  </div>
                )}
                {project.year && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={18} style={{ color: 'var(--accent)' }} />
                    <span><strong>Year:</strong> {project.year}</span>
                  </div>
                )}
                {industry && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--accent)' }}><strong>Industry:</strong> {industry}</span>
                  </div>
                )}
                {project.category && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--accent)' }}><strong>Scope:</strong> {project.category}</span>
                  </div>
                )}
                {project.status && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={18} style={{ color: 'var(--accent)' }} />
                    <span><strong>Status:</strong> {project.status}</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ position: 'relative', width: '100%', height: 'clamp(250px, 50vw, 400px)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '2rem' }}>
              <Image src={project.image} alt={project.title} fill loading="lazy" sizes="(max-width: 768px) 100vw, 768px" style={{ objectFit: 'cover' }} />
            </div>
          </div>
        </div>

        <div style={{ padding: '3rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: 'var(--radius-lg)', marginTop: '3rem' }}>
          {/* Project Details */}
          {project.description && (
            <>
              <h3 style={{ fontSize: '1.75rem', color: 'var(--white)', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                PROJECT OVERVIEW
              </h3>
              <p style={{ color: '#94A3B8', lineHeight: 1.8, marginBottom: '2rem' }}>
                {project.description}
              </p>
            </>
          )}

          {/* Key Facts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {project.client && (
              <div>
                <p style={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Client</p>
                <p style={{ color: 'var(--white)', fontSize: '0.875rem' }}>{project.client}</p>
              </div>
            )}
            {project.category && (
              <div>
                <p style={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Category</p>
                <p style={{ color: 'var(--white)', fontSize: '0.875rem' }}>{project.category}</p>
              </div>
            )}
            {project.year && (
              <div>
                <p style={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Year</p>
                <p style={{ color: 'var(--white)', fontSize: '0.875rem' }}>{project.year}</p>
              </div>
            )}
            {project.status && (
              <div>
                <p style={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Status</p>
                <p style={{ color: 'var(--white)', fontSize: '0.875rem' }}>{project.status}</p>
              </div>
            )}
          </div>

          {/* PROJECT OUTCOMES */}
          <h3 style={{ fontSize: '1.75rem', color: 'var(--white)', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
            PROJECT OUTCOMES
          </h3>
          <p style={{ color: '#94A3B8', lineHeight: 1.8, fontSize: '0.875rem' }}>
            Detailed project outcomes and verified results will be published upon client approval.
          </p>
        </div>
      </div>
    </div>
  );
}