'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

export default function DeleteFormButton({ formId }: { formId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from('forms').delete().eq('id', formId);
    // Reload the page so the list refreshes from the server
    window.location.reload();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
        <span className="text-xs text-muted">Delete?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
        >
          {loading ? 'Deleting...' : 'Yes'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-muted hover:text-ink"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        setConfirming(true);
      }}
      className="text-xs text-muted hover:text-red-600 transition-colors px-2 py-1 rounded"
    >
      Delete
    </button>
  );
}
