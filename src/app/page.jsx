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
  description: 'Premier industrial mechanical services — fabrication, erection, generator solutions, hydraulic overhauling, AMC, and equipment rental across India. ISO 9001 & ISO 45001 certified.',
  openGraph: {
    title: 'MECELFAB Industrial Solutions',
    description: 'Premier industrial mechanical services — fabrication, erection, generator solutions, hydraulic overhauling, AMC, and equipment rental across India.',
    url: 'https://mecelfabpvtltd.com',
    siteName: 'MECELFAB',
    images: [{ url: '/images/hero-bg.png', width: 1200, height: 630, alt: 'MECELFAB Industrial Solutions' }],
    locale: 'en_US',
    type: 'website',
  },
};

export default async function HomePage() {
  // Fetch active projects and services
  const projects = await db.project.findMany({
    where: { status: { not: 'DISABLED' } },
    orderBy: { createdAt: 'desc' }
  });
  const services = await db.service.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'asc' }
  });

  // Fetch stats and content
  const settings = await db.setting.findMany({
    where: { 
      OR: [
        { key: { startsWith: 'stats_' } },
        { key: 'CONTENT_HOMEPAGE' }
      ]
    }
  });

  // Fetch clients and testimonials
  const clients = await db.client.findMany();
  const testimonials = await db.testimonial.findMany();

  const stats = {
    projectsCompleted: settings.find(s => s.key === 'stats_projectsCompleted')?.value || '0',
    industrialClients: settings.find(s => s.key === 'stats_industrialClients')?.value || '0',
    serviceCategories: settings.find(s => s.key === 'stats_serviceCategories')?.value || '8',
    safetyCompliance: settings.find(s => s.key === 'stats_safetyCompliance')?.value || '0',
  };

  const homepageContent = settings.find(s => s.key === 'CONTENT_HOMEPAGE')?.value 
    ? JSON.parse(settings.find(s => s.key === 'CONTENT_HOMEPAGE').value) 
    : null;

  return (
    <>
      <Hero content={homepageContent} />
      <TrustSection stats={stats} />
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
