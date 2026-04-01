create table if not exists public.report_entries (
  id uuid primary key default gen_random_uuid(),
  sector text not null,
  title text not null,
  description text,
  pdf_path text not null unique,
  image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists report_entries_sector_created_at_idx
on public.report_entries (sector, created_at desc);
