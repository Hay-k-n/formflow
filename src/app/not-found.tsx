import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="w-full bg-[#1e2024] px-6 py-4">
        <div className="flex items-center">
          <img src="/ucena-logo.png" alt="UCENA" className="h-9 w-auto" />
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center animate-fade-up">
          <p className="text-8xl font-bold text-border mb-6">404</p>
          <h1 className="font-display text-2xl text-ink mb-3">This page doesn't exist</h1>
          <p className="text-muted text-sm max-w-sm mx-auto mb-8">
            The link you followed may be expired or incorrect. Please check with the sender for an updated link.
          </p>
          <Link
            href="/"
            className="inline-block bg-accent text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-accent/90 transition-colors"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
