import Industries from '../../components/Industries';

export const metadata = {
  title: 'Industries We Serve | MECELFAB Industrial Solutions',
  description: 'MECELFAB serves manufacturing, power & energy, industrial maintenance, and commercial sectors with fabrication, erection, power, and maintenance solutions.',
  openGraph: {
    title: 'Industries We Serve | MECELFAB Industrial Solutions',
    description: 'MECELFAB serves manufacturing, power & energy, industrial maintenance, and commercial sectors with fabrication, erection, power, and maintenance solutions.',
    url: 'https://mecelfabpvtltd.com/industries',
    images: [{ url: '/images/hero-bg.png', width: 1200, height: 630, alt: 'MECELFAB Industries' }],
    type: 'website',
  },
  alternates: {
    canonical: 'https://mecelfabpvtltd.com/industries',
  },
};

export default function IndustriesPage() {
  return (
    <div className="page-wrapper">
      <Industries />
    </div>
  );
}
