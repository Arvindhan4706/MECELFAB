import Contact from '../../components/Contact';
import { db } from '@/lib/db';
import { getCompanyProfile } from '@/lib/companyConfig';

export const revalidate = 60;

export const metadata = {
  title: 'Contact Us | MECELFAB Industrial Solutions',
  description: 'Request a quotation or technical consultation from MECELFAB Industrial Solutions. Phone, email, WhatsApp, and online RFQ form available.',
  openGraph: {
    title: 'Contact Us | MECELFAB Industrial Solutions',
    description: 'Request a quotation or technical consultation from MECELFAB Industrial Solutions. Phone, email, WhatsApp, and online RFQ form available.',
    url: 'https://mecelfabpvtltd.com/contact',
    images: [{ url: '/images/hero-bg.png', width: 1200, height: 630, alt: 'Contact MECELFAB' }],
    type: 'website',
  },
  alternates: {
    canonical: 'https://mecelfabpvtltd.com/contact',
  },
};

export default async function ContactPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const initialServiceSlug = resolvedParams?.service || '';

  let services = [];
  let initialService = '';
  let company = {};
  try {
    services = await db.service.findMany({
      where: { status: 'ACTIVE' },
      select: { title: true, slug: true }
    });
    initialService = services.find(s => s.slug === initialServiceSlug)?.title || '';
    company = await getCompanyProfile();
  } catch {
    // DB unavailable — render with empty data
  }

  return (
    <div className="page-wrapper">
      <Contact services={services} content={company} initialService={initialService} />
    </div>
  );
}
