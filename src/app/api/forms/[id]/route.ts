import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase';

// GET /api/forms/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}

// PUT /api/forms/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseAdmin();
  const body = await req.json();
  const { title, description, fields, email_to } = body;

  if (!title || !email_to || !fields) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('forms')
    .update({ title, description, fields, email_to })
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath(`/forms/${params.id}`);
  revalidatePath(`/forms/${params.id}/edit`);
  revalidatePath(`/f/${params.id}`);

  return NextResponse.json(data);
}

// DELETE /api/forms/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('forms')
    .delete()
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
