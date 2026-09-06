-- Run this file in Supabase Dashboard > SQL Editor.
-- Supabase Auth stores credentials in auth.users. This table stores AssessIQ roles.

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

-- AssessIQ academic data model

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  department text,
  created_at timestamptz not null default now()
);

create table if not exists public.course_outcomes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  code text not null,
  description text not null,
  syllabus_year integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (course_id, code, syllabus_year)
);

create table if not exists public.syllabus_topics (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  topic text not null,
  description text,
  syllabus_year integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (course_id, topic, syllabus_year)
);

create table if not exists public.exam_papers (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete restrict,
  uploaded_by uuid not null references public.profiles(id) on delete restrict,
  title text not null,
  source_year integer,
  source text not null default 'uploaded'
    check (source in ('uploaded', 'historical', 'seed')),
  status text not null default 'draft'
    check (status in ('draft', 'processing', 'completed', 'approved', 'action_needed')),
  raw_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  exam_paper_id uuid references public.exam_papers(id) on delete cascade,
  question_number integer,
  question_text text not null,
  marks numeric(6,2) not null default 0 check (marks >= 0),
  source text not null default 'uploaded'
    check (source in ('uploaded', 'historical', 'seed')),
  exam_year integer,
  created_at timestamptz not null default now()
);

create table if not exists public.question_analysis (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null unique references public.questions(id) on delete cascade,
  topic_id uuid references public.syllabus_topics(id) on delete set null,
  course_outcome_id uuid references public.course_outcomes(id) on delete set null,
  topic_label text,
  course_outcome_label text,
  bloom_level text check (bloom_level in ('Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create')),
  confidence numeric(5,4) check (confidence >= 0 and confidence <= 1),
  reasoning text,
  analyzed_at timestamptz not null default now()
);

create table if not exists public.similarity_matches (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  matched_question_id uuid not null references public.questions(id) on delete cascade,
  similarity_score numeric(6,5) not null check (similarity_score >= 0 and similarity_score <= 1),
  is_flagged boolean not null default false,
  created_at timestamptz not null default now(),
  unique (question_id, matched_question_id)
);

create table if not exists public.analysis_reports (
  id uuid primary key default gen_random_uuid(),
  exam_paper_id uuid not null unique references public.exam_papers(id) on delete cascade,
  quality_score numeric(5,2) check (quality_score >= 0 and quality_score <= 100),
  topics_covered jsonb not null default '[]'::jsonb,
  missing_topics jsonb not null default '[]'::jsonb,
  co_distribution jsonb not null default '{}'::jsonb,
  bloom_distribution jsonb not null default '{}'::jsonb,
  similarity_flags jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

grant execute on function public.current_user_role() to authenticated;

alter table public.courses enable row level security;
alter table public.course_outcomes enable row level security;
alter table public.syllabus_topics enable row level security;
alter table public.exam_papers enable row level security;
alter table public.questions enable row level security;
alter table public.question_analysis enable row level security;
alter table public.similarity_matches enable row level security;
alter table public.analysis_reports enable row level security;

drop policy if exists "Authenticated users can view courses" on public.courses;
create policy "Authenticated users can view courses" on public.courses
  for select to authenticated using (true);

drop policy if exists "Authenticated users can view outcomes" on public.course_outcomes;
create policy "Authenticated users can view outcomes" on public.course_outcomes
  for select to authenticated using (true);

drop policy if exists "Authenticated users can view topics" on public.syllabus_topics;
create policy "Authenticated users can view topics" on public.syllabus_topics
  for select to authenticated using (true);

drop policy if exists "Users can view permitted exam papers" on public.exam_papers;
create policy "Users can view permitted exam papers" on public.exam_papers
  for select to authenticated
  using (
    uploaded_by = auth.uid()
    or public.current_user_role() in ('admin', 'reviewer')
  );

drop policy if exists "Faculty and admins can create exam papers" on public.exam_papers;
create policy "Faculty and admins can create exam papers" on public.exam_papers
  for insert to authenticated
  with check (
    uploaded_by = auth.uid()
    and public.current_user_role() in ('faculty', 'admin')
  );

drop policy if exists "Users can view permitted questions" on public.questions;
create policy "Users can view permitted questions" on public.questions
  for select to authenticated
  using (
    exists (
      select 1 from public.exam_papers paper
      where paper.id = questions.exam_paper_id
        and (paper.uploaded_by = auth.uid() or public.current_user_role() in ('admin', 'reviewer'))
    )
    or source in ('historical', 'seed')
  );

drop policy if exists "Authenticated users can view question analysis" on public.question_analysis;
create policy "Authenticated users can view question analysis" on public.question_analysis
  for select to authenticated using (true);

drop policy if exists "Authenticated users can view similarity matches" on public.similarity_matches;
create policy "Authenticated users can view similarity matches" on public.similarity_matches
  for select to authenticated using (true);

drop policy if exists "Authenticated users can view reports" on public.analysis_reports;
create policy "Authenticated users can view reports" on public.analysis_reports
  for select to authenticated using (true);

create index if not exists course_outcomes_course_idx on public.course_outcomes(course_id);
create index if not exists syllabus_topics_course_idx on public.syllabus_topics(course_id);
create index if not exists exam_papers_course_idx on public.exam_papers(course_id);
create index if not exists exam_papers_uploaded_by_idx on public.exam_papers(uploaded_by);
create index if not exists questions_exam_paper_idx on public.questions(exam_paper_id);
create index if not exists questions_source_idx on public.questions(source, exam_year);
create index if not exists question_analysis_bloom_idx on public.question_analysis(bloom_level);
create index if not exists similarity_matches_question_idx on public.similarity_matches(question_id);