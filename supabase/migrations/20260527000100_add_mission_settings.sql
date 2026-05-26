create table if not exists public.mission_settings (
  id boolean primary key default true check (id = true),
  application_deadline timestamptz not null default '2029-01-05T23:59:59+05:30',
  decision_horizon timestamptz not null default '2029-03-14T15:14:00+05:30',
  mission_time_zone text not null default 'Asia/Kolkata',
  missed_day_cutoff_hour integer not null default 22 check (missed_day_cutoff_hour between 0 and 23),
  countdown_label text not null default 'primary countdown / MIT application horizon',
  countdown_description text not null default '10th grade long-range mission. Edit this timer and mission copy from the admin console whenever the target changes.',
  operator_name text not null default 'Micheal',
  operator_title text not null default 'admin / publish authority',
  operator_bio text not null default 'Only the admin account can publish logs, moderate comments, view analytics, and upload official mission media.',
  next_action_copy text not null default 'Publish {day} before cutoff, log study hours, attach evidence, keep the system honest.',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.mission_settings (id)
values (true)
on conflict (id) do nothing;

drop trigger if exists mission_settings_touch_updated_at on public.mission_settings;
create trigger mission_settings_touch_updated_at
before update on public.mission_settings
for each row execute function public.touch_updated_at();

alter table public.mission_settings enable row level security;

drop policy if exists "mission settings are public" on public.mission_settings;
create policy "mission settings are public" on public.mission_settings for select using (true);

drop policy if exists "admins insert mission settings" on public.mission_settings;
create policy "admins insert mission settings" on public.mission_settings for insert with check (public.is_admin(auth.uid()));

drop policy if exists "admins update mission settings" on public.mission_settings;
create policy "admins update mission settings" on public.mission_settings for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
