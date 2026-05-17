import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { createServerSupabase } from '@/lib/supabase-server';

// POST /api/forms/[id]/duplicate
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { data: { user } } = await createServerSupabase().auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const { data: original, error: fetchError } = await supabase
    .from('forms')
    .select('title, description, fields, email_to')
    .eq('id', params.id)
    .single();

  if (fetchError || !original) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 });
  }

  const { data: copy, error: insertError } = await supabase
    .from('forms')
    .insert({
      user_id: user.id,
      title: `Copy of ${original.title}`,
      description: original.description,
      fields: original.fields,
      email_to: original.email_to,
    })
    .select('id')
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ id: copy.id }, { status: 201 });
}
