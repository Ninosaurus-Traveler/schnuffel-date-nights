-- =========================================================
-- Adventskalender – Supabase Setup
-- Einmal komplett im Supabase Dashboard → SQL Editor ausführen.
-- Kann gefahrlos mehrfach ausgeführt werden.
-- Die alte Tabelle "date_ideas" wird NICHT angefasst.
-- =========================================================


-- ---------------------------------------------------------
-- 1. Tabelle mit den 24 Türchen
-- ---------------------------------------------------------
create table if not exists public.advent_doors (
  day        smallint primary key check (day between 1 and 24),
  unlock_at  timestamptz not null,
  title      text,
  sender     text,                              -- z. B. 'Mama & Papa'
  message    text,
  media      jsonb not null default '[]'::jsonb -- [{ "path": "day-01/video.mp4", "type": "video", "poster": "day-01/video.jpg" }, { "path": "day-01/foto.jpg", "type": "image" }]
);

-- Alle 24 Tage anlegen: Türchen öffnet um 00:00 Uhr Sri-Lanka-Zeit
-- (= 19:30 Uhr deutscher Zeit am Vorabend).
insert into public.advent_doors (day, unlock_at)
select d, make_timestamptz(2026, 12, d, 0, 0, 0, 'Asia/Colombo')
from generate_series(1, 24) as d
on conflict (day) do update set unlock_at = excluded.unlock_at;


-- ---------------------------------------------------------
-- 2. Row Level Security: Inhalte erst ab unlock_at lesbar
-- ---------------------------------------------------------
alter table public.advent_doors enable row level security;

drop policy if exists "advent: offene Tuerchen lesbar" on public.advent_doors;
create policy "advent: offene Tuerchen lesbar"
  on public.advent_doors
  for select
  to anon, authenticated
  using (unlock_at <= now());

-- Kein insert/update/delete für anon → Inhalte nur über das Dashboard pflegen.


-- ---------------------------------------------------------
-- 3. Status aller Türchen OHNE Inhalte (für das Raster)
--    server_now erlaubt einen Countdown unabhängig von der Handyuhr.
-- ---------------------------------------------------------
create or replace function public.advent_door_states()
returns table (day smallint, unlock_at timestamptz, is_open boolean, server_now timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select d.day, d.unlock_at, d.unlock_at <= now(), now()
  from public.advent_doors d
  order by d.day;
$$;

revoke all on function public.advent_door_states() from public;
grant execute on function public.advent_door_states() to anon, authenticated;


-- ---------------------------------------------------------
-- 4. Privater Storage-Bucket für Bilder & Videos
--    Ordnerstruktur: day-01/…, day-02/…, …, day-24/…
-- ---------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('advent', 'advent', false)
on conflict (id) do update set public = false;

-- Lesen (und damit Signed URLs erzeugen) nur für Dateien offener Türchen.
drop policy if exists "advent: Medien offener Tuerchen" on storage.objects;
create policy "advent: Medien offener Tuerchen"
  on storage.objects
  for select
  to anon, authenticated
  using (
    bucket_id = 'advent'
    and exists (
      select 1
      from public.advent_doors d
      where d.unlock_at <= now()
        and (storage.foldername(name))[1] = 'day-' || lpad(d.day::text, 2, '0')
    )
  );


-- =========================================================
-- Beispiel: ein Türchen befüllen
-- =========================================================
-- update public.advent_doors set
--   title   = 'Grüße aus der Heimat',
--   sender  = 'Mama & Papa',
--   message = 'Wir vermissen dich! Genieß die Sonne für uns mit ☀️',
--   media   = '[
--     {"type": "video", "path": "day-01/mama-papa.mp4", "poster": "day-01/mama-papa.jpg"},
--     {"type": "image", "path": "day-01/foto.jpg"}
--   ]'::jsonb
-- where day = 1;


-- =========================================================
-- TESTEN (vor Dezember) – danach unbedingt zurücksetzen!
-- =========================================================
-- Tag 1 & 2 sofort öffnen:
-- update public.advent_doors set unlock_at = now() - interval '1 minute' where day in (1, 2);
--
-- Zurücksetzen auf die echten Termine (Block aus Abschnitt 1 erneut ausführen):
-- update public.advent_doors set unlock_at = make_timestamptz(2026, 12, day, 0, 0, 0, 'Asia/Colombo');
--
-- Kontrolle: Tag 1 muss 2026-11-30 18:30:00+00 sein
-- select day, unlock_at at time zone 'UTC' as utc, unlock_at at time zone 'Asia/Colombo' as colombo from public.advent_doors order by day;
