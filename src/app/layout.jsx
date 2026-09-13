import { CMSProvider } from '../context/CMSContext';
import I18nProvider from '../context/I18nProvider';
import AuthProvider from '../context/AuthProvider';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MobileActionBar from '../components/MobileActionBar';
import Analytics from '../components/Analytics';
import SmoothScroller from '../components/SmoothScroller';
import SplashIntro from '../components/SplashIntro';
import '../index.css';
import { getCompanyProfile } from '@/lib/companyConfig';
import { validateEnv } from '@/lib/validateEnv';
import { Inter, Space_Grotesk } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], variable: '--font-inter', display: 'swap' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk', display: 'swap' });

validateEnv();


export const metadata = {
  title: 'MECELFAB INDUSTRIAL SOLUTIONS PRIVATE LIMITED',
  description: 'Industrial mechanical services, fabrication, generator solutions, rentals, and hydraulic/pneumatic system overhauling in India.',
  metadataBase: new URL('https://mecelfabpvtltd.com'),
  openGraph: {
    title: 'MECELFAB INDUSTRIAL SOLUTIONS',
    description: 'Industrial mechanical services, fabrication, generator solutions, rentals, and hydraulic/pneumatic system overhauling in India.',
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
    description: 'Industrial mechanical services, fabrication, generator solutions, rentals, and hydraulic/pneumatic system overhauling.',
    images: ['/images/hero-bg.png'],
  },
  icons: {
    icon: [
      { url: '/images/logo-mark.jpeg', type: 'image/jpeg' },
    ],
    shortcut: '/images/logo-mark.jpeg',
    apple: '/images/logo-mark.jpeg',
  },
  manifest: '/manifest.json',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
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
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body suppressHydrationWarning>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded focus:font-heading focus:text-sm"
        >
          Skip to main content
        </a>
        <AuthProvider>
          <I18nProvider>
            <SmoothScroller>
              <CMSProvider>
                <SplashIntro />
                <Analytics />
                <Navbar contact={company} />
                <main id="main-content" className="flex-grow pb-16 md:pb-0">{children}</main>
                <Footer contact={company} />
                <MobileActionBar phone={company.phone} whatsapp={company.whatsapp || company.phone} />
                {/* Floating CTA */}
              </CMSProvider>
            </SmoothScroller>
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
