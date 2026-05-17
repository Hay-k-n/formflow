-- Add link_token to forms for regenerable public links.
-- Existing forms get link_token = id so current public links keep working.

alter table public.forms
  add column if not exists link_token uuid;

update public.forms
  set link_token = id
  where link_token is null;

alter table public.forms
  alter column link_token set not null;

alter table public.forms
  alter column link_token set default gen_random_uuid();

create unique index if not exists idx_forms_link_token
  on public.forms(link_token);
