import About from '../../components/About';
import VisionMission from '../../components/VisionMission';
import QualitySafety from '../../components/QualitySafety';
import { db } from '@/lib/db';

export const revalidate = 60;

export const metadata = {
  title: 'About Us | MECELFAB Industrial Solutions',
  description: 'Learn about MECELFAB Industrial Solutions — our vision, mission, quality systems, and commitment to industrial engineering excellence across India.',
  openGraph: {
    title: 'About Us | MECELFAB Industrial Solutions',
    description: 'Learn about MECELFAB Industrial Solutions — our vision, mission, quality systems, and commitment to industrial engineering excellence across India.',
    url: 'https://mecelfabpvtltd.com/about',
    images: [{ url: '/images/hero-bg.png', width: 1200, height: 630, alt: 'About MECELFAB' }],
    type: 'website',
  },
  alternates: {
    canonical: 'https://mecelfabpvtltd.com/about',
  },
};

export default async function AboutPage() {
  const settings = await db.setting.findMany({
    where: { key: 'CONTENT_ABOUT' }
  });
  
  const aboutContent = settings.length > 0 && settings[0].value 
    ? (() => { try { return JSON.parse(settings[0].value); } catch { return null; } })()
    : null;

  return (
    <div className="page-wrapper">
      <About content={aboutContent} />
      <VisionMission />
      <QualitySafety />
    </div>
  );
}
