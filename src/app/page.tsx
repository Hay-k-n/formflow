import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = getSupabaseAdmin();

  const { data: forms } = await supabase
    .from('forms')
    .select('id, title, description, email_to, created_at')
    .order('created_at', { ascending: false });

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8 animate-fade-up">
          <h1 className="font-display text-4xl text-ink mb-2">Your Forms</h1>
          <p className="text-muted">Create forms, share them, get PDF submissions by email.</p>
        </div>

        {!forms || forms.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-2xl p-16 text-center animate-fade-up-delay">
            <div className="w-14 h-14 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <p className="text-muted mb-4">No forms yet. Create your first one!</p>
            <Link
              href="/forms/new"
              className="inline-block bg-accent text-white px-6 py-2.5 rounded-lg font-medium hover:bg-accent/90 transition-colors"
            >
              Create a Form
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 animate-fade-up-delay">
            {forms.map((form) => (
              <Link
                key={form.id}
                href={`/forms/${form.id}`}
                className="block bg-white border border-border rounded-xl p-5 hover:border-accent/40 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-semibold text-ink group-hover:text-accent transition-colors">
                      {form.title}
                    </h2>
                    {form.description && (
                      <p className="text-sm text-muted mt-0.5 line-clamp-1">
                        {form.description}
                      </p>
                    )}
                    <p className="text-xs text-muted mt-2">
                      → {form.email_to}
                    </p>
                  </div>
                  <span className="text-xs text-muted whitespace-nowrap ml-4">
                    {new Date(form.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
