"use client";
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Phone, MessageCircle, FileText, X } from 'lucide-react';

export default function MobileActionBar({ phone, whatsapp }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (dismissed) return;
      const scrollY = window.scrollY;
      setVisible(scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dismissed]);

  if (dismissed) return null;

  const phoneClean = (phone || '').replace(/[^0-9+]/g, '');
  const whatsappClean = (whatsapp || phone || '').replace(/[^0-9]/g, '');

  // Generate contextual WhatsApp message and RFQ URL
  let whatsappText = 'Hello MECELFAB, I have an industrial inquiry.';
  let rfqHref = '/contact';

  if (pathname?.startsWith('/equipment/')) {
    const slug = pathname.replace('/equipment/', '');
    whatsappText = `Hello MECELFAB, I would like to inquire about equipment: ${slug.replace(/-/g, ' ')}.`;
    rfqHref = `/contact?equipment=${slug}`;
  } else if (pathname?.startsWith('/services/')) {
    const slug = pathname.replace('/services/', '');
    whatsappText = `Hello MECELFAB, I have a requirement for ${slug.replace(/-/g, ' ')}.`;
    rfqHref = `/contact?service=${slug}`;
  } else if (pathname?.startsWith('/industries/')) {
    const slug = pathname.replace('/industries/', '');
    whatsappText = `Hello MECELFAB, I would like to discuss engineering solutions for ${slug.replace(/-/g, ' ')}.`;
    rfqHref = `/contact?industry=${slug}`;
  } else if (pathname === '/equipment') {
    whatsappText = 'Hello MECELFAB, I am reviewing your Equipment Catalog and would like to request technical specifications.';
    rfqHref = '/contact';
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 md:hidden transition-transform duration-300 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="bg-primary/95 backdrop-blur-md border-t border-white/10 px-3 py-2.5">
        <div className="flex items-center gap-2">
          {phoneClean && (
            <a
              href={`tel:${phoneClean}`}
              className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-[10px] sm:text-xs font-heading tracking-wider uppercase hover:bg-white/10 transition-colors min-h-[44px]"
              aria-label="Call us"
            >
              <Phone size={15} />
              <span className="hidden xs:inline">Call</span>
            </a>
          )}
          {whatsappClean && (
            <a
              href={`https://wa.me/${whatsappClean}?text=${encodeURIComponent(whatsappText)}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-3 bg-[#25D366]/10 border border-[#25D366]/20 rounded-lg text-[#25D366] text-[10px] sm:text-xs font-heading tracking-wider uppercase hover:bg-[#25D366]/20 transition-colors min-h-[44px]"
              aria-label="Chat on WhatsApp"
            >
              <MessageCircle size={15} />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          )}
          <a
            href={rfqHref}
            className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-3 bg-white text-primary rounded-lg text-[10px] sm:text-xs font-heading tracking-wider uppercase hover:bg-white/90 transition-colors min-h-[44px]"
            aria-label="Request RFQ"
          >
            <FileText size={15} />
            <span className="hidden xs:inline">RFQ</span>
          </a>
          <button
            onClick={() => setDismissed(true)}
            className="p-3 text-white/40 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            aria-label="Dismiss action bar"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
