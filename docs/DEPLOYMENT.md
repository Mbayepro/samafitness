# Guide de Déploiement - SAMBAFITNESS-V2

Ce guide documente le processus de déploiement en production sur Vercel, Supabase et les environnements compatibles Node.js.

---

## 1. Prérequis

- **Node.js** : v20.x ou supérieure
- **NPM** : v10.x ou supérieure
- **Projet Supabase** : instance PostgreSQL hébergée sur [Supabase](https://supabase.com)
- **Compte Vercel** ou serveur compatible Next.js 16 (Node/Docker)

---

## 2. Variables d'Environnement

Configurez les variables suivantes dans votre interface d'hébergement (ex: Vercel Settings > Environment Variables) :

```env
# Supabase (Obligatoire en production)
NEXT_PUBLIC_SUPABASE_URL="https://votre-projet.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="votre_cle_anon_ou_publishable"
SUPABASE_SERVICE_ROLE_KEY="votre_cle_service_role_secrete"

# Sécurité & Autorisation Admin
ADMIN_ALLOW_DEMO="false"   # Doit être STRICTEMENT false en production

# Optionnel : Analyse de performance
ANALYZE="false"
```

---

## 3. Déploiement de la Base de Données (Supabase)

1. Connectez-vous au **Dashboard Supabase**.
2. Ouvrez l'outil **SQL Editor**.
3. Exécutez le script complet situé dans `supabase/schema.sql`.
4. Vérifiez que les tables `admin_whitelist`, `members`, `payments`, `attendances`, `leads`, et `site_settings` sont créées avec RLS activé.
5. Vérifiez la présence du compte super-administrateur dans `admin_whitelist`.

---

## 4. Déploiement sur Vercel

### Option A : Déploiement continu via Git (Recommandé)
1. Importez le dépôt Git (`master`) dans Vercel.
2. Définissez le Framework Preset : **Next.js**.
3. Renseignez les variables d'environnement listées ci-dessus.
4. Cliquez sur **Deploy**.

### Option B : Déploiement CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 5. Checklist Pré-Production

- [ ] `npm run lint` valide avec 0 erreur
- [ ] `npm run test` : tous les tests unitaires et d'intégration passent
- [ ] `npm run build` termine avec succès
- [ ] Les headers de sécurité (CSP, HSTS, X-Frame-Options) sont actifs
- [ ] Le mode démo est désactivé (`ADMIN_ALLOW_DEMO="false"`)
- [ ] Le compte super-admin officiel est fonctionnel
- [ ] Le rate limiting est actif sur `/admin/login` et la soumission prospect
- [ ] Le Service Worker PWA (`public/sw.js`) est servi correctement en HTTPS

---

## 6. Procédure de Rollback

En cas d'anomalie critique post-déploiement :
1. Sur **Vercel** : accédez à l'onglet *Deployments*, localisez le précédent déploiement stable, puis cliquez sur **Instant Rollback**.
2. En cas de migration de base de données, appliquez le script de rollback ou restaurez le backup Supabase automatisé.
