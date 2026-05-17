import { createClient } from '@supabase/supabase-js';

// Server-side Supabase (uses service role key, bypasses RLS)
// Use this only in API routes for admin operations
export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Type definitions
export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'multiselect' | 'page_break';
  required: boolean;
  placeholder?: string;
  options?: string[]; // for select fields
}

export interface Form {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  email_to: string;
  created_at: string;
}

export interface Submission {
  id: string;
  form_id: string;
  data: Record<string, string>;
  created_at: string;
}
