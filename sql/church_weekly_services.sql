-- Dias e horários fixos de culto da semana (leitura pública, escrita restrita à programação).
create table if not exists public.church_weekly_services (
  id uuid primary key default gen_random_uuid(),
  day_of_week smallint not null check (day_of_week between 0 and 6), -- 0=Domingo ... 6=Sábado
  start_time time not null,
  title text not null,
  tag text,
  is_teaching boolean not null default false, -- culto de ensino (Curso de Teologia)
  is_active boolean not null default true,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.church_weekly_services enable row level security;

create policy church_weekly_services_select on public.church_weekly_services
  for select to anon, authenticated using (is_active or app.can_manage_programming());
create policy church_weekly_services_insert on public.church_weekly_services
  for insert to authenticated with check (app.can_manage_programming());
create policy church_weekly_services_update on public.church_weekly_services
  for update to authenticated using (app.can_manage_programming()) with check (app.can_manage_programming());
create policy church_weekly_services_delete on public.church_weekly_services
  for delete to authenticated using (app.can_manage_programming());

insert into public.church_weekly_services (day_of_week, start_time, title, tag, is_teaching, sort_order) values
  (0, '19:00', 'Culto da Família', 'Culto da Família', false, 1),
  (1, '19:30', 'Tarde da Bênção', 'Tarde da Bênção', false, 2),
  (2, '08:00', 'Culto de Ensino', 'Curso de Teologia', true, 3),
  (4, '19:30', 'Culto de Adoração', 'Adoração', false, 4);
