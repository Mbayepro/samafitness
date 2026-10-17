# SAMBAFITNESS 🏋️‍♂️

Site vitrine moderne et performant pour la chaîne de salles de sport **SAMBAFITNESS**, développé avec **Next.js (App Router)**, **Tailwind CSS v4** et **Supabase**.

---

## ⚡ Fonctionnalités

- **Design Premium & Énergique** : Thème sombre athlétique aux accents vert lime (`lime-400`), typographie Geist.
- **Données 100% centralisées** : Toutes les informations du site (clubs, tarifs, horaires, coachs, coordonnées) sont configurables dans `lib/site-data.ts`.
- **Navigation fluide** : Menu de navigation avec version mobile responsive, liens d'ancre fluides et bouton d'action WhatsApp instantané.
- **Sections complètes** :
  - **Hero** percutant avec CTA d'inscription et d'essai gratuit.
  - **Chiffres clés & Services** détaillés.
  - **Nos Clubs** : Adresses, horaires complets, équipements et géolocalisation Google Maps.
  - **Tarifs clairs** : 3 formules transparentes avec mise en avant de la formule phare.
  - **Équipe de Coachs** : Présentation et spécialités de chaque entraîneur.
  - **Planning des Cours** : Grille des disciplines et créneaux hebdomadaires.
  - **Foire Aux Questions (FAQ)** : Réponses interactives en accordéon.
  - **Formulaire d'essai gratuit** : Validation côté serveur avec Server Actions et enregistrement Supabase.

---

## 🛠️ Stack Technique

- **Framework** : [Next.js](https://nextjs.org/) (App Router, React 19)
- **Styles** : [Tailwind CSS v4](https://tailwindcss.com/)
- **Polices** : [Geist Sans & Geist Mono](https://vercel.com/font)
- **Base de données / Backend** : [Supabase](https://supabase.com/) (`@supabase/ssr`, `@supabase/supabase-js`)
- **Icônes / Typographie** : SVG natifs optimisés et icônes d'interface légères

---

## 🚀 Démarrage Rapide

### 1. Cloner et installer les dépendances

```bash
git clone <url-du-depot>
cd sambafitness-main
npm install
```

### 2. Configurer les variables d'environnement

Copiez le fichier `.env.example` vers `.env.local` :

```bash
cp .env.example .env.local
```

Renseignez vos clés de projet Supabase :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=votre-cle-publique-anon
```

> **Note :** Si vous n'avez pas encore configuré Supabase, le formulaire bascule automatiquement en mode simulation sécurisé pour permettre de tester l'interface sans crash.

### 3. Schéma Supabase recommandé (Optionnel)

Pour stocker les demandes d'essai gratuit, créez une table `leads` (ou `trial_requests`) dans votre projet Supabase :

```sql
create table leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  phone text not null,
  club text not null,
  message text,
  status text default 'nouveau'
);
```

### 4. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## 📦 Scripts Disponibles

- `npm run dev` : Lance le serveur de développement avec Turbopack.
- `npm run build` : Compile et optimise l'application pour la production.
- `npm run start` : Démarre le serveur de production.
- `npm run lint` : Vérifie la conformité du code avec ESLint.

---

## 📁 Architecture du Projet

```text
├── app/
│   ├── globals.css          # Styles globaux & tokens Tailwind CSS v4
│   ├── layout.tsx           # Layout racine (Geist, Metadata FR, SEO)
│   └── page.tsx             # Page d'accueil intégrant les sections
├── components/              # Composants modulaires de la landing page
│   ├── Navbar.tsx           # Navigation principale et menu mobile
│   ├── Hero.tsx             # Section d'accroche et CTA
│   ├── Stats.tsx            # Chiffres clés du club
│   ├── Services.tsx         # Présentation des prestations
│   ├── Salles.tsx           # Cartes détaillées des 3 salles avec Google Maps
│   ├── Tarifs.tsx           # Grille tarifaire avec formule recommandée
│   ├── Coachs.tsx           # Équipe des coachs certifiés
│   ├── Planning.tsx         # Horaires et planning des cours collectifs
│   ├── FAQ.tsx              # Foire aux questions en accordéon
│   ├── TrialForm.tsx        # Formulaire d'essai gratuit (Server Action)
│   ├── WhatsAppButton.tsx   # Bouton flottant WhatsApp direct
│   └── Footer.tsx           # Pied de page et mentions
├── lib/
│   ├── site-data.ts         # SOURCE UNIQUE DE VÉRITÉ : toutes les données textuelles/fictives
│   └── supabase/            # Clients Supabase (navigateur et serveur SSR)
```
