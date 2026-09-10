'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { Wrench } from 'lucide-react';

export default function ServicesError({ error, reset }) {
  useEffect(() => {
    console.error('Services error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] bg-black flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
            <Wrench className="w-8 h-8 text-white/40" />
          </div>
        </div>
        <h2 className="text-2xl font-heading font-light text-white mb-3 tracking-widest uppercase">
          Services Unavailable
        </h2>
        <p className="text-secondary text-sm font-light mb-8 leading-relaxed">
          We couldn&apos;t load our services right now. Please try again.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full bg-white text-black font-heading tracking-widest uppercase text-sm py-4 hover:bg-white/90 transition-colors duration-300"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="w-full bg-transparent border border-white/10 text-white font-heading tracking-widest uppercase text-sm py-4 hover:bg-white/5 transition-colors duration-300"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
