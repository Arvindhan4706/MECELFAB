'use client';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function GlobalError({ error, reset }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white/[0.02] border border-white/5 rounded-2xl p-8 backdrop-blur-xl">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center border border-red-500/30">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <h1 className="text-3xl font-heading font-light text-white mb-4 tracking-widest uppercase">
          Service Unavailable
        </h1>
        <p className="text-secondary text-sm font-light mb-4 leading-relaxed">
          We encountered a technical issue. Please try again or contact us directly.
        </p>
          <p className="text-white/40 text-xs font-light mb-8">
            Email: mecelfab@gmail.com &middot; Response within 24 hours
          </p>
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => reset()}
            className="w-full bg-white text-black font-heading tracking-widest uppercase text-sm py-4 rounded-xl hover:bg-accent hover:text-white transition-colors duration-300"
          >
            Try Again
          </button>
          <Link 
            href="/"
            className="w-full bg-transparent border border-white/10 text-white font-heading tracking-widest uppercase text-sm py-4 rounded-xl hover:bg-white/5 transition-colors duration-300"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
