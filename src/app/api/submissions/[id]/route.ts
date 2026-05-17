import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { createServerSupabase } from '@/lib/supabase-server';

// GET /api/submissions/[id] — get all submissions for a form (id = form_id)
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('form_id', params.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/submissions/[id] — delete a single submission (id = submission.id)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { data: { user } } = await createServerSupabase().auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  // Only allow deletion if the submission belongs to a form owned by this user
  const { error } = await supabase
    .from('submissions')
    .delete()
    .eq('id', params.id)
    .in(
      'form_id',
      supabase.from('forms').select('id').eq('user_id', user.id)
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
