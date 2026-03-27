create table if not exists public.user_app_profiles (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  workspace_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_user_app_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_app_profiles_set_updated_at on public.user_app_profiles;

create trigger user_app_profiles_set_updated_at
before update on public.user_app_profiles
for each row
execute function public.set_user_app_profiles_updated_at();

alter table public.user_app_profiles enable row level security;

drop policy if exists "service role full access to user_app_profiles" on public.user_app_profiles;

create policy "service role full access to user_app_profiles"
on public.user_app_profiles
for all
to service_role
using (true)
with check (true);
