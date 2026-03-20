-- Migration: add user_id to forms and fix RLS policies
-- Safe to run multiple times (all operations are idempotent)

-- 1. Add user_id column if it doesn't already exist
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'forms'
      and column_name  = 'user_id'
  ) then
    alter table public.forms
      add column user_id uuid references auth.users(id) on delete cascade;
  end if;
end $$;

-- 2. Assign existing NULL rows to the first user in the project
--    (safe for single-user dev DBs; no-op if all rows already have a user_id)
update public.forms
set user_id = (select id from auth.users order by created_at limit 1)
where user_id is null;

-- 3. Now enforce NOT NULL
alter table public.forms
  alter column user_id set not null;

-- 4. Index for fast per-user dashboard queries
create index if not exists idx_forms_user_id on public.forms(user_id);

-- 5. Drop old overly-broad policies (ignore errors if they don't exist)
drop policy if exists "Anyone can read forms"        on public.forms;
drop policy if exists "Service role can manage forms" on public.forms;
drop policy if exists "Service role can read submissions" on public.submissions;

-- 6. Owner-scoped policies
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'forms'
      and policyname = 'Owners can manage their forms'
  ) then
    create policy "Owners can manage their forms"
      on public.forms for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'forms'
      and policyname = 'Anyone can read forms'
  ) then
    create policy "Anyone can read forms"
      on public.forms for select
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'submissions'
      and policyname = 'Owners can read their submissions'
  ) then
    create policy "Owners can read their submissions"
      on public.submissions for select
      using (
        exists (
          select 1 from public.forms
          where forms.id = submissions.form_id
            and forms.user_id = auth.uid()
        )
      );
  end if;
end $$;
