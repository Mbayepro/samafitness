# Schéma de Base de Données - SAMBAFITNESS-V2

La persistance PostgreSQL est gérée via **Supabase** avec **Row Level Security (RLS)** systématiquement activé sur l'ensemble des tables.

---

## 1. Tables Principales

### 1.1 `admin_whitelist`
Enregistre la liste blanche des emails autorisés à accéder au panneau d'administration.
- `email` (TEXT, PK) : Email de l'administrateur.
- `role` (TEXT, NOT NULL) : `'super_admin'` ou `'receptionist'`.
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT now())

### 1.2 `members`
Répertoire des adhérents de la salle de sport Samba Fitness.
- `id` (TEXT, PK) : Identifiant unique (ex: `mem_123456...`).
- `full_name` (TEXT, NOT NULL) : Prénom et nom.
- `phone` (TEXT, NOT NULL) : Numéro de téléphone normalisé.
- `plan_id` (TEXT, NOT NULL) : Formule d'adhésion (`muscu-cardio`, `fitness-femme`, etc.).
- `start_date` (DATE, NOT NULL) : Date de début d'abonnement.
- `end_date` (DATE, NOT NULL) : Date d'échéance.
- `status` (TEXT, NOT NULL) : `'actif'`, `'expire_bientot'`, ou `'expire'`.
- `notes` (TEXT, NULL) : Remarques optionnelles.
- `qr_token` (TEXT, NULL, UNIQUE) : Token cryptographique pour pointage par QR Code.
- `created_at`, `updated_at` (TIMESTAMPTZ, NOT NULL)

### 1.3 `payments`
Historique financier et encaissements des abonnements.
- `id` (TEXT, PK) : Identifiant de paiement (ex: `pay_123456...`).
- `member_id` (TEXT, NOT NULL, FK -> `members.id` ON DELETE CASCADE).
- `amount_fcfa` (INTEGER, NOT NULL) : Montant en Francs CFA.
- `method` (TEXT, NOT NULL) : `'Espèces'`, `'Wave'`, ou `'Orange Money'`.
- `period_start` (DATE, NOT NULL) : Période couverte début.
- `period_end` (DATE, NOT NULL) : Période couverte fin.
- `note` (TEXT, NULL) : Référence de transaction ou note.
- `recorded_by` (TEXT, NULL) : Nom ou email de l'administrateur ayant encaissé.
- `created_at` (TIMESTAMPTZ, NOT NULL)

### 1.4 `attendances`
Journal des entrées et pointages au club.
- `id` (TEXT, PK) : Identifiant de pointage.
- `member_id` (TEXT, NOT NULL, FK -> `members.id` ON DELETE CASCADE).
- `checked_in_at` (TIMESTAMPTZ, NOT NULL, DEFAULT now()).
- `recorded_by` (TEXT, NULL) : Opérateur ayant validé l'entrée.
- `method` (TEXT, NOT NULL) : `'manuel'` ou `'qr_code'`.

### 1.5 `leads`
Demandes d'inscription et prospects issus du site public.
- `id` (TEXT, PK) : Identifiant de prospect.
- `name` (TEXT, NOT NULL) : Nom complet.
- `phone` (TEXT, NOT NULL) : Numéro de contact.
- `club` (TEXT, NOT NULL) : Salle demandée (Ndioum).
- `message` (TEXT, NULL) : Message du visiteur.
- `created_at` (TIMESTAMPTZ, NOT NULL)
- `status` (TEXT, NOT NULL) : `'nouveau'`, `'contacté'`, `'inscrit'`, `'archivé'`.

### 1.6 `site_settings`
Configuration éditable du contenu public (textes, tarifs, planning, coaches).
- `id` (TEXT, PK) : `'current'`.
- `content` (JSONB, NOT NULL) : Arbre JSON des données du site.
- `updated_at` (TIMESTAMPTZ, NOT NULL)

---

## 2. Index de Performance (Phase 3.5)

```sql
-- Index optimisés pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_members_phone ON members (phone);
CREATE INDEX IF NOT EXISTS idx_members_plan_status ON members (plan_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_method_date ON payments (method, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_member_period ON payments (member_id, period_end DESC);
CREATE INDEX IF NOT EXISTS idx_attendances_member_date ON attendances (member_id, checked_in_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status_created ON leads (status, created_at DESC);
```

---

## 3. Politiques RLS (Row Level Security)

- `admin_whitelist` : Lecture et écriture réservées aux administrateurs authentifiés.
- `members`, `payments`, `attendances` : Accessibles en lecture/écriture uniquement si `public.is_admin() = true`.
- `leads` : Insertion publique anonyme autorisée (formulaire de contact vitrine) ; lecture et mise à jour réservées aux administrateurs.
- `site_settings` : Lecture publique autorisée ; modification réservée aux `super_admin`.
