import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { createServerSupabase } from '@/lib/supabase-server';

// POST /api/forms/[id]/regenerate-token
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { data: { user } } = await createServerSupabase().auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const newToken = crypto.randomUUID();

  const { data, error } = await supabase
    .from('forms')
    .update({ link_token: newToken })
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select('link_token')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to regenerate link' }, { status: 500 });
  }

  return NextResponse.json({ link_token: data.link_token });
}
