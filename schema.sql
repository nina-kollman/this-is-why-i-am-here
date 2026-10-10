-- Run once in the Neon SQL Editor.
create table if not exists stories (
  id         uuid primary key default gen_random_uuid(),
  text       text not null check (char_length(text) between 1 and 1500),
  name       text not null check (char_length(name) between 1 and 60),
  age        int  not null check (age between 1 and 120),
  city       text not null check (char_length(city) between 1 and 60),
  story_date date not null,
  hearts     int  not null default 0 check (hearts >= 0),
  status     text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  ip_hash    text,
  created_at timestamptz not null default now()
);

create index if not exists stories_public_idx on stories (status, story_date desc, created_at desc);
create index if not exists stories_ip_idx on stories (ip_hash, created_at);

-- Moderation: approve / reject a note
--   update stories set status = 'approved' where id = '<id>';
--   update stories set status = 'rejected' where id = '<id>';
-- See what is waiting:
--   select id, name, age, city, text, created_at from stories where status = 'pending' order by created_at;
