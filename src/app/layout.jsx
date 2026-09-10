import { CMSProvider } from '../context/CMSContext';
import I18nProvider from '../context/I18nProvider';
import AuthProvider from '../context/AuthProvider';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SmoothScroller from '../components/SmoothScroller';
import '../index.css';
import { getCompanyProfile } from '@/lib/companyConfig';
import { validateEnv } from '@/lib/validateEnv';

// Validate required environment variables at startup.
// This will throw clearly if any critical var is missing.
validateEnv();


export const metadata = {
  title: 'MECELFAB INDUSTRIAL SOLUTIONS PRIVATE LIMITED',
  description: 'Premier industrial mechanical services, fabrication, generator solutions, rentals, and hydraulic/pneumatic system overhauling in India.',
  metadataBase: new URL('https://mecelfabpvtltd.com'),
  openGraph: {
    title: 'MECELFAB INDUSTRIAL SOLUTIONS',
    description: 'Premier industrial mechanical services, fabrication, generator solutions, rentals, and hydraulic/pneumatic system overhauling in India.',
    url: 'https://mecelfabpvtltd.com',
    siteName: 'MECELFAB',
    images: [
      {
        url: '/images/hero-bg.png',
        width: 1200,
        height: 630,
        alt: 'MECELFAB Industrial Solutions',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MECELFAB INDUSTRIAL SOLUTIONS',
    description: 'Premier industrial mechanical services, fabrication, generator solutions, rentals, and hydraulic/pneumatic system overhauling.',
    images: ['/images/hero-bg.png'],
  },
  alternates: {
    canonical: 'https://mecelfabpvtltd.com',
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({ children }) {
  const company = await getCompanyProfile();

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.legalName,
    alternateName: company.shortName,
    url: company.websiteUrl,
    logo: `${company.websiteUrl}/favicon.svg`,
    description: company.description,
    ...(company.email ? { email: company.email } : {}),
    ...(company.phone ? { telephone: company.phone } : {}),
    address: {
      '@type': 'PostalAddress',
      addressCountry: company.country,
      ...(company.address ? { streetAddress: company.address } : {}),
    },
  };

  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <I18nProvider>
            <SmoothScroller>
              <CMSProvider>
                <Navbar contact={company} />
                <main className="flex-grow">{children}</main>
                <Footer contact={company} />
                {/* Floating CTA */}
              </CMSProvider>
            </SmoothScroller>
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
