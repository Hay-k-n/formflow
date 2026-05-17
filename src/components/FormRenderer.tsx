'use client';

import { useState } from 'react';
import { Form } from '@/lib/supabase';

export default function FormRenderer({ form }: { form: Form }) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  // Split fields into pages at page_break markers
  const pages = form.fields.reduce((acc, field) => {
    if (field.type === 'page_break') {
      acc.push([]);
    } else {
      acc[acc.length - 1].push(field);
    }
    return acc;
  }, [[]] as (typeof form.fields)[]);

  const totalPages = pages.length;
  const isLastPage = currentPage === totalPages - 1;
  const pageFields = pages[currentPage] ?? [];

  function updateValue(fieldId: string, value: string) {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  }

  function validatePage(pageIndex: number) {
    for (const field of pages[pageIndex]) {
      if (field.required && !formData[field.id]?.trim() && !formData[field.id]?.split(',').filter(Boolean).length) {
        return `"${field.label}" is required`;
      }
    }
    return null;
  }

  function handleNext() {
    const err = validatePage(currentPage);
    if (err) { setError(err); return; }
    setError('');
    setCurrentPage((p) => p + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBack() {
    setError('');
    setCurrentPage((p) => p - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit() {
    setError('');
    const err = validatePage(currentPage);
    if (err) { setError(err); return; }

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
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      <div className="animate-fade-up">
        <h1 className="font-display text-3xl text-ink mb-1">{form.title}</h1>
        {form.description && (
          <p className="text-muted">{form.description}</p>
        )}
        {totalPages > 1 && (
          <div className="mt-3 flex items-center gap-2">
            {pages.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full flex-1 transition-colors ${i <= currentPage ? 'bg-accent' : 'bg-border'}`} />
            ))}
            <span className="text-xs text-muted ml-1 whitespace-nowrap">{currentPage + 1} / {totalPages}</span>
          </div>
        )}
      </div>

      <div className="space-y-5 animate-fade-up-delay">
        {pageFields.map((field) => (
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
            ) : field.type === 'multiselect' ? (
              <div className="space-y-2">
                {(field.options || []).map((opt) => {
                  const selected = (formData[field.id] || '').split(',').filter(Boolean);
                  const checked = selected.includes(opt);
                  return (
                    <label key={opt} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const next = checked
                            ? selected.filter((v) => v !== opt)
                            : [...selected, opt];
                          updateValue(field.id, next.join(','));
                        }}
                        className="rounded border-border accent-accent w-4 h-4"
                      />
                      <span className="text-sm text-ink">{opt}</span>
                    </label>
                  );
                })}
              </div>
            ) : field.type === 'datetime' ? (
              <input
                type="date"
                value={formData[field.id] || ''}
                onChange={(e) => updateValue(field.id, e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2.5 bg-white text-sm"
              />
            ) : (
              <input
                type={field.type === 'organization' ? 'text' : field.type}
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

      <div className="flex gap-3">
        {currentPage > 0 && (
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 border border-border text-ink py-3 rounded-xl font-semibold text-base hover:bg-surface transition-colors"
          >
            Back
          </button>
        )}
        {isLastPage ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-accent text-white py-3 rounded-xl font-semibold text-base hover:bg-accent/90 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 bg-accent text-white py-3 rounded-xl font-semibold text-base hover:bg-accent/90 transition-colors"
          >
            Next
          </button>
        )}
      </div>
    </form>
  );
}
