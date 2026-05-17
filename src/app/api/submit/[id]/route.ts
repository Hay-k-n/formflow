import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, Form } from '@/lib/supabase';
import { generateSubmissionPDF } from '@/lib/pdf';
import { sendSubmissionEmail } from '@/lib/email';

// POST /api/submit/[id] — public endpoint for form submissions
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseAdmin();

  // 1. Get the form
  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('*')
    .eq('link_token', params.id)
    .single();

  if (formError || !form) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 });
  }

  const typedForm = form as Form;

  // 2. Parse and validate submission data
  const body = await req.json();
  const { data } = body;

  if (!data || typeof data !== 'object') {
    return NextResponse.json({ error: 'Invalid submission data' }, { status: 400 });
  }

  // Validate required fields
  for (const field of typedForm.fields) {
    if (field.required && !data[field.id]?.toString().trim()) {
      return NextResponse.json(
        { error: `"${field.label}" is required` },
        { status: 400 }
      );
    }
  }

  // 3. Save submission to database
  const { error: insertError } = await supabase
    .from('submissions')
    .insert({
      form_id: params.id,
      data,
    });

  if (insertError) {
    console.error('Submission insert error:', insertError);
    return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 });
  }

  // 4. Generate PDF and send email (non-blocking for the user response)
  try {
    const pdfBuffer = generateSubmissionPDF(typedForm, data);
    const orgField = typedForm.fields.find((f) => f.type === 'organization');
    const organization = orgField ? String(data[orgField.id] || '').trim() || undefined : undefined;
    await sendSubmissionEmail({
      to: typedForm.email_to,
      formTitle: typedForm.title,
      pdfBuffer,
      organization,
    });
  } catch (emailErr) {
    // Log but don't fail the submission — the data is already saved
    console.error('Email/PDF error:', emailErr);
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
