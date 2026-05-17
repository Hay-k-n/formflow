import { notFound, redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import SubmissionsList from '@/components/SubmissionsList';
import { Form, Submission } from '@/lib/supabase';
import { createServerSupabase } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function FormDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch form
  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (formError || !form) {
    notFound();
  }

  // Fetch submissions
  const { data: submissions } = await supabase
    .from('submissions')
    .select('*')
    .eq('form_id', params.id)
    .order('created_at', { ascending: false });

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <SubmissionsList
          form={form as Form}
          submissions={(submissions || []) as Submission[]}
        />
      </main>
    </>
  );
}
