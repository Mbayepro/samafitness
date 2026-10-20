-- ==============================================================================
-- SAMBA FITNESS NDIOUM - MODULE FINANCES : TABLE DES DÉPENSES (EXPENSES)
-- Migration : 20261020120000_create_expenses.sql
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

-- Index pour optimiser les filtres temporels, catégories et le soft-delete
create index if not exists idx_expenses_paid_at on public.expenses (paid_at desc);
create index if not exists idx_expenses_created_at on public.expenses (created_at desc);
create index if not exists idx_expenses_category on public.expenses (category);
create index if not exists idx_expenses_deleted_at on public.expenses (deleted_at);

-- Activation de Row Level Security
alter table public.expenses enable row level security;

-- 1. Lecture : Réservée au super-admin, SANS filtre sur deleted_at
-- (Le filtrage "deleted_at is null" est géré au niveau des requêtes applicatives)
drop policy if exists "Super admin peut lire les dépenses" on public.expenses;
create policy "Super admin peut lire les dépenses"
    on public.expenses
    for select
    to authenticated
    using (private.is_super_admin());

-- 2. Insertion : Réservée au super-admin
drop policy if exists "Super admin peut insérer des dépenses" on public.expenses;
create policy "Super admin peut insérer des dépenses"
    on public.expenses
    for insert
    to authenticated
    with check (private.is_super_admin());

-- 3. Modification & Soft Delete : Réservée au super-admin
-- La clause USING évalue l'ancienne ligne et WITH CHECK la nouvelle :
-- Comme aucune ne conditionne deleted_at, l'UPDATE de soft delete passe sans blocage RLS.
drop policy if exists "Super admin peut modifier ou archiver des dépenses" on public.expenses;
create policy "Super admin peut modifier ou archiver des dépenses"
    on public.expenses
    for update
    to authenticated
    using (private.is_super_admin())
    with check (private.is_super_admin());

-- 4. Suppression définitive (HARD DELETE) :
-- Aucune politique DELETE n'est créée afin d'interdire tout DELETE physique via l'API Supabase.
-- Tout archivage s'effectue exclusivement par UPDATE (deleted_at = now(), deleted_by = ...).
