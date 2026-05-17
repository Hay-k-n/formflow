import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
import Navbar from '@/components/Navbar';
import FormBuilder from '@/components/FormBuilder';
import { getSupabaseAdmin, Form } from '@/lib/supabase';

export default async function EditFormPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !data) notFound();

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <a href={`/forms/${params.id}`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors mb-6">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M10.5 3L5.5 8l5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back to form
        </a>
        <FormBuilder form={data as Form} />
      </main>
    </>
  );
}
