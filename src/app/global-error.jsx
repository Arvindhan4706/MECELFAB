'use client';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-lg max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 flex items-center justify-center rounded-full mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">Something went wrong!</h1>
            <p className="text-zinc-400 text-sm mb-6">
              A critical error occurred in the application. We've logged the issue and our team is looking into it.
            </p>
            
            <button
              onClick={() => reset()}
              className="bg-white text-black font-semibold px-6 py-2.5 rounded hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 w-full"
            >
              <RotateCcw size={16} /> Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
