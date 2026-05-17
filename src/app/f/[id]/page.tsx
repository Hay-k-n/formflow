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
    <>
      <header className="w-full bg-[#1e2024] px-6 py-4 sticky top-0 z-50">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <img src="/ucena-logo.png" alt="UCENA" className="h-14 w-auto" />
        </div>
      </header>
      <main className="min-h-screen flex items-start justify-center pt-10 pb-20 px-4">
        <div className="w-full max-w-lg">
          <FormRenderer form={form as Form} />
          <p className="text-center text-xs text-muted/50 mt-10">
            Powered by <span className="font-display">Ucena Technologies</span>
          </p>
        </div>
      </main>
    </>
  );
}
