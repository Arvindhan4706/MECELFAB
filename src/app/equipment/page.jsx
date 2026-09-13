import EquipmentCatalogView from '@/components/EquipmentCatalogView';

export const metadata = {
  title: 'Equipment & Capabilities Catalog | MECELFAB Industrial Solutions',
  description: 'Explore industrial equipment types, capacity ranges, and verified brand families serviced and deployed by MECELFAB — generators, compressors, hydraulic power packs, and turbochargers.',
  openGraph: {
    title: 'Industrial Equipment Catalog | MECELFAB Industrial Solutions',
    description: 'Explore industrial equipment types, capacity ranges, and verified brand families serviced and deployed by MECELFAB.',
    url: 'https://mecelfabpvtltd.com/equipment',
    images: [{ url: '/images/hero-bg.png', width: 1200, height: 630, alt: 'MECELFAB Equipment' }],
    type: 'website',
  },
  alternates: { canonical: 'https://mecelfabpvtltd.com/equipment' },
};

export default function EquipmentPage() {
  return <EquipmentCatalogView />;
}
