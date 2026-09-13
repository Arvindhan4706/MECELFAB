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
  const initialEquipmentSlug = resolvedParams?.equipment || '';
  const initialIndustrySlug = resolvedParams?.industry || '';
  const initialProjectTitle = resolvedParams?.project || '';

  let services = [];
  let initialService = '';
  let initialDescription = '';
  let prefillEquipment = null;
  let company = {};

  // Equipment lookup if provided
  if (initialEquipmentSlug) {
    const { getEquipmentBySlug } = await import('@/lib/equipmentData');
    const eq = getEquipmentBySlug(initialEquipmentSlug);
    if (eq) {
      prefillEquipment = eq;
      initialDescription = `Inquiry regarding ${eq.title} (${eq.capacityRange}). Scope of requirement: `;
      // Map equipment category to standard service
      const categoryToServiceSlug = {
        'power-generation': 'generator-rental',
        'compressed-air': 'air-compressor-rental',
        'hydraulics-pneumatics': 'hydraulic-pneumatic-overhauling',
        'turbochargers': 'turbocharger-services',
        'machinery-rigging': 'industrial-erection',
      };
      if (!initialServiceSlug && categoryToServiceSlug[eq.category]) {
        // Will be matched against fetched services below
      }
    }
  } else if (initialProjectTitle) {
    initialDescription = `Inquiry regarding project execution: ${initialProjectTitle}. `;
  } else if (initialIndustrySlug) {
    initialDescription = `Inquiry regarding industrial solutions for sector: ${initialIndustrySlug.replace(/-/g, ' ').toUpperCase()}. `;
  }

  try {
    services = await db.service.findMany({
      where: { status: 'ACTIVE' },
      select: { title: true, slug: true }
    });

    if (initialServiceSlug) {
      initialService = services.find(s => s.slug === initialServiceSlug)?.title || '';
    } else if (prefillEquipment) {
      const categoryToServiceSlug = {
        'power-generation': 'generator-rental',
        'compressed-air': 'air-compressor-rental',
        'hydraulics-pneumatics': 'hydraulic-pneumatic-overhauling',
        'turbochargers': 'turbocharger-services',
        'machinery-rigging': 'industrial-erection',
      };
      const mappedSlug = categoryToServiceSlug[prefillEquipment.category];
      initialService = services.find(s => s.slug === mappedSlug)?.title || '';
    }

    company = await getCompanyProfile();
  } catch {
    // DB unavailable — render with empty data
  }

  return (
    <div className="page-wrapper">
      <Contact 
        services={services} 
        content={company} 
        initialService={initialService}
        initialDescription={initialDescription}
        prefillEquipment={prefillEquipment}
      />
    </div>
  );
}
