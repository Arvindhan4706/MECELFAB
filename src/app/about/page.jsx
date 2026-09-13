import About from '../../components/About';
import VisionMission from '../../components/VisionMission';
import QualitySafety from '../../components/QualitySafety';
import CompanyResources from '../../components/CompanyResources';
import { db } from '@/lib/db';

export const revalidate = 60;

export const metadata = {
  title: 'About Us | MECELFAB Industrial Solutions',
  description: 'Learn about MECELFAB Industrial Solutions — our engineering background, quality systems, company resources, and certifications.',
  openGraph: {
    title: 'About Us | MECELFAB Industrial Solutions',
    description: 'Learn about MECELFAB Industrial Solutions — our engineering background, quality systems, company resources, and certifications.',
    url: 'https://mecelfabpvtltd.com/about',
    images: [{ url: '/images/hero-bg.png', width: 1200, height: 630, alt: 'About MECELFAB' }],
    type: 'website',
  },
  alternates: {
    canonical: 'https://mecelfabpvtltd.com/about',
  },
};

export default async function AboutPage() {
  let aboutContent = null;
  let certifications = [];

  try {
    const [settings, certs] = await Promise.all([
      db.setting.findMany({ where: { key: 'CONTENT_ABOUT' } }),
      db.certification.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    aboutContent = settings.length > 0 && settings[0].value 
      ? (() => { try { return JSON.parse(settings[0].value); } catch { return null; } })()
      : null;
    certifications = certs || [];
  } catch {
    // DB unavailable — render with defaults
  }

  return (
    <div className="page-wrapper">
      <About content={aboutContent} />
      <VisionMission />
      <QualitySafety />
      <CompanyResources certifications={certifications} />
    </div>
  );
}
