import ProjectsGallery from '../../components/ProjectsGallery';
import TrustSection from '../../components/TrustSection';
import { db } from '@/lib/db';

export const revalidate = 60;

export const metadata = {
  title: 'Projects | MECELFAB Industrial Solutions',
  description: 'View MECELFAB project portfolio — industrial fabrication, erection, maintenance, power, and hydraulic projects across India.',
  openGraph: {
    title: 'Projects | MECELFAB Industrial Solutions',
    description: 'View MECELFAB project portfolio — industrial fabrication, erection, maintenance, power, and hydraulic projects across India.',
    url: 'https://mecelfabpvtltd.com/projects',
    images: [{ url: '/images/hero-bg.png', width: 1200, height: 630, alt: 'MECELFAB Projects' }],
    type: 'website',
  },
  alternates: {
    canonical: 'https://mecelfabpvtltd.com/projects',
  },
};

export default async function ProjectsPage() {
  const projects = await db.project.findMany({
    where: { status: { not: 'DISABLED' } },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="pt-24 bg-bg-dark min-h-screen">
      <ProjectsGallery projects={projects} />
      <TrustSection />
    </div>
  );
}
