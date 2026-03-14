import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import SubmissionsList from '@/components/SubmissionsList';
import { getSupabaseAdmin, Form, Submission } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function FormDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = getSupabaseAdmin();

  // Fetch form
  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('*')
    .eq('id', params.id)
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
