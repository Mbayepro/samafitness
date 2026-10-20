# Guide de Dépannage (Troubleshooting) - SAMBAFITNESS-V2

## 1. Problèmes d'Authentification Admin

### Erreur "Accès refusé - Votre compte n'est pas autorisé"
- **Cause** : Votre compte Supabase Auth existe, mais votre adresse email ne figure pas dans la table `admin_whitelist`.
- **Solution** :
  1. Ouvrez le SQL Editor de Supabase.
  2. Insérez votre email :
     ```sql
     insert into public.admin_whitelist (email, role)
     values ('votre-email@example.com', 'super_admin');
     ```

### Message "Mode démo indisponible"
- **Cause** : Le bouton Démo n'est accessible qu'en environnement de développement local (`NODE_ENV === "development"` et `ADMIN_ALLOW_DEMO !== "false"`).
- **Solution** : En production, connectez-vous avec vos identifiants réels créés dans Supabase Auth.

---

## 2. Erreurs de Rate Limiting (HTTP 429)

### "Trop de tentatives de connexion. Réessayez dans X min."
- **Cause** : Plus de 5 tentatives de connexion ont été soumises depuis la même adresse IP en moins de 15 minutes.
- **Solution** : Patientez le délai indiqué ou, en environnement de test, redémarrez le serveur pour réinitialiser les compteurs en mémoire.

### "Trop de demandes d'inscription. Réessayez dans X min."
- **Cause** : Plus de 3 formulaires de séance d'essai ont été envoyés depuis la même adresse IP en 1 heure.
- **Solution** : Protection anti-spam normale. Patientez avant de soumettre un nouveau formulaire.

---

## 3. Problèmes de Caméra / Scanner QR Code

### "Impossible d'accéder à la caméra"
- **Cause** : Permissions refusées par le navigateur ou site non servi sous HTTPS.
- **Solution** :
  1. Les API de flux vidéo (`navigator.mediaDevices.getUserMedia`) requièrent un contexte sécurisé (HTTPS ou `localhost`).
  2. Cliquez sur l'icône de cadenas dans la barre d'adresse du navigateur et autorisez l'accès à la caméra.
  3. Si la caméra physique est absente ou défaillante, utilisez l'onglet *Saisie directe* pour entrer le numéro de téléphone ou l'ID de l'adhérent.

---

## 4. Données et Synchronisation Supabase

### Données non synchronisées en local
- **Cause** : Les variables `NEXT_PUBLIC_SUPABASE_URL` ou `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` sont absentes ou contiennent des placeholders (`votre-projet.supabase.co`).
- **Comportement** : L'application bascule automatiquement en mode hors-ligne sur les fichiers `data/*.json`.
- **Solution** : Renseignez les vraies clés fournies par votre projet Supabase dans `.env.local`.
