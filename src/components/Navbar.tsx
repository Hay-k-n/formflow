'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  // Don't show navbar on public form pages
  if (pathname.startsWith('/f/')) return null;

  return (
    <nav className="border-b border-border bg-white/60 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center text-white text-sm font-bold group-hover:rotate-6 transition-transform">
            F
          </div>
          <span className="font-display text-xl text-ink">FormFlow</span>
        </Link>
        <Link
          href="/forms/new"
          className="bg-ink text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-ink/90 transition-colors"
        >
          + New Form
        </Link>
      </div>
    </nav>
  );
}
