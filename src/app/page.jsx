import Hero from '../components/Hero';
import TrustSection from '../components/TrustSection';
import Services from '../components/Services';
import EngineeringWorkflow from '../components/EngineeringWorkflow';
import Industries from '../components/Industries';
import ProjectsGallery from '../components/ProjectsGallery';
import ServiceFinder from '../components/ServiceFinder';
import WhyChooseUs from '../components/WhyChooseUs';
import ClientLogos from '../components/ClientLogos';
import Testimonials from '../components/Testimonials';
import { db } from '@/lib/db';

export const revalidate = 60;

export const metadata = {
  title: 'MECELFAB Industrial Solutions | Fabrication, Erection, Power & Maintenance',
    description: 'Industrial mechanical services — fabrication, erection, generator solutions, hydraulic overhauling, AMC, and equipment rental across Tamil Nadu and South India. ISO 9001 & ISO 45001 certified.',
  openGraph: {
    title: 'MECELFAB Industrial Solutions',
    description: 'Industrial mechanical services — fabrication, erection, generator solutions, hydraulic overhauling, AMC, and equipment rental across Tamil Nadu and South India.',
    url: 'https://mecelfabpvtltd.com',
    siteName: 'MECELFAB',
    images: [{ url: '/images/hero-bg.png', width: 1200, height: 630, alt: 'MECELFAB Industrial Solutions' }],
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://mecelfabpvtltd.com',
  },
};

export default async function HomePage() {
  let projects = [], services = [], settings = [], clients = [], testimonials = [];
  try {
    [projects, services, settings, clients, testimonials] = await Promise.all([
      db.project.findMany({
        where: { status: { not: 'DISABLED' } },
        orderBy: { createdAt: 'desc' }
      }),
      db.service.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'asc' }
      }),
      db.setting.findMany({
        where: { 
          OR: [
            { key: { startsWith: 'stats_' } },
            { key: 'CONTENT_HOMEPAGE' }
          ]
        }
      }),
      db.client.findMany(),
      db.testimonial.findMany(),
    ]);
  } catch {
    // DB unavailable — render with empty data
  }

  const homepageContent = settings.find(s => s.key === 'CONTENT_HOMEPAGE')?.value 
    ? (() => { try { return JSON.parse(settings.find(s => s.key === 'CONTENT_HOMEPAGE').value); } catch { return null; } })()
    : null;

  return (
    <>
      <Hero content={homepageContent} />
      <TrustSection />
      <Services services={services} />
      <EngineeringWorkflow />
      <Industries />
      <ProjectsGallery projects={projects} />
      <Testimonials testimonials={testimonials} />
      <ClientLogos clients={clients} />
      <WhyChooseUs />
      <ServiceFinder services={services} />
    </>
  );
}
