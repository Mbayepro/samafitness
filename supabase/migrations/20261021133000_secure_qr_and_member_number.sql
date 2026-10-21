-- Migration : Sécurisation QR Token (opaque uuid), Numéro de membre stable (SF-0001) et Contrainte Anti-Doublon Présences (Africa/Dakar)

-- 1. Séquence et colonne member_number stable
create sequence if not exists public.member_number_seq start with 1 increment by 1;

alter table public.members
  add column if not exists member_number integer;

-- Rétro-remplissage stable ordonné par created_at pour les membres existants
with ordered_members as (
  select id, row_number() over (order by created_at asc) as seq_num
  from public.members
  where member_number is null
)
update public.members m
set member_number = ordered_members.seq_num
from ordered_members
where m.id = ordered_members.id;

-- Caler la séquence sur la valeur max
select setval('public.member_number_seq', coalesce((select max(member_number) from public.members), 0) + 1, false);

alter table public.members
  alter column member_number set default nextval('public.member_number_seq'),
  alter column member_number set not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'members_member_number_key') then
    alter table public.members add constraint members_member_number_key unique (member_number);
  end if;
end $$;

-- 2. Sécurisation qr_token (opaque 'sfc_' || uuid sans tirets, sans dépendance pgcrypto)
alter table public.members
  add column if not exists qr_token text;

update public.members
set qr_token = 'sfc_' || replace(gen_random_uuid()::text, '-', '')
where qr_token is null or length(qr_token) < 20 or qr_token like 'qr_%';

alter table public.members
  alter column qr_token set default ('sfc_' || replace(gen_random_uuid()::text, '-', '')),
  alter column qr_token set not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'members_qr_token_key') then
    alter table public.members add constraint members_qr_token_key unique (qr_token);
  end if;
end $$;

create index if not exists idx_members_qr_token on public.members (qr_token);

-- 3. Contrainte unique anti-doublon présences par jour calendaire (Africa/Dakar)
create unique index if not exists uq_attendances_member_dakar_day
  on public.attendances (member_id, ((checked_in_at at time zone 'Africa/Dakar')::date));
