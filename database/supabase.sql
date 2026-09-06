-- Run this file in Supabase Dashboard > SQL Editor.
-- Supabase Auth stores credentials in auth.users. This table stores Faculty Palace roles.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null default 'faculty'
    check (role in ('faculty', 'admin', 'reviewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
  on public.profiles for insert
  with check (auth.uid() = id and role = 'faculty');

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'faculty'
  )
  on conflict (id) do update set name = excluded.name;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

insert into public.profiles (id, name, role)
select id, coalesce(raw_user_meta_data->>'full_name', split_part(email, '@', 1)), 'faculty'
from auth.users
on conflict (id) do nothing;

-- -------------------------------------------------------------
-- Core Academic Assessment Tables
-- -------------------------------------------------------------

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  title text not null,
  instructor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.syllabi (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  uploader_id uuid references public.profiles(id) on delete set null,
  filename text not null,
  file_path text,
  extracted_text text not null,
  text_length int not null default 0,
  word_count int not null default 0,
  uploaded_at timestamptz not null default now()
);

create table if not exists public.exam_papers (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete set null,
  uploader_id uuid references public.profiles(id) on delete set null,
  title text not null,
  filename text not null,
  file_path text,
  total_marks int,
  extracted_text text not null,
  text_length int not null default 0,
  word_count int not null default 0,
  uploaded_at timestamptz not null default now()
);