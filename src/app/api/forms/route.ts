import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { createServerSupabase } from '@/lib/supabase-server';

// GET /api/forms — list all forms
export async function GET() {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/forms — create a new form
export async function POST(req: NextRequest) {
  const { data: { user } } = await createServerSupabase().auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, fields, email_to } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }
  if (!email_to?.trim()) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }
  if (!Array.isArray(fields) || fields.length === 0) {
    return NextResponse.json({ error: 'At least one field is required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('forms')
    .insert({
      user_id: user.id,
      title: title.trim(),
      description: description?.trim() || '',
      fields,
      email_to: email_to.trim(),
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
