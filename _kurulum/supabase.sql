-- slopware101 — iki tablo, dewsletter'ın Supabase projesinde.
-- Panel: https://supabase.com/dashboard/project/xjtmqncfhuidctxgthhv/sql/new
-- Bunu yapıştır, Run. Bir kere. Sonra site canlı.
--
-- Neden ayrı tablo: dewsletter iş ilanı bülteni, bu kitap bülteni.
-- Farklı insanlar, farklı mail. Karışırsa iş arayan birine kitap bölümü gider.

-- 1) bülten aboneleri ---------------------------------------------------
create table if not exists slopware_subscribers (
  id          bigserial primary key,
  email       text not null,
  dil         text not null default 'en',
  onay        boolean not null default false,   -- mail'i tıklayana kadar false
  onay_kod    uuid not null default gen_random_uuid(),
  kvkk_at     timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  constraint slopware_subscribers_email_key unique (email),
  constraint slopware_subscribers_email_chk check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  constraint slopware_subscribers_dil_chk   check (dil in ('en','tr'))
);

alter table slopware_subscribers enable row level security;

-- anon YALNIZCA satır ekleyebilir. Okuyamaz, silemez, güncelleyemez.
-- Yani anon key sızsa bile kimse mail listeni indiremez.
drop policy if exists slopware_subscribers_insert on slopware_subscribers;
create policy slopware_subscribers_insert
  on slopware_subscribers for insert to anon
  with check (onay = false);

grant insert on slopware_subscribers to anon;
grant usage, select on sequence slopware_subscribers_id_seq to anon;

-- 2) okur notları + forum soruları --------------------------------------
create table if not exists slopware_gorus (
  id          bigserial primary key,
  tur         text not null,                    -- 'not' | 'forum'
  bolum       text not null default '',
  dil         text not null default 'en',
  alinti      text not null default '',
  govde       text not null,
  ad          text not null default '',
  created_at  timestamptz not null default now(),
  constraint slopware_gorus_tur_chk   check (tur in ('not','forum')),
  constraint slopware_gorus_dil_chk   check (dil in ('en','tr')),
  constraint slopware_gorus_govde_chk check (char_length(govde) between 1 and 4000),
  constraint slopware_gorus_alinti_chk check (char_length(alinti) <= 4000),
  constraint slopware_gorus_ad_chk    check (char_length(ad) <= 60),
  constraint slopware_gorus_bolum_chk check (char_length(bolum) <= 120)
);

alter table slopware_gorus enable row level security;

drop policy if exists slopware_gorus_insert on slopware_gorus;
create policy slopware_gorus_insert
  on slopware_gorus for insert to anon with check (true);

grant insert on slopware_gorus to anon;
grant usage, select on sequence slopware_gorus_id_seq to anon;

-- okumak sende: panelden Table Editor > slopware_gorus.
