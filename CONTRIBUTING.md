# Guide de Contribution - SAMBAFITNESS-V2

Bienvenue dans le projet **SAMBAFITNESS-V2**, l'application web et de gestion sportive de la salle de sport Samba Fitness à Ndioum (Sénégal).

## Prérequis
- Node.js >= 20.x
- npm >= 10.x
- Instance Supabase (optionnelle en mode démo local)

## Installation & Démarrage

```bash
# Installation des dépendances
npm install --legacy-peer-deps

# Démarrer le serveur de développement Next.js (port 3000)
npm run dev

# Lancer la suite de tests unitaires Vitest
npm test

# Lancer les tests en mode watch
npm run test:watch

# Compiler l'application pour la production
npm run build
```

## Normes & Bonnes Pratiques
1. **Validation systématique** : Toutes les données entrantes doivent être validées avec Zod (`lib/validations/`).
2. **Design System** : Utiliser Tailwind CSS v4 avec les teintes charte (Fond sombre `#080808`, vert lime `#a3e635`).
3. **Tests** : Ajouter des tests unitaires pour tout nouveau schéma ou fonction de calcul dans `lib/`.
4. **Localisation** : Veiller à préserver les coordonnées et données locales de Ndioum (+221 78 957 35 53).
