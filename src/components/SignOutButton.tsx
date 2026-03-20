'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    await fetch('/api/auth/signout', { method: 'POST' });
    window.location.href = '/login';
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="text-sm text-muted hover:text-ink transition-colors disabled:opacity-50"
    >
      {loading ? 'Signing out...' : 'Sign Out'}
    </button>
  );
}
