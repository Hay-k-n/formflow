'use client';

import { useState } from 'react';
import { Form, FormField } from '@/lib/supabase';

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'number', label: 'Number' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'select', label: 'Dropdown' },
  { value: 'multiselect', label: 'Multi-select' },
  { value: 'datetime', label: 'Date' },
  { value: 'organization', label: 'Organization' },
] as const;

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function FormBuilder({ form }: { form?: Form }) {
  const [title, setTitle] = useState(form?.title ?? '');
  const [description, setDescription] = useState(form?.description ?? '');
  const [emailTo, setEmailTo] = useState(form?.email_to ?? '');
  const [fields, setFields] = useState<FormField[]>(form?.fields ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function addField() {
    setFields([
      ...fields,
      {
        id: generateId(),
        label: '',
        type: 'text',
        required: false,
        placeholder: '',
        options: [],
      },
    ]);
  }

  function addPageBreak() {
    setFields([
      ...fields,
      { id: generateId(), label: 'Page Break', type: 'page_break', required: false },
    ]);
  }

  function updateField(index: number, updates: Partial<FormField>) {
    setFields(fields.map((f, i) => (i === index ? { ...f, ...updates } : f)));
  }

  function removeField(index: number) {
    setFields(fields.filter((_, i) => i !== index));
  }

  function moveField(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= fields.length) return;
    const updated = [...fields];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setFields(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const realFields = fields.filter((f) => f.type !== 'page_break');
    if (!title.trim()) return setError('Give your form a title');
    if (!emailTo.trim()) return setError('Enter an email to receive submissions');
    if (realFields.length === 0) return setError('Add at least one field');
    if (realFields.some((f) => !f.label.trim())) return setError('All fields need a label');

    const selectWithoutOptions = realFields.find(
      (f) => (f.type === 'select' || f.type === 'multiselect') && (!f.options || f.options.length === 0)
    );
    if (selectWithoutOptions)
      return setError(`"${selectWithoutOptions.label}" needs at least one option`);

    setSaving(true);
    try {
      const url = form ? `/api/forms/${form.id}` : '/api/forms';
      const method = form ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, fields, email_to: emailTo }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || (form ? 'Failed to update form' : 'Failed to create form'));
      }

      const { id } = await res.json();
      window.location.href = `/forms/${form?.id ?? id}`;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Form Meta */}
      <div className="space-y-4 animate-fade-up">
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Form title"
            className="w-full text-3xl font-display bg-transparent border-none focus:ring-0 focus:shadow-none placeholder:text-muted/40 p-0"
            style={{ boxShadow: 'none' }}
          />
        </div>
        <div>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description..."
            className="w-full text-base bg-transparent border-none focus:ring-0 focus:shadow-none placeholder:text-muted/40 text-muted p-0"
            style={{ boxShadow: 'none' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted mb-1.5">
            Send submissions to
          </label>
          <input
            type="email"
            value={emailTo}
            onChange={(e) => setEmailTo(e.target.value)}
            placeholder="you@example.com"
            className="w-full border border-border rounded-lg px-3 py-2.5 bg-white text-sm"
          />
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-3 animate-fade-up-delay">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">
            Fields
          </h3>
          <span className="text-xs text-muted">{fields.filter(f => f.type !== 'page_break').length} field{fields.filter(f => f.type !== 'page_break').length !== 1 && 's'}</span>
        </div>

        {fields.length === 0 && (
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
            <p className="text-muted text-sm">No fields yet. Add your first one below.</p>
          </div>
        )}

        {fields.map((field, index) => {
          if (field.type === 'page_break') {
            return (
              <div key={field.id} className="flex items-center gap-3 py-1">
                <div className="flex flex-col gap-0.5">
                  <button type="button" onClick={() => moveField(index, -1)} disabled={index === 0} className="text-muted hover:text-ink text-xs p-0.5">▲</button>
                  <button type="button" onClick={() => moveField(index, 1)} disabled={index === fields.length - 1} className="text-muted hover:text-ink text-xs p-0.5">▼</button>
                </div>
                <div className="flex-1 flex items-center gap-3">
                  <div className="flex-1 border-t-2 border-dashed border-accent/40" />
                  <span className="text-xs font-semibold text-accent uppercase tracking-wider">Page Break</span>
                  <div className="flex-1 border-t-2 border-dashed border-accent/40" />
                </div>
                <button type="button" onClick={() => removeField(index)} className="text-muted hover:text-red-500 text-lg px-1 transition-colors">×</button>
              </div>
            );
          }

          return (
          <div
            key={field.id}
            className="bg-white border border-border rounded-xl p-4 space-y-3 hover:border-accent/30 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="flex flex-col gap-0.5 pt-1">
                <button
                  type="button"
                  onClick={() => moveField(index, -1)}
                  className="text-muted hover:text-ink text-xs p-0.5"
                  disabled={index === 0}
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => moveField(index, 1)}
                  className="text-muted hover:text-ink text-xs p-0.5"
                  disabled={index === fields.length - 1}
                >
                  ▼
                </button>
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => updateField(index, { label: e.target.value })}
                  placeholder="Field label"
                  className="border border-border rounded-lg px-3 py-2 text-sm bg-surface"
                />
                <select
                  value={field.type}
                  onChange={(e) =>
                    updateField(index, {
                      type: e.target.value as FormField['type'],
                      options: e.target.value === 'select' || e.target.value === 'multiselect' ? [''] : [],
                    })
                  }
                  className="border border-border rounded-lg px-3 py-2 text-sm bg-surface"
                >
                  {FIELD_TYPES.filter((t) =>
                    t.value !== 'organization' ||
                    field.type === 'organization' ||
                    !fields.some((f) => f.type === 'organization')
                  ).map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={field.placeholder || ''}
                  onChange={(e) => updateField(index, { placeholder: e.target.value })}
                  placeholder="Placeholder text (optional)"
                  className="border border-border rounded-lg px-3 py-2 text-sm bg-surface"
                />
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateField(index, { required: e.target.checked })}
                    className="rounded border-border accent-accent"
                  />
                  Required
                </label>
              </div>

              <button
                type="button"
                onClick={() => removeField(index)}
                className="text-muted hover:text-red-500 text-lg px-1 transition-colors"
              >
                ×
              </button>
            </div>

            {/* Comment */}
            <div className="ml-8">
              <input
                type="text"
                value={field.comment || ''}
                onChange={(e) => updateField(index, { comment: e.target.value })}
                placeholder="Helper comment shown to form filler (optional)"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface text-muted"
              />
            </div>

            {/* Select / Multi-select options */}
            {(field.type === 'select' || field.type === 'multiselect') && (
              <div className="ml-8 space-y-2">
                <p className="text-xs text-muted font-medium">
                  {field.type === 'multiselect' ? 'Multi-select options:' : 'Dropdown options:'}
                </p>
                {(field.options || []).map((opt, optIdx) => (
                  <div key={optIdx} className="flex gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...(field.options || [])];
                        newOpts[optIdx] = e.target.value;
                        updateField(index, { options: newOpts });
                      }}
                      placeholder={`Option ${optIdx + 1}`}
                      className="flex-1 border border-border rounded-lg px-3 py-1.5 text-sm bg-surface"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newOpts = (field.options || []).filter((_, i) => i !== optIdx);
                        updateField(index, { options: newOpts });
                      }}
                      className="text-muted hover:text-red-500 text-sm px-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    updateField(index, { options: [...(field.options || []), ''] })
                  }
                  className="text-xs text-accent hover:underline"
                >
                  + Add option
                </button>
              </div>
            )}
          </div>
          );
        })}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={addField}
            className="flex-1 border-2 border-dashed border-border rounded-xl py-3 text-sm text-muted hover:border-accent hover:text-accent transition-colors"
          >
            + Add Field
          </button>
          <button
            type="button"
            onClick={addPageBreak}
            className="border-2 border-dashed border-border rounded-xl px-4 py-3 text-sm text-muted hover:border-accent hover:text-accent transition-colors whitespace-nowrap"
          >
            + Page Break
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={saving}
        className="w-full bg-accent text-white py-3 rounded-xl font-semibold text-base hover:bg-accent/90 disabled:opacity-50 transition-colors"
      >
        {saving ? (form ? 'Saving...' : 'Creating...') : (form ? 'Save Changes' : 'Create Form')}
      </button>
    </form>
  );
}
