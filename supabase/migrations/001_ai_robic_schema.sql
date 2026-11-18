-- ============================================================================
-- AI-ROBIC: Gymnastics Progress, Biomechanics & AI Digital Judge Platform
-- Supabase PostgreSQL Schema & Row-Level Security (RLS) Migration
-- ============================================================================

create extension if not exists "uuid-ossp";

-- 1. Apparatus / Event Definitions (WAG, MAG, Cheer/T&T, Dance, etc.)
create table if not exists public.apparatus (
  id text primary key,
  discipline_id text not null check (discipline_id in ('WAG', 'MAG', 'CHEER_TNT')),
  name text not null,
  short_name text not null,
  code text not null,
  icon_name text not null default 'Sparkles',
  created_at timestamptz not null default now()
);

-- 2. Corrective Drill & Home Conditioning Library (Matched to Vitals)
create table if not exists public.corrective_drills (
  id text primary key,
  title text not null,
  category text not null,
  sets_reps text not null,
  frequency text not null,
  description text not null,
  parent_safety_tip text not null,
  video_cue_title text not null,
  targeted_vitals_trigger text not null,
  targeted_fault_tags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- 3. Skills Curriculum Catalog (USAG Levels & Custom Programs)
create table if not exists public.skills (
  id text primary key,
  discipline_id text not null,
  level text not null,
  apparatus_id text not null references public.apparatus(id) on delete cascade,
  name text not null,
  usag_code text not null,
  value_part text not null,
  biomechanical_focus text not null,
  ideal_angles jsonb not null default '[]'::jsonb,
  common_fault_tags jsonb not null default '[]'::jsonb,
  recommended_drill_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- 4. Athletes & Anthropometric Vitals Profile
create table if not exists public.athletes (
  id text primary key,
  name text not null,
  age integer not null,
  avatar_initials text not null,
  avatar_gradient text not null,
  discipline_id text not null,
  level text not null,
  rotation_group text not null default 'A',
  checked_in boolean not null default true,
  parent_name text not null,
  parent_email text not null,
  home_streak_days integer not null default 1,
  archetype_summary text not null,
  vitals jsonb not null default '{}'::jsonb,
  skill_progress jsonb not null default '{}'::jsonb,
  prescriptions jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- 5. AI Digital Judge Video Sessions & Timestamped USAG Deductions
create table if not exists public.ai_judge_sessions (
  id text primary key,
  athlete_id text not null references public.athletes(id) on delete cascade,
  apparatus_id text not null,
  mode text not null check (mode in ('single_skill', 'mock_meet_routine')),
  title text not null,
  skill_id text,
  level text not null,
  recorded_at text not null,
  duration_sec numeric(6,2) not null default 20.0,
  start_value numeric(4,2) not null default 10.00,
  total_deductions numeric(4,2) not null default 0.00,
  final_score numeric(4,2) not null default 10.00,
  special_requirements_met jsonb not null default '[]'::jsonb,
  deductions jsonb not null default '[]'::jsonb,
  coach_summary_note text not null default '',
  video_storage_url text,
  published_to_portal boolean not null default true,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security (RLS) with open read/write policies for v1 pilot testing
alter table public.apparatus enable row level security;
alter table public.corrective_drills enable row level security;
alter table public.skills enable row level security;
alter table public.athletes enable row level security;
alter table public.ai_judge_sessions enable row level security;

create policy "Allow public access to apparatus" on public.apparatus for all using (true) with check (true);
create policy "Allow public access to corrective_drills" on public.corrective_drills for all using (true) with check (true);
create policy "Allow public access to skills" on public.skills for all using (true) with check (true);
create policy "Allow public access to athletes" on public.athletes for all using (true) with check (true);
create policy "Allow public access to ai_judge_sessions" on public.ai_judge_sessions for all using (true) with check (true);
