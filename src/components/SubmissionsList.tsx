'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Submission } from '@/lib/supabase';

export default function SubmissionsList({
  form,
  submissions,
}: {
  form: Form;
  submissions: Submission[];
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [copied, setCopied] = useState(false);
  const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/f/${form.id}`;

  function copyLink() {
    const copy = (text: string) => {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    };

    if (navigator.clipboard) {
      navigator.clipboard.writeText(publicUrl).catch(() => copy(publicUrl));
    } else {
      copy(publicUrl);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDuplicate() {
    setDuplicating(true);
    try {
      const res = await fetch(`/api/forms/${form.id}/duplicate`, { method: 'POST' });
      if (res.ok) {
        const { id } = await res.json();
        router.push(`/forms/${id}/edit`);
      }
    } catch {
      setDuplicating(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/forms/${form.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/');
        router.refresh();
      }
    } catch {
      setDeleting(false);
      setShowConfirm(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <a href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors">
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M10.5 3L5.5 8l5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Back to forms
      </a>

      {/* Header */}
      <div className="animate-fade-up">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl text-ink mb-1">{form.title}</h1>
            {form.description && <p className="text-muted mb-3">{form.description}</p>}
          </div>
          <div className="flex gap-2 shrink-0">
            <a
              href={`/forms/${form.id}/edit`}
              className="text-sm text-muted hover:text-ink transition-colors px-3 py-1.5 border border-border rounded-lg hover:border-ink/30"
            >
              Edit
            </a>
            <button
              onClick={handleDuplicate}
              disabled={duplicating}
              className="text-sm text-muted hover:text-ink transition-colors px-3 py-1.5 border border-border rounded-lg hover:border-ink/30 disabled:opacity-50"
            >
              {duplicating ? 'Duplicating...' : 'Duplicate'}
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="text-sm text-muted hover:text-red-500 transition-colors px-3 py-1.5 border border-border rounded-lg hover:border-red-300"
            >
              Delete
            </button>
          </div>
        </div>
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

      {/* Delete confirmation */}
      {showConfirm && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-800 mb-3">
            Delete <strong>"{form.title}"</strong> and all its submissions? This cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {deleting ? 'Deleting...' : 'Yes, delete it'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="bg-white text-ink px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-surface transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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
            {copied ? 'Copied!' : 'Copy'}
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
