import Services from '../../components/Services';
import WhyChooseUs from '../../components/WhyChooseUs';
import { db } from '@/lib/db';

export const revalidate = 60;

export const metadata = {
  title: 'Our Services | MECELFAB Industrial Solutions',
  description: 'Explore MECELFAB industrial services — fabrication, erection, hydraulic overhauling, generator spare parts, AMC, generator rental, compressor rental, and turbocharger services.',
};

export default async function ServicesPage() {
  const services = await db.service.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'asc' }
  });

  return (
    <div className="page-wrapper pt-20">
      <Services services={services} />
      <WhyChooseUs />
    </div>
  );
}
