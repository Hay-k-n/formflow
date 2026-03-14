'use client';

import { Form, Submission } from '@/lib/supabase';

export default function SubmissionsList({
  form,
  submissions,
}: {
  form: Form;
  submissions: Submission[];
}) {
  const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/f/${form.id}`;

  function copyLink() {
    navigator.clipboard.writeText(publicUrl);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="font-display text-3xl text-ink mb-1">{form.title}</h1>
        {form.description && <p className="text-muted mb-3">{form.description}</p>}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-muted">
            Emails go to <strong className="text-ink">{form.email_to}</strong>
          </span>
          <span className="text-border">·</span>
          <span className="text-muted">
            {submissions.length} submission{submissions.length !== 1 && 's'}
          </span>
        </div>
      </div>

      {/* Share link */}
      <div className="bg-white border border-border rounded-xl p-4 animate-fade-up-delay">
        <p className="text-xs text-muted font-medium mb-2 uppercase tracking-wider">
          Public Link
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={publicUrl}
            className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-surface text-ink"
          />
          <button
            onClick={copyLink}
            className="bg-ink text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-ink/90 transition-colors whitespace-nowrap"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Submissions */}
      {submissions.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
          <p className="text-muted">No submissions yet. Share the link above to start collecting responses.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub, idx) => (
            <details
              key={sub.id}
              className="bg-white border border-border rounded-xl overflow-hidden group"
            >
              <summary className="px-4 py-3 cursor-pointer hover:bg-surface/50 transition-colors flex items-center justify-between list-none">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 bg-surface rounded-full flex items-center justify-center text-xs text-muted font-medium">
                    {submissions.length - idx}
                  </span>
                  <span className="text-sm text-ink font-medium">
                    {/* Show first field value as preview */}
                    {form.fields[0] && sub.data[form.fields[0].id]
                      ? String(sub.data[form.fields[0].id]).slice(0, 50)
                      : 'Submission'}
                  </span>
                </div>
                <span className="text-xs text-muted">
                  {new Date(sub.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </summary>
              <div className="border-t border-border px-4 py-4 space-y-3">
                {form.fields.map((field) => (
                  <div key={field.id}>
                    <p className="text-xs text-muted font-medium">{field.label}</p>
                    <p className="text-sm text-ink mt-0.5 whitespace-pre-wrap">
                      {sub.data[field.id] || <span className="text-muted italic">(empty)</span>}
                    </p>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
