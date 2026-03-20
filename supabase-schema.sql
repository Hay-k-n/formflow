-- ============================================
-- FormFlow Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Forms table: stores form definitions
create table public.forms (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
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

-- RLS Policies for forms
-- Owners can do everything with their own forms
create policy "Owners can manage their forms"
  on public.forms for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Public can read any form (needed for /f/:id share links)
create policy "Anyone can read forms"
  on public.forms for select
  using (true);

-- RLS Policies for submissions
-- Anyone can submit to a form (public submission endpoint)
create policy "Anyone can submit"
  on public.submissions for insert
  with check (true);

-- Only the form owner can read submissions for their forms
create policy "Owners can read their submissions"
  on public.submissions for select
  using (
    exists (
      select 1 from public.forms
      where forms.id = submissions.form_id
        and forms.user_id = auth.uid()
    )
  );
