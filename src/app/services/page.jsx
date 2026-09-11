import Services from '../../components/Services';
import WhyChooseUs from '../../components/WhyChooseUs';
import { db } from '@/lib/db';

export const revalidate = 60;

export const metadata = {
  title: 'Our Services | MECELFAB Industrial Solutions',
  description: 'Explore MECELFAB industrial services — fabrication, erection, hydraulic overhauling, generator spare parts, AMC, generator rental, compressor rental, and turbocharger services.',
  openGraph: {
    title: 'Our Services | MECELFAB Industrial Solutions',
    description: 'Explore MECELFAB industrial services — fabrication, erection, hydraulic overhauling, generator spare parts, AMC, generator rental, compressor rental, and turbocharger services.',
    url: 'https://mecelfabpvtltd.com/services',
    images: [{ url: '/images/hero-bg.png', width: 1200, height: 630, alt: 'MECELFAB Services' }],
    type: 'website',
  },
  alternates: {
    canonical: 'https://mecelfabpvtltd.com/services',
  },
};

export default async function ServicesPage() {
  let services = [];
  try {
    services = await db.service.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' }
    });
  } catch {
    // DB unavailable — render with empty services (empty state will show)
  }

  return (
    <div className="page-wrapper pt-20">
      <Services services={services} />
      <WhyChooseUs />
    </div>
  );
}
