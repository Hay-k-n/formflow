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
      <header className="w-full bg-[#1e2024] px-6 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <svg viewBox="0 0 44 34" fill="none" className="h-7 w-auto">
            <polygon points="10,16 26,6 38,13 22,23" fill="#e84040"/>
            <polygon points="38,13 44,9 44,28 38,32" fill="#b83232"/>
          </svg>
          <span className="text-white font-bold tracking-[0.2em] text-xl">UCENA</span>
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
