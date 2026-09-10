import Contact from '../../components/Contact';
import { db } from '@/lib/db';
import { getCompanyProfile } from '@/lib/companyConfig';

export const revalidate = 60;

export const metadata = {
  title: 'Contact Us | MECELFAB Industrial Solutions',
  description: 'Request a quotation or technical consultation from MECELFAB Industrial Solutions. Phone, email, WhatsApp, and online RFQ form available.',
};

export default async function ContactPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const initialServiceSlug = resolvedParams?.service || '';

  const services = await db.service.findMany({
    where: { status: 'ACTIVE' },
    select: { title: true, slug: true }
  });

  const initialService = services.find(s => s.slug === initialServiceSlug)?.title || '';

  const company = await getCompanyProfile();

  return (
    <div className="page-wrapper">
      <Contact services={services} content={company} initialService={initialService} />
    </div>
  );
}
