-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role text check (role in ('admin', 'student')) not null default 'student',
  full_name text not null,
  nis text unique, -- Null for admin, required for student
  needs_password_change boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Mabbeppa Portal Tables
create table public.mabbeppa_areas (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.mabbeppa_indicators (
  id uuid default uuid_generate_v4() primary key,
  label text not null, -- e.g., 'Clean', 'Play', 'Absent'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.mabbeppa_assignments (
  id uuid default uuid_generate_v4() primary key,
  area_id uuid references public.mabbeppa_areas on delete cascade not null,
  student_id uuid references public.profiles on delete cascade not null, -- cleaner
  reporter_id uuid references public.profiles on delete cascade not null, -- reporter
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.mabbeppa_logs (
  id uuid default uuid_generate_v4() primary key,
  area_id uuid references public.mabbeppa_areas on delete cascade not null,
  student_id uuid references public.profiles on delete cascade not null, -- cleaner
  indicator_id uuid references public.mabbeppa_indicators on delete cascade not null,
  reported_by uuid references public.profiles on delete cascade not null, -- reporter
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Action Plan Portal Tables
create table public.adab_categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.adab_items (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references public.adab_categories on delete cascade not null,
  description text not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.adab_logs (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles on delete cascade not null,
  item_id uuid references public.adab_items on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. English Hours Portal Tables
create table public.english_statements (
  id uuid default uuid_generate_v4() primary key,
  statement text not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.english_self_logs (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles on delete cascade not null,
  statement_id uuid references public.english_statements on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.english_peer_reports (
  id uuid default uuid_generate_v4() primary key,
  reporter_id uuid references public.profiles on delete cascade not null,
  reported_student_id uuid references public.profiles on delete cascade not null,
  notes text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.mabbeppa_areas enable row level security;
alter table public.mabbeppa_indicators enable row level security;
alter table public.mabbeppa_assignments enable row level security;
alter table public.mabbeppa_logs enable row level security;
alter table public.adab_categories enable row level security;
alter table public.adab_items enable row level security;
alter table public.adab_logs enable row level security;
alter table public.english_statements enable row level security;
alter table public.english_self_logs enable row level security;
alter table public.english_peer_reports enable row level security;

-- Create an Admin check function for convenience
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- 1. Profiles
create policy "Users can view their own profile or admin can view all" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

create policy "Admin can insert profiles" on public.profiles
  for insert with check (public.is_admin());

create policy "Admin can update profiles" on public.profiles
  for update using (public.is_admin());

create policy "Admin can delete profiles" on public.profiles
  for delete using (public.is_admin());

-- 2. Mabbeppa
-- Areas, Indicators, Assignments are readable by everyone, manageable by admin
create policy "Anyone can view areas" on public.mabbeppa_areas for select using (true);
create policy "Admin can manage areas" on public.mabbeppa_areas using (public.is_admin());

create policy "Anyone can view indicators" on public.mabbeppa_indicators for select using (true);
create policy "Admin can manage indicators" on public.mabbeppa_indicators using (public.is_admin());

create policy "Anyone can view assignments" on public.mabbeppa_assignments for select using (true);
create policy "Admin can manage assignments" on public.mabbeppa_assignments using (public.is_admin());

-- Logs: Admin can do all, student can view logs reported by them or for them, and insert if they are the reporter
create policy "Users can view relevant mabbeppa logs" on public.mabbeppa_logs
  for select using (public.is_admin() or auth.uid() = reported_by or auth.uid() = student_id);

create policy "Students can insert mabbeppa logs as reporters" on public.mabbeppa_logs
  for insert with check (
    public.is_admin() or 
    (auth.uid() = reported_by and exists (
      select 1 from public.mabbeppa_assignments 
      where reporter_id = auth.uid() and area_id = mabbeppa_logs.area_id and student_id = mabbeppa_logs.student_id
    ))
  );

create policy "Admin can update/delete mabbeppa logs" on public.mabbeppa_logs using (public.is_admin());

-- 3. Action Plan
-- Categories and Items readable by everyone, manageable by admin
create policy "Anyone can view adab categories" on public.adab_categories for select using (true);
create policy "Admin can manage adab categories" on public.adab_categories using (public.is_admin());

create policy "Anyone can view adab items" on public.adab_items for select using (true);
create policy "Admin can manage adab items" on public.adab_items using (public.is_admin());

-- Adab Logs: User can view and insert their own logs
create policy "Users can view their own adab logs" on public.adab_logs
  for select using (public.is_admin() or auth.uid() = student_id);

create policy "Users can insert their own adab logs" on public.adab_logs
  for insert with check (public.is_admin() or auth.uid() = student_id);

create policy "Admin can manage adab logs" on public.adab_logs using (public.is_admin());

-- 4. English Hours
create policy "Anyone can view english statements" on public.english_statements for select using (true);
create policy "Admin can manage english statements" on public.english_statements using (public.is_admin());

-- Self logs
create policy "Users can view their own english logs" on public.english_self_logs
  for select using (public.is_admin() or auth.uid() = student_id);

create policy "Users can insert their own english logs" on public.english_self_logs
  for insert with check (public.is_admin() or auth.uid() = student_id);

create policy "Admin can manage english logs" on public.english_self_logs using (public.is_admin());

-- Peer reports
create policy "Users can view english peer reports related to them" on public.english_peer_reports
  for select using (public.is_admin() or auth.uid() = reporter_id or auth.uid() = reported_student_id);

create policy "Users can insert english peer reports" on public.english_peer_reports
  for insert with check (public.is_admin() or auth.uid() = reporter_id);

create policy "Admin can manage english peer reports" on public.english_peer_reports using (public.is_admin());

-- Create Trigger for automatically adding users to profiles (Optional but handy for admin auth creation)
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  -- For admin, you could insert them directly into profiles manually or via this trigger
  -- Assuming they will be inserted manually via app logic, we skip auto-insertion for students
  -- so that the admin can fill in NIS and Full Name when creating.
  -- But if you want a blank profile created on auth:
  -- insert into public.profiles (id, full_name, role) values (new.id, new.raw_user_meta_data->>'full_name', 'student');
  return new;
end;
$$ language plpgsql security definer;
