'use client';

import { useState } from 'react';
import { Form } from '@/lib/supabase';

export default function FormRenderer({ form }: { form: Form }) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  function updateValue(fieldId: string, value: string) {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Validate required fields
    for (const field of form.fields) {
      if (field.required && !formData[field.id]?.trim()) {
        setError(`"${field.label}" is required`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/submit/${form.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: formData }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Submission failed');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-16 animate-fade-up">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="font-display text-2xl text-ink mb-2">Thank you!</h2>
        <p className="text-muted">Your response has been submitted.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="animate-fade-up">
        <h1 className="font-display text-3xl text-ink mb-1">{form.title}</h1>
        {form.description && (
          <p className="text-muted">{form.description}</p>
        )}
      </div>

      <div className="space-y-5 animate-fade-up-delay">
        {form.fields.map((field) => (
          <div key={field.id}>
            <label className="block text-sm font-medium text-ink mb-1.5">
              {field.label}
              {field.required && <span className="text-accent ml-1">*</span>}
            </label>

            {field.type === 'textarea' ? (
              <textarea
                value={formData[field.id] || ''}
                onChange={(e) => updateValue(field.id, e.target.value)}
                placeholder={field.placeholder}
                rows={4}
                className="w-full border border-border rounded-lg px-3 py-2.5 bg-white text-sm resize-y"
              />
            ) : field.type === 'select' ? (
              <select
                value={formData[field.id] || ''}
                onChange={(e) => updateValue(field.id, e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2.5 bg-white text-sm"
              >
                <option value="">Select...</option>
                {(field.options || []).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                value={formData[field.id] || ''}
                onChange={(e) => updateValue(field.id, e.target.value)}
                placeholder={field.placeholder}
                className="w-full border border-border rounded-lg px-3 py-2.5 bg-white text-sm"
              />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-accent text-white py-3 rounded-xl font-semibold text-base hover:bg-accent/90 disabled:opacity-50 transition-colors"
      >
        {submitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
