-- ASCENT-1004 Supabase schema
-- Run this in the Supabase SQL editor after creating a project.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  display_name text,
  role text not null default 'user' check (role in ('admin', 'user')),
  avatar_url text,
  banner_url text,
  bio text,
  social_links jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_username_lower_idx on public.profiles (lower(username));

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete restrict,
  day_number integer not null unique check (day_number > 0),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text not null,
  published_at timestamptz not null default now(),
  mission_date date not null,
  tags text[] not null default '{}',
  study_hours numeric(5, 2) not null default 0,
  gym_complete boolean not null default false,
  physics_progress numeric(5, 2) not null default 0,
  streak_after_post integer not null default 0,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  kind text not null check (kind in ('image', 'gif', 'video', 'embed')),
  url text not null,
  alt text,
  width integer,
  height integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1200),
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.failure_events (
  id uuid primary key default gen_random_uuid(),
  day_number integer,
  failure_date date not null unique,
  reason text not null,
  severity text not null default 'critical' check (severity in ('warning', 'critical')),
  auto_posted_to_instagram boolean not null default false,
  instagram_permalink text,
  created_at timestamptz not null default now()
);

create table if not exists public.visitor_events (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  referrer text,
  user_agent text,
  ip_hash text,
  created_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at
before update on public.posts
for each row execute function public.touch_updated_at();

drop trigger if exists comments_touch_updated_at on public.comments;
create trigger comments_touch_updated_at
before update on public.comments
for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_username text;
begin
  requested_username := coalesce(new.raw_user_meta_data->>'username', 'observer_' || substr(new.id::text, 1, 8));

  -- The public signup path cannot claim Micheal. Promote the real admin manually with the service role.
  if lower(requested_username) = 'micheal' then
    requested_username := 'operator_' || substr(new.id::text, 1, 8);
  end if;

  insert into public.profiles (id, username, display_name, role)
  values (
    new.id,
    requested_username,
    coalesce(new.raw_user_meta_data->>'display_name', requested_username),
    'user'
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role and auth.role() <> 'service_role' then
    raise exception 'role changes require service role';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_escalation on public.profiles;
create trigger profiles_prevent_role_escalation
before update on public.profiles
for each row execute function public.prevent_role_escalation();

create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(select 1 from public.profiles where id = user_id and role = 'admin');
$$;

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_media enable row level security;
alter table public.comments enable row level security;
alter table public.failure_events enable row level security;
alter table public.visitor_events enable row level security;

drop policy if exists "profiles are public" on public.profiles;
create policy "profiles are public" on public.profiles for select using (true);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "published posts are public" on public.posts;
create policy "published posts are public" on public.posts for select using (status = 'published' or public.is_admin(auth.uid()));

drop policy if exists "admins insert posts" on public.posts;
create policy "admins insert posts" on public.posts for insert with check (public.is_admin(auth.uid()));

drop policy if exists "admins update posts" on public.posts;
create policy "admins update posts" on public.posts for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admins delete posts" on public.posts;
create policy "admins delete posts" on public.posts for delete using (public.is_admin(auth.uid()));

drop policy if exists "post media public" on public.post_media;
create policy "post media public" on public.post_media for select using (true);

drop policy if exists "admins manage post media" on public.post_media;
create policy "admins manage post media" on public.post_media for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "comments are public" on public.comments;
create policy "comments are public" on public.comments for select using (is_deleted = false or public.is_admin(auth.uid()));

drop policy if exists "signed in users comment" on public.comments;
create policy "signed in users comment" on public.comments for insert with check (auth.uid() = author_id);

drop policy if exists "users edit own comments" on public.comments;
create policy "users edit own comments" on public.comments for update using (auth.uid() = author_id or public.is_admin(auth.uid())) with check (auth.uid() = author_id or public.is_admin(auth.uid()));

drop policy if exists "failures are public" on public.failure_events;
create policy "failures are public" on public.failure_events for select using (true);

-- Inserts into failure_events and visitor_events happen from the service-role API routes.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('profiles', 'profiles', true, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/gif']),
  ('post-media', 'post-media', true, 104857600, array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "profile media public" on storage.objects;
create policy "profile media public" on storage.objects for select using (bucket_id = 'profiles');

drop policy if exists "users manage own profile media" on storage.objects;
create policy "users manage own profile media" on storage.objects for all using (
  bucket_id = 'profiles' and auth.uid()::text = (storage.foldername(name))[1]
) with check (
  bucket_id = 'profiles' and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "post media public storage" on storage.objects;
create policy "post media public storage" on storage.objects for select using (bucket_id = 'post-media');

drop policy if exists "admins manage post media storage" on storage.objects;
create policy "admins manage post media storage" on storage.objects for all using (
  bucket_id = 'post-media' and public.is_admin(auth.uid())
) with check (
  bucket_id = 'post-media' and public.is_admin(auth.uid())
);

-- After creating the real Micheal user in Supabase Auth, promote him manually:
-- update public.profiles set username = 'Micheal', display_name = 'Micheal', role = 'admin' where id = '<AUTH_USER_UUID>';
