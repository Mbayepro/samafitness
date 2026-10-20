"use client";

import type { FeedbackKind } from "@/app/admin/admin-types";

interface SupabaseTabProps {
  supabaseConfigured: boolean;
  showFeedback: (type: FeedbackKind, text: string) => void;
}

export default function SupabaseTab({ supabaseConfigured, showFeedback }: SupabaseTabProps) {
  return (
    <div className="mt-8 max-w-4xl space-y-6">
      {/* Status card */}
      <div className="rounded-3xl border border-white/10 bg-[#121212] p-8">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-4 w-4 items-center justify-center rounded-full ${
              supabaseConfigured ? "bg-emerald-400" : "bg-amber-400"
            }`}
          />
          <h3 className="text-lg font-black uppercase text-white">
            Statut Supabase :{" "}
            {supabaseConfigured ? "Connecté & Opérationnel" : "Non configuré (Mode Local / Démo)"}
          </h3>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-white/70">
          {supabaseConfigured
            ? "Vos variables d'environnement Supabase sont détectées. Les prospects et les modifications de configuration sont automatiquement synchronisés en temps réel avec votre base PostgreSQL Supabase."
            : "Le site fonctionne actuellement en mode local sécurisé (les prospects et les réglages sont sauvegardés dans le dossier 'data/' du projet). Pour activer Supabase et stocker vos données sur le Cloud :"}
        </p>

        {!supabaseConfigured && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-xs text-lime-400">
            <p className="text-white/40 mb-1">{"// Créez le fichier .env.local à la racine du projet :"}</p>
            <p>NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co</p>
            <p>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=votre-cle-publique-anon</p>
          </div>
        )}
      </div>

      {/* Guide Authentification Google OAuth */}
      <div className="rounded-3xl border border-white/10 bg-[#121212] p-8">
        <div className="flex items-center gap-3">
          <svg className="h-6 w-6" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <h3 className="text-lg font-black uppercase text-white">
            Configuration Authentification Google OAuth
          </h3>
        </div>
        <p className="mt-2 text-xs text-white/60">
          Pour vous connecter avec un compte Google (ex. <code>smarieme589@gmail.com</code>) :
        </p>

        <ol className="mt-4 list-decimal space-y-2 pl-4 text-xs text-white/70">
          <li>
            Sur le tableau de bord Supabase, allez dans{" "}
            <strong className="text-white">Authentication &gt; Providers &gt; Google</strong>.
          </li>
          <li>
            Activez <strong className="text-lime-400">Enable Google provider</strong>.
          </li>
          <li>
            Copiez la <strong className="text-white">Callback URL</strong> fournie par Supabase{" "}
            <code className="text-white/50">(ex. https://&lt;projet&gt;.supabase.co/auth/v1/callback)</code>.
          </li>
          <li>
            Sur{" "}
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noreferrer"
              className="text-lime-400 underline"
            >
              Google Cloud Console
            </a>
            , créez des identifiants <strong>ID Client OAuth 2.0 (Application Web)</strong>, ajoutez l&apos;URL de rappel Supabase dans <em>URIs de redirection autorisés</em>, puis collez l&apos;ID Client et le Secret Client dans Supabase.
          </li>
          <li>
            Dans Supabase &gt; <strong className="text-white">Authentication &gt; URL Configuration</strong>, ajoutez dans <em>Redirect URLs</em> :
            <div className="mt-1 rounded-xl bg-black/50 p-2 font-mono text-[11px] text-lime-400">
              http://localhost:3000/auth/callback
            </div>
          </li>
        </ol>
      </div>

      {/* Script SQL Supabase */}
      <div className="rounded-3xl border border-white/10 bg-[#121212] p-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black uppercase text-white">
              Tables &amp; Schéma SQL Supabase
            </h3>
            <p className="mt-1 text-xs text-white/50">
              Fichier disponible à la racine :{" "}
              <code className="text-lime-400">supabase/schema.sql</code>. Exécutez ce script dans le <strong>SQL Editor</strong> de Supabase.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              const fullSql = `-- 1. TABLE DES DEMANDES D'INSCRIPTION (LEADS)
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

create policy "Les visiteurs peuvent soumettre une demande"
    on public.leads for insert to anon, authenticated with check (true);

create policy "Les administrateurs peuvent voir les demandes"
    on public.leads for select to authenticated using (true);

create policy "Les administrateurs peuvent modifier les demandes"
    on public.leads for update to authenticated using (true) with check (true);

create policy "Les administrateurs peuvent supprimer des demandes"
    on public.leads for delete to authenticated using (true);

-- 2. TABLE DES PARAMÈTRES DU SITE (SITE_SETTINGS)
create table if not exists public.site_settings (
    id text primary key default 'current',
    content jsonb not null,
    updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

create policy "Tout le monde peut lire le contenu du site"
    on public.site_settings for select to anon, authenticated using (true);

create policy "Les administrateurs peuvent mettre à jour le contenu"
    on public.site_settings for all to authenticated using (true) with check (true);

-- 3. TABLE ADMIN WHITELIST (OPTIONNELLE)
create table if not exists public.admin_whitelist (
    email text primary key,
    role text not null default 'super_admin',
    created_at timestamptz not null default now()
);

alter table public.admin_whitelist enable row level security;
create policy "Lecture whitelist pour connectés" on public.admin_whitelist for select to authenticated using (true);

insert into public.admin_whitelist (email, role)
values ('smarieme589@gmail.com', 'super_admin')
on conflict (email) do nothing;`;
              navigator.clipboard.writeText(fullSql);
              showFeedback("success", "Script SQL copié dans le presse-papier !");
            }}
            className="rounded-full bg-lime-400 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black hover:bg-lime-300 transition shadow-md shadow-lime-400/10"
          >
            Copier tout le SQL
          </button>
        </div>

        <pre className="mt-6 max-h-96 overflow-auto rounded-2xl border border-white/10 bg-black/70 p-5 font-mono text-xs text-white/80 leading-relaxed">
{`-- 1. TABLE DES DEMANDES D'INSCRIPTION (LEADS)
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

create policy "Les visiteurs peuvent soumettre une demande"
    on public.leads for insert to anon, authenticated with check (true);

create policy "Les administrateurs peuvent voir les demandes"
    on public.leads for select to authenticated using (true);

create policy "Les administrateurs peuvent modifier les demandes"
    on public.leads for update to authenticated using (true) with check (true);

create policy "Les administrateurs peuvent supprimer des demandes"
    on public.leads for delete to authenticated using (true);

-- 2. TABLE DES PARAMÈTRES DU SITE (SITE_SETTINGS)
create table if not exists public.site_settings (
    id text primary key default 'current',
    content jsonb not null,
    updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

create policy "Tout le monde peut lire le contenu du site"
    on public.site_settings for select to anon, authenticated using (true);

create policy "Les administrateurs peuvent mettre à jour le contenu"
    on public.site_settings for all to authenticated using (true) with check (true);

-- 3. TABLE ADMIN WHITELIST (OPTIONNELLE)
create table if not exists public.admin_whitelist (
    email text primary key,
    role text not null default 'super_admin',
    created_at timestamptz not null default now()
);

alter table public.admin_whitelist enable row level security;
create policy "Lecture whitelist pour connectés" on public.admin_whitelist for select to authenticated using (true);

insert into public.admin_whitelist (email, role)
values 
    ('sambafitnessadmin@gmail.com', 'super_admin'),
    ('smarieme589@gmail.com', 'super_admin')
on conflict (email) do nothing;`}
        </pre>
      </div>
    </div>
  );
}
