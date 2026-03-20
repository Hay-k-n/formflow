import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabase-server';
import SignOutButton from '@/components/SignOutButton';
import DeleteFormButton from '@/components/DeleteFormButton';

export default async function DashboardPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: forms } = await supabase
    .from('forms')
    .select('id, title, created_at, submissions:submissions(count)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-ink">Your Forms</h1>
          <p className="text-muted text-sm mt-1">{user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/forms/new"
            className="bg-ink text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-ink/90 transition-colors"
          >
            + New Form
          </Link>
          <SignOutButton />
        </div>
      </div>

      {!forms || forms.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl p-16 text-center">
          <p className="text-muted text-sm mb-4">No forms yet.</p>
          <Link
            href="/forms/new"
            className="bg-accent text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-accent/90 transition-colors"
          >
            Create your first form
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {forms.map((form) => {
            const count =
              Array.isArray(form.submissions) && form.submissions[0]
                ? (form.submissions[0] as { count: number }).count
                : 0;
            return (
              <div
                key={form.id}
                className="flex items-center justify-between border border-border rounded-xl px-5 py-4 bg-white hover:border-accent/40 hover:shadow-sm transition-all"
              >
                <Link href={`/forms/${form.id}`} className="flex-1 flex items-center justify-between mr-4">
                  <span className="font-medium text-ink">{form.title || 'Untitled Form'}</span>
                  <span className="text-sm text-muted">{count} submission{count !== 1 ? 's' : ''}</span>
                </Link>
                <DeleteFormButton formId={form.id} />
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
