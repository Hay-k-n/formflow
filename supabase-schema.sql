-- ============================================
-- FormFlow Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Forms table: stores form definitions
create table public.forms (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text default '',
  fields jsonb not null default '[]'::jsonb,
  email_to text not null,
  created_at timestamptz default now() not null
);

-- Submissions table: stores filled-out forms
create table public.submissions (
  id uuid default gen_random_uuid() primary key,
  form_id uuid references public.forms(id) on delete cascade not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz default now() not null
);

-- Index for fast submission lookups by form
create index idx_submissions_form_id on public.submissions(form_id);

-- Enable Row Level Security
alter table public.forms enable row level security;
alter table public.submissions enable row level security;

-- Policies: allow all operations via service role key (server-side)
-- Public can only read forms and insert submissions
create policy "Anyone can read forms"
  on public.forms for select
  using (true);

create policy "Service role can manage forms"
  on public.forms for all
  using (true)
  with check (true);

create policy "Anyone can submit"
  on public.submissions for insert
  with check (true);

create policy "Service role can read submissions"
  on public.submissions for select
  using (true);
