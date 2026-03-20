'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  // Don't show navbar on public form pages, login, or signup
  if (pathname.startsWith('/f/') || pathname === '/login' || pathname === '/signup') return null;

  async function handleSignOut() {
    setSigningOut(true);
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <nav className="border-b border-border bg-white/60 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center text-white text-sm font-bold group-hover:rotate-6 transition-transform">
            F
          </div>
          <span className="font-display text-xl text-ink">FormFlow</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/forms/new"
            className="bg-ink text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-ink/90 transition-colors"
          >
            + New Form
          </Link>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="text-sm text-muted hover:text-ink transition-colors px-2 py-2"
          >
            {signingOut ? '...' : 'Sign Out'}
          </button>
        </div>
      </div>
    </nav>
  );
}
