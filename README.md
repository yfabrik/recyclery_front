# Recyclerie

Interface web de gestion pour les recycleries : caisse, arrivages, étiquetage, planning, administration des magasins et suivi des ventes.

Ce dépôt contient le **front-end** uniquement. Il communique avec une API REST backend (non incluse ici).

## Fonctionnalités

| Module | Route | Description |
|--------|-------|-------------|
| Tableau de bord | `/dashboard` | Statistiques, graphiques, activité récente, météo |
| Logiciel de caisse | `/pos` | Sessions de caisse, panier, scan d'articles, paiement, historique des ventes |
| Avoirs | `/pos/gift-card` | Gestion des cartes cadeaux / avoirs |
| Arrivages | `/arrivals` | Enregistrement et suivi des entrées de stock |
| Étiquetage | `/labels` | Création et impression d'étiquettes (codes-barres) |
| Gestion des déchets | `/waste-management` | Suivi des déchets et éco-organismes |
| Planning | `/planning` | Planning des équipes et des tâches |
| Outils salariés | `/employee-tools` | Outils dédiés aux employés |
| Administration | `/admin` | Configuration, ventes, dons, utilisateurs |
| Magasins & config | `/admin/config/*` | Magasins, catégories, promos, points de collecte… |
| Stats éco-organismes | `/admin/eco-organism-stats` | Statistiques trimestrielles par éco-organisme |

L'accès aux modules dépend du **rôle** utilisateur (`admin`, `manager`, `employee`), géré côté front via `AuthContext` et protégé par des routes authentifiées.

## Stack technique

- **React 19** + **TypeScript**
- **Vite 7** — bundler et serveur de dev
- **Material UI (MUI) 7** — interface et graphiques (`@mui/x-charts`, `@mui/x-date-pickers`)
- **React Router 7** — routage
- **TanStack React Query** — cache et requêtes API
- **React Hook Form** + **Zod** — formulaires et validation
- **Axios** — client HTTP
- **Storybook 10** — développement et documentation des composants
- **Vitest** + **Playwright** — tests (dont tests navigateur sur les stories)

Impression et codes-barres : `jsbarcode`, `jspdf`, `react-to-print`.

## Prérequis

- **Node.js** LTS (voir `Dockerfile`)
- **npm**
- API backend Recyclerie en cours d'exécution (par défaut `http://localhost:5000`)

## Installation

```bash
git clone <url-du-repo>
cd recyclerie_front
npm install
```

## Configuration

Variables d'environnement Vite (fichier `.env` à la racine, ou variables système au build) :

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | URL de base de l'API. En dev, laisser vide : les requêtes `/api` sont proxifiées vers `localhost:5000` par Vite. |
| `VITE_BANNER_TEXT` | Texte optionnel affiché dans la bannière d'environnement (ex. « Environnement de test »). |

Exemple pour un build pointant vers une API distante :

```env
VITE_API_URL=https://api.exemple.fr
VITE_BANNER_TEXT=Staging
```

## Développement

```bash
# Serveur de dev (port 5173 par défaut)
npm run dev

# Linter
npm run lint

# Tests unitaires / composants
npm run test

# Tests en mode watch
npm run test:watch

# Storybook (port 6006)
npm run storybook
```

En développement, le proxy Vite redirige `/api` vers `http://localhost:5000` (configurable dans `vite.config.ts`).

## Build & prévisualisation

```bash
# Build de production (vérifie les types TypeScript)
npm run build

# Build sans vérification TypeScript (utilisé dans le Dockerfile)
npm run fast-build

# Servir le build localement
npm run preview
```

Les artefacts sont générés dans `dist/`.

## Déploiement Docker

Une image Docker multi-étapes (build Node + nginx) est fournie :

```bash
docker build \
  --build-arg VITE_BANNER_TEXT="Production" \
  -t recyclerie-front .
```

Le workflow GitHub Actions (`.github/workflows/docker.yml`) construit et pousse l'image vers `ghcr.io` à chaque push sur `main` modifiant `src/**`.

## Structure du projet

```
src/
├── pages/           # Pages routées (Dashboard, PointOfSale, Planning…)
├── components/      # Composants UI
│   ├── admin/       # Administration et configuration
│   ├── forms/       # Formulaires métier
│   ├── pos/         # Logiciel de caisse
│   ├── planning/    # Vues planning
│   └── transactions/
├── contexts/        # Contexte d'authentification
├── hooks/           # Hooks React personnalisés
├── services/
│   └── api/         # Clients API (axios)
├── interfaces/      # Types et modèles TypeScript
├── constants/       # Constantes métier (rôles, statuts…)
└── utils/           # Utilitaires
```

## API

Les appels HTTP passent par `src/services/api/axios.ts`. Le token JWT est lu depuis `localStorage` et envoyé en en-tête `Authorization: Bearer …`.

Domaines API couverts (entre autres) : transactions, arrivages, articles étiquetés, magasins, employés, planning, tâches, dons, déchets, cartes cadeaux, tableau de bord.

## Rôles et permissions

Trois rôles principaux contrôlent l'accès aux modules :

- **employee** — opérations courantes (caisse, arrivages, étiquetage…)
- **manager** — employee + administration partielle, planning, config magasins
- **admin** — accès complet, y compris gestion des tâches et paramètres système

La matrice des permissions est définie dans `src/contexts/AuthContext.tsx`.

## Licence

Projet privé — usage interne.
