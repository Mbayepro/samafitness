-- ==============================================================================
-- SAMBA FITNESS NDIOUM - SCHÉMA DE BASE DE DONNÉES SUPABASE COMPLET (V2 - SÉCURISÉ)
-- Sécurité renforcée (RLS stricte + Schéma interne private + Zéro avertissement Linter)
-- ==============================================================================
-- Instructions d'exécution :
-- 1. Rendez-vous sur votre tableau de bord Supabase : https://supabase.com/dashboard
-- 2. Sélectionnez votre projet
-- 3. Cliquez sur "SQL Editor" dans le menu latéral gauche
-- 4. Cliquez sur "New query"
-- 5. Collez l'intégralité de ce script et cliquez sur le bouton vert "Run"
-- ==============================================================================

-- 1. ACTIVATION DES EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 2. TABLE DES ADMINISTRATEURS AUTORISÉS & RÔLES (ADMIN_WHITELIST)
-- ==============================================================================
create table if not exists public.admin_whitelist (
    email text primary key,
    role text not null default 'super_admin' check (role in ('super_admin', 'receptionist')),
    created_at timestamptz not null default now()
);

alter table public.admin_whitelist enable row level security;

-- Inscrire par défaut les administrateurs officiels du club comme super_admin
insert into public.admin_whitelist (email, role)
values 
    ('sambafitnessadmin@gmail.com', 'super_admin'),
    ('smarieme589@gmail.com', 'super_admin')
on conflict (email) do update set role = excluded.role;

-- Nettoyage préventif des valeurs NULL dans auth.users si un script antérieur en a injecté
update auth.users 
set confirmation_token = coalesce(confirmation_token, ''),
    email_change = coalesce(email_change, ''),
    email_change_token_new = coalesce(email_change_token_new, ''),
    recovery_token = coalesce(recovery_token, '')
where lower(email) in ('sambafitnessadmin@gmail.com', 'smarieme589@gmail.com');

-- ==============================================================================
-- 2.1 SCHÉMA PRIVÉ POUR LES FONCTIONS D'AUTORISATION INTERNES
-- ==============================================================================
create schema if not exists private;
grant usage on schema private to anon, authenticated, service_role;

-- Nettoyage des anciennes fonctions dans public (cascade supprime les anciennes policies qui en dépendent avant qu'elles soient recréées)
drop function if exists public.is_super_admin() cascade;
drop function if exists public.is_admin() cascade;
drop function if exists public.current_admin_role() cascade;

-- Fonctions utilitaires d'autorisation sécurisées (schéma private)
create or replace function private.current_admin_role()
returns text
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select role from public.admin_whitelist
  where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  limit 1;
$$;

create or replace function private.is_admin()
returns boolean
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select private.current_admin_role() is not null;
$$;

create or replace function private.is_super_admin()
returns boolean
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select private.current_admin_role() = 'super_admin';
$$;

grant execute on all functions in schema private to anon, authenticated, service_role;

-- Politiques RLS pour admin_whitelist
drop policy if exists "Lecture whitelist pour admins" on public.admin_whitelist;
drop policy if exists "Lecture de son propre statut admin" on public.admin_whitelist;
create policy "Lecture de son propre statut admin"
    on public.admin_whitelist
    for select
    to authenticated
    using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')) or private.is_admin());

drop policy if exists "Modification whitelist super_admin" on public.admin_whitelist;
create policy "Modification whitelist super_admin"
    on public.admin_whitelist
    for all
    to authenticated
    using (private.is_super_admin())
    with check (private.is_super_admin());


-- ==============================================================================
-- 3. TABLE DES DEMANDES D'INSCRIPTION / PROSPECTS (LEADS)
-- ==============================================================================
create table if not exists public.leads (
    id text primary key default ('lead_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 6)),
    name text not null,
    phone text not null,
    club text not null default 'Samba Fitness Club Ndioum',
    message text,
    status text not null default 'nouveau' check (status in ('nouveau', 'contacté', 'inscrit', 'archivé')),
    created_at timestamptz not null default now()
);

create index if not exists idx_leads_created_at on public.leads (created_at desc);
create index if not exists idx_leads_status on public.leads (status);

alter table public.leads enable row level security;

-- Politiques RLS pour leads (Protection stricte contre les abus et élimination de rls_policy_always_true)
drop policy if exists "Visiteurs peuvent soumettre une demande" on public.leads;
create policy "Visiteurs peuvent soumettre une demande"
    on public.leads
    for insert
    to anon, authenticated
    with check (
        length(trim(name)) >= 2
        and length(trim(phone)) >= 6
        and length(trim(club)) >= 2
        and status = 'nouveau'
    );

drop policy if exists "Admins peuvent lire les demandes" on public.leads;
create policy "Admins peuvent lire les demandes"
    on public.leads
    for select
    to authenticated
    using (private.is_admin());

drop policy if exists "Admins peuvent modifier les demandes" on public.leads;
create policy "Admins peuvent modifier les demandes"
    on public.leads
    for update
    to authenticated
    using (private.is_admin())
    with check (private.is_admin());

drop policy if exists "Super admin peut supprimer les demandes" on public.leads;
create policy "Super admin peut supprimer les demandes"
    on public.leads
    for delete
    to authenticated
    using (private.is_super_admin());


-- ==============================================================================
-- 4. TABLE DES PARAMÈTRES ET DU CONTENU DU SITE (SITE_SETTINGS)
-- ==============================================================================
create table if not exists public.site_settings (
    id text primary key default 'current',
    content jsonb not null,
    updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "Tout le monde peut lire le contenu" on public.site_settings;
create policy "Tout le monde peut lire le contenu"
    on public.site_settings
    for select
    to anon, authenticated
    using (true);

drop policy if exists "Seul le super-admin peut modifier le contenu" on public.site_settings;
create policy "Seul le super-admin peut modifier le contenu"
    on public.site_settings
    for all
    to authenticated
    using (private.is_super_admin())
    with check (private.is_super_admin());


-- ==============================================================================
-- 5. MODULE GESTION DE SALLE : TABLE DES MEMBRES (MEMBERS)
-- ==============================================================================
create table if not exists public.members (
    id text primary key default ('mem_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 6)),
    full_name text not null,
    phone text not null,
    plan_id text not null,
    start_date date not null default current_date,
    end_date date not null,
    status text not null default 'actif' check (status in ('actif', 'expire_bientot', 'expire')),
    notes text,
    qr_token text unique default encode(gen_random_bytes(16), 'hex'),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_members_status on public.members (status);
create index if not exists idx_members_phone on public.members (phone);
create index if not exists idx_members_end_date on public.members (end_date);
create index if not exists idx_members_qr_token on public.members (qr_token);

alter table public.members enable row level security;

drop policy if exists "Admins peuvent voir les membres" on public.members;
create policy "Admins peuvent voir les membres"
    on public.members
    for select
    to authenticated
    using (private.is_admin());

drop policy if exists "Admins peuvent créer des membres" on public.members;
create policy "Admins peuvent créer des membres"
    on public.members
    for insert
    to authenticated
    with check (private.is_admin());

drop policy if exists "Admins peuvent modifier des membres" on public.members;
create policy "Admins peuvent modifier des membres"
    on public.members
    for update
    to authenticated
    using (private.is_admin())
    with check (private.is_admin());

drop policy if exists "Super admin peut supprimer des membres" on public.members;
create policy "Super admin peut supprimer des membres"
    on public.members
    for delete
    to authenticated
    using (private.is_super_admin());


-- ==============================================================================
-- 6. MODULE GESTION DE SALLE : TABLE DES PAIEMENTS (PAYMENTS)
-- ==============================================================================
create table if not exists public.payments (
    id text primary key default ('pay_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 6)),
    member_id text not null references public.members(id) on delete cascade,
    amount_fcfa integer not null check (amount_fcfa > 0),
    method text not null check (method in ('Espèces', 'Wave', 'Orange Money')),
    period_start date not null,
    period_end date not null,
    note text,
    recorded_by text,
    created_at timestamptz not null default now()
);

create index if not exists idx_payments_member_id on public.payments (member_id);
create index if not exists idx_payments_created_at on public.payments (created_at desc);

alter table public.payments enable row level security;

drop policy if exists "Admins peuvent voir les paiements" on public.payments;
create policy "Admins peuvent voir les paiements"
    on public.payments
    for select
    to authenticated
    using (private.is_admin());

drop policy if exists "Admins peuvent enregistrer des paiements" on public.payments;
create policy "Admins peuvent enregistrer des paiements"
    on public.payments
    for insert
    to authenticated
    with check (private.is_admin());

drop policy if exists "Super admin peut modifier ou supprimer des paiements" on public.payments;
create policy "Super admin peut modifier ou supprimer des paiements"
    on public.payments
    for all
    to authenticated
    using (private.is_super_admin())
    with check (private.is_super_admin());


-- ==============================================================================
-- 7. MODULE GESTION DE SALLE : TABLE DES PRÉSENCES (ATTENDANCES)
-- ==============================================================================
create table if not exists public.attendances (
    id text primary key default ('att_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 6)),
    member_id text not null references public.members(id) on delete cascade,
    checked_in_at timestamptz not null default now(),
    recorded_by text,
    method text not null default 'manuel' check (method in ('manuel', 'qr_code'))
);

create index if not exists idx_attendances_member_id on public.attendances (member_id);
create index if not exists idx_attendances_checked_in_at on public.attendances (checked_in_at desc);

alter table public.attendances enable row level security;

drop policy if exists "Admins peuvent voir les présences" on public.attendances;
create policy "Admins peuvent voir les présences"
    on public.attendances
    for select
    to authenticated
    using (private.is_admin());

drop policy if exists "Admins peuvent enregistrer les présences" on public.attendances;
create policy "Admins peuvent enregistrer les présences"
    on public.attendances
    for insert
    to authenticated
    with check (private.is_admin());

drop policy if exists "Super admin peut supprimer les présences" on public.attendances;
create policy "Super admin peut supprimer les présences"
    on public.attendances
    for delete
    to authenticated
    using (private.is_super_admin());


-- ==============================================================================
-- 8. MODULE FINANCES : TABLE DES DÉPENSES (EXPENSES) AVEC SOFT DELETE & RLS
-- ==============================================================================
create table if not exists public.expenses (
    id text primary key default ('exp_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 6)),
    amount_fcfa integer not null check (amount_fcfa > 0),
    category text not null check (category in ('loyer', 'electricite', 'eau_internet', 'salaires', 'materiel', 'maintenance', 'autre')),
    description text,
    paid_at date not null default current_date,
    created_by text,
    created_at timestamptz not null default now(),
    deleted_at timestamptz default null,
    deleted_by text default null
);

create index if not exists idx_expenses_paid_at on public.expenses (paid_at desc);
create index if not exists idx_expenses_created_at on public.expenses (created_at desc);
create index if not exists idx_expenses_category on public.expenses (category);
create index if not exists idx_expenses_deleted_at on public.expenses (deleted_at);

alter table public.expenses enable row level security;

drop policy if exists "Super admin peut lire les dépenses" on public.expenses;
create policy "Super admin peut lire les dépenses"
    on public.expenses
    for select
    to authenticated
    using (private.is_super_admin());

drop policy if exists "Super admin peut insérer des dépenses" on public.expenses;
create policy "Super admin peut insérer des dépenses"
    on public.expenses
    for insert
    to authenticated
    with check (private.is_super_admin());

drop policy if exists "Super admin peut modifier ou archiver des dépenses" on public.expenses;
create policy "Super admin peut modifier ou archiver des dépenses"
    on public.expenses
    for update
    to authenticated
    using (private.is_super_admin())
    with check (private.is_super_admin());


-- ==============================================================================
-- 9. INDEX DE PERFORMANCE SUPPLÉMENTAIRES (PHASE 3.5)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_members_plan_status ON public.members (plan_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_method_date ON public.payments (method, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_member_period ON public.payments (member_id, period_end DESC);
CREATE INDEX IF NOT EXISTS idx_attendances_member_date ON public.attendances (member_id, checked_in_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status_created ON public.leads (status, created_at DESC);


-- ==============================================================================
-- 9. DONNÉES DE DÉMONSTRATION INITIALES
-- ==============================================================================
-- Leads initiaux
insert into public.leads (id, name, phone, club, message, status, created_at)
values
    ('lead_demo_1', 'Ousmane Sow', '+221 77 123 45 67', 'Samba Fitness Club Ndioum', 'Intéressé par le forfait musculation et remise en forme.', 'nouveau', now() - interval '2 days'),
    ('lead_demo_2', 'Fatou Fall', '+221 78 234 56 78', 'Samba Fitness Club Ndioum', 'Demande d''information pour les cours collectifs femmes.', 'contacté', now() - interval '3 days'),
    ('lead_demo_3', 'Amadou Ba', '+221 76 345 67 89', 'Samba Fitness Club Ndioum', 'Inscription finalisée au club.', 'inscrit', now() - interval '1 day')
on conflict (id) do nothing;

-- Membres initiaux
insert into public.members (id, full_name, phone, plan_id, start_date, end_date, status, notes, qr_token)
values
    ('mem_demo_1', 'MBaye', '+221 77 036 26 16', 'mensuel', current_date - interval '10 days', current_date + interval '20 days', 'actif', 'Inscrit après visite.', 'qr_token_Mbaye'),
    ('mem_demo_2', 'SY Anta', '+221 78 198 24 55', 'trimestriel', current_date - interval '85 days', current_date + interval '5 days', 'expire_bientot', 'Cardio + Musculation', 'qr_token_SY_Anta'),
    ('mem_demo_3', 'khalifa Baradji', '+221 78 376 21 83', 'mensuel', current_date - interval '40 days', current_date - interval '10 days', 'expire', 'Relance Wave à effectuer', 'qr_token_khalifa_Baradji'),
    ('mem_demo_4', 'Marieme Sy', '+221 78 957 35 53', 'annuel', current_date - interval '30 days', current_date + interval '335 days', 'actif', 'Membre assidue matin', 'qr_token_Marieme_Sy')
on conflict (id) do nothing;

-- Paiements initiaux
insert into public.payments (id, member_id, amount_fcfa, method, period_start, period_end, note, recorded_by, created_at)
values
    ('pay_demo_1', 'mem_demo_1', 15000, 'Wave', current_date - interval '10 days', current_date + interval '20 days', 'Abonnement mensuel', 'Samba Diop', now() - interval '10 days'),
    ('pay_demo_2', 'mem_demo_2', 40000, 'Orange Money', current_date - interval '85 days', current_date + interval '5 days', 'Forfait 3 mois', 'Samba Diop', now() - interval '85 days'),
    ('pay_demo_3', 'mem_demo_4', 150000, 'Espèces', current_date - interval '30 days', current_date + interval '335 days', 'Forfait annuel complet', 'Samba Diop', now() - interval '30 days')
on conflict (id) do nothing;

-- Présences initiales
insert into public.attendances (id, member_id, checked_in_at, recorded_by, method)
values
    ('att_demo_1', 'mem_demo_1', now() - interval '2 hours', 'Samba Diop', 'manuel'),
    ('att_demo_2', 'mem_demo_4', now() - interval '3 hours', 'Samba Diop', 'manuel'),
    ('att_demo_3', 'mem_demo_1', now() - interval '1 day', 'Samba Diop', 'manuel')
on conflict (id) do nothing;

-- ==============================================================================
-- ACCÈS POSTGREST / TABLE EDITOR SUPABASE
-- ==============================================================================
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all routines in schema public to anon, authenticated, service_role;

-- ==============================================================================
-- FIN DU SCRIPT - TOUTES LES TABLES ET INDEX SONT PRÊTS ET SÉCURISÉS !
-- ==============================================================================
