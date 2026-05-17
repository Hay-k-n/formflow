import { notFound } from 'next/navigation';
import FormRenderer from '@/components/FormRenderer';
import { getSupabaseAdmin, Form } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function PublicFormPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = getSupabaseAdmin();

  const { data: form, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !form) {
    notFound();
  }

  return (
    <main className="min-h-screen flex items-start justify-center pt-12 pb-20 px-4">
      <div className="w-full max-w-lg">
        <FormRenderer form={form as Form} />
        <p className="text-center text-xs text-muted/50 mt-10">
          Powered by <span className="font-display">Ucena Technologies</span>
        </p>
      </div>
    </main>
  );
}
