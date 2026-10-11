-- Run once in the Neon SQL Editor.
-- Existing table? Migrate with:
--   alter table stories add column if not exists owner_hash text;
--   alter table stories alter column status set default 'approved';
--   alter table stories add column story_year int;
--   update stories set story_year = extract(year from story_date)::int;
--   alter table stories alter column story_year set not null, drop column story_date, drop column hearts;
create table if not exists stories (
  id         uuid primary key default gen_random_uuid(),
  text       text not null check (char_length(text) between 1 and 1500),
  name       text not null check (char_length(name) between 1 and 60),
  age        int  not null check (age between 1 and 120),
  city       text not null check (char_length(city) between 1 and 60),
  story_year int  not null check (story_year between 1900 and 2100),
  status     text not null default 'approved' check (status in ('pending', 'approved', 'rejected')),
  ip_hash    text,
  owner_hash text,  -- sha256 of the author's browser token; only they can delete the note
  created_at timestamptz not null default now()
);

create index if not exists stories_public_idx on stories (status, story_year desc, created_at desc);
create index if not exists stories_ip_idx on stories (ip_hash, created_at);

-- Moderation: approve / reject a note
--   update stories set status = 'approved' where id = '<id>';
--   update stories set status = 'rejected' where id = '<id>';
-- See what is waiting:
--   select id, name, age, city, text, created_at from stories where status = 'pending' order by created_at;
