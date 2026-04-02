import { notFound } from 'next/navigation';
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
        <FormBuilder form={data as Form} />
      </main>
    </>
  );
}
