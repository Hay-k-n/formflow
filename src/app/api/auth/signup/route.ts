import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

const ALLOWED_DOMAIN = 'ucena.com';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  // Server-side domain check — cannot be bypassed from the frontend
  const domain = email.split('@')[1]?.toLowerCase();
  if (domain !== ALLOWED_DOMAIN) {
    return NextResponse.json(
      { error: `Only @${ALLOWED_DOMAIN} email addresses are allowed.` },
      { status: 403 }
    );
  }

  // Use the service role key so public signups can stay disabled in Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    email_redirect_to: `${appUrl}/auth/callback`,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
