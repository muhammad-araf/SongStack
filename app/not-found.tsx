'use client';

import Link from 'next/link';
import { Home, Music2 } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center px-4">
      
      {/* Background noise pattern */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none" style={{
        backgroundImage: `
          repeating-linear-gradient(45deg, transparent, transparent 1px, rgba(255,255,255,.1) 1px, rgba(255,255,255,.1) 2px),
          repeating-linear-gradient(-45deg, transparent, transparent 1px, rgba(255,255,255,.1) 1px, rgba(255,255,255,.1) 2px)
        `
      }}></div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-md mx-auto py-16 sm:py-20">
        
        {/* Animated Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <Music2 className="w-24 sm:w-32 h-24 sm:h-32 text-white/20" strokeWidth={1} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl sm:text-6xl font-bold text-white">404</span>
            </div>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 text-white">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="text-base sm:text-lg text-zinc-400 mb-8 leading-relaxed">
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>

        {/* Divider */}
        <div className="h-px bg-zinc-900/50 my-8"></div>

        {/* Action Button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-zinc-100 transition-colors duration-200 group"
        >
          <Home className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Footer message */}
        <p className="text-xs sm:text-sm text-zinc-500 mt-12">
          Error Code: <code className="bg-zinc-900/50 px-2 py-1 rounded text-zinc-400">404</code>
        </p>
      </div>
    </div>
  );
}
