"use client";
import Image from 'next/image';

const ClientLogos = ({ clients = [] }) => {
  if (!clients || clients.length === 0) return null;

  return (
    <section className="py-12 bg-white/[0.02] border-t border-white/5 overflow-hidden">
      <div className="container mx-auto px-8 max-w-7xl text-center">
        <h4 className="text-secondary text-xs font-heading tracking-widest uppercase mb-8">
          Trusted by Industry Leaders
        </h4>
        
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-70">
          {clients.map((client) => {
            const logoSrc = client.logoUrl || client.logo;
            if (!logoSrc) return null;
            return (
              <div key={client.id} className="relative w-32 h-16 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                <Image
                  src={logoSrc}
                  alt={client.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ClientLogos;
