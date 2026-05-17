import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendSubmissionEmail({
  to,
  formTitle,
  pdfBuffer,
  organization,
}: {
  to: string;
  formTitle: string;
  pdfBuffer: Buffer;
  organization?: string;
}) {
  const subject = organization
    ? `FF: ${formTitle} : ${organization}`
    : `FF: ${formTitle}`;

  const { data, error } = await resend.emails.send({
    from: 'FormFlow <noreply@ucena.com>',
    to: [to],
    subject,
    html: `
      <div style="font-family: sans-serif; max-width: 480px;">
        <h2 style="color: #1a1a2e;">New Form Submission</h2>
        <p style="color: #6b7280;">
          Someone just filled out <strong>"${formTitle}"</strong>.
        </p>
        <p style="color: #6b7280;">
          The submission is attached as a PDF.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e2de; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">Sent by FormFlow</p>
      </div>
    `,
    attachments: [
      {
        filename: `${formTitle.replace(/[^a-zA-Z0-9]/g, '_')}_submission.pdf`,
        content: pdfBuffer,
      },
    ],
  });

  if (error) {
    console.error('Email send error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}
