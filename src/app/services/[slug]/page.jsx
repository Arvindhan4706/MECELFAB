import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const service = await db.service.findUnique({
    where: { slug, status: 'ACTIVE' }
  });
  
  if (!service) return { title: 'Service Not Found' };

  return {
    title: `${service.title} | MECELFAB Industrial Solutions`,
    description: service.description,
  };
}

export default async function ServicePage({ params }) {
  const { slug } = await params;
  const service = await db.service.findUnique({
    where: { slug, status: 'ACTIVE' }
  });

  if (!service) {
    notFound();
  }

  const capabilities = service.capabilities ? JSON.parse(service.capabilities) : [];

  return (
    <div className="pt-32 pb-24 bg-bg-dark min-h-screen">
      <div className="container mx-auto px-6 max-w-5xl">
        <Link href="/services" className="inline-flex items-center gap-2 text-accent mb-8 hover:text-white transition-colors font-heading text-sm uppercase tracking-widest">
          <ArrowLeft size={16} />
          All Services
        </Link>

        <div className="mb-16">
          <h1 className="text-4xl md:text-6xl font-heading font-light text-white mb-6">
            {service.title}
          </h1>
          <p className="text-xl text-white/70 font-light leading-relaxed max-w-3xl">
            {service.description}
          </p>
        </div>

        {capabilities.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-heading text-white mb-8 border-b border-white/10 pb-4">Capabilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {capabilities.map((cap, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-sm">
                  <CheckCircle className="text-accent shrink-0 mt-0.5" size={20} />
                  <span className="text-white/80">{cap}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-20 border-t border-white/10 pt-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-heading text-white mb-2">Need this service?</h3>
            <p className="text-white/50">Contact our engineering team to discuss your requirement.</p>
          </div>
          <Link href={`/contact?service=${service.slug}`} className="btn-primary whitespace-nowrap">
            REQUEST SERVICE
          </Link>
        </div>
      </div>
    </div>
  );
}
