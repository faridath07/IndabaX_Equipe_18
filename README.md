# 🌍 EcosIA / GbéWé

> **L'intelligence citoyenne pour détecter précocement les risques environnementaux et sanitaires au Bénin.**

Plateforme d'éco-santé qui transforme les signalements citoyens (texte/voix FR/Fon) en données structurées et calcule un **Indice de Risque Sanitaire Environnemental (IRSE)** explicable pour prioriser les interventions.

**Hackathon IndabaX Bénin 2026 — Équipe 18**

---

## 🔗 Liens

| | URL |
|---|---|
| **GitHub Pages (démo principale)** | https://faridath07.github.io/IndabaX_Equipe_18/ |
| **Démo Manus (backup)** | https://ecos-chat-nqqj5jlv.manus.space |
| **Repository GitHub** | https://github.com/faridath07/IndabaX_Equipe_18 |

---

## 📋 Problème

Au Bénin, les inondations urbaines, dépôts sauvages et eaux stagnantes sont des facteurs reconnus de propagation du paludisme et du choléra. Les citoyens signalent ces problèmes au quotidien, mais ces signalements restent dispersés (WhatsApp, appels, réseaux sociaux) et difficiles à exploiter rapidement pour anticiper les risques sanitaires.

## 💡 Solution

EcosIA transforme les signalements citoyens en données structurées et calcule un **Indice de Risque Sanitaire Environnemental (IRSE)** — un score heuristique explicable (0-100) — permettant aux autorités, ONG et communautés de prioriser les interventions.

## ✨ Fonctionnalités

- 🎙️ **Signalement citoyen** : texte ou voix (FR / Fon)
- 🧠 **Classification NLP automatique** : inondation, déchets, eaux stagnantes, insalubrité
- 📍 **Carte interactive** : Leaflet + OpenStreetMap (sans clé API)
- 📊 **Dashboard** : KPIs, graphiques (évolution, répartition, IRSE par zone)
- 🛡️ **Risk Engine IRSE** : score 0-100 explicable et déterministe
- 🌍 **Benin-first** : villes et quartiers réels (Cotonou, Abomey-Calavi, Porto-Novo, Parakou)
- 🎭 **Mode démo** : scénario complet en 2 minutes
- 🌗 **Dark/Light theme** + responsive mobile-first

## 🏗️ Architecture

```
EcosIA/
├── client/                  # Frontend React + TypeScript + Vite
│   ├── public/              # Favicon, robots.txt, sitemap.xml
│   ├── src/
│   │   ├── components/      # Composants UI réutilisables
│   │   ├── pages/           # HomePage, ReportPage, MapPage, DashboardPage, AboutPage
│   │   ├── lib/
│   │   │   ├── risk-engine.ts     # IRSE (score 0-100, explicable)
│   │   │   ├── classifier.ts     # NLP bilingue FR/Fon
│   │   │   └── demo-data.ts      # Données de démonstration (Bénin)
│   │   ├── hooks/
│   │   └── styles.css
│   └── index.html
├── shared/
│   └── types.ts             # Types partagés (Report, RiskLevel, etc.)
├── tests/
│   └── risk-engine.test.ts  # Tests unitaires (Vitest)
├── server/                  # Backend (référence — non déployé sur Pages)
├── .github/workflows/
│   └── deploy.yml           # CI/CD GitHub Pages
├── calcul_risque.py         # Risk Engine Python (référence, exécutable)
├── package.json
├── vite.config.ts           # base: /IndabaX_Equipe_18/
├── tailwind.config.js
└── README.md
```

## 🧠 Pipeline IA

```
Citoyen
   ↓
Signalement (texte FR/Fon, photo)
   ↓
Classification NLP → type de problème
   ↓
Analyse des facteurs (volume, récence, densité, persistance, gravité)
   ↓
IRSE — Indice de Risque Sanitaire Environnemental (0-100)
   ↓
Carte interactive + Dashboard
   ↓
Priorisation des zones d'intervention
```

## 🛡️ Risk Engine — IRSE

L'IRSE est un score **heuristique explicable, déterministe et reproductible**. Ce n'est pas un modèle de Machine Learning.

| Facteur | Poids max | Description |
|---------|-----------|-------------|
| 1. Volume pondéré par type | 50 pts | Inondations (35%), déchets (25%), eaux stagnantes (25%), insalubrité (10%), autres (5%) |
| 2. Récence | 20 pts | Signalements des 7 derniers jours, décroissance linéaire |
| 3. Densité spatiale | 15 pts | Signalements concentrés dans < 1 km = risque élevé |
| 4. Persistance | 10 pts | Types récurrents (≥ 3 occurrences) |
| 5. Gravité perçue | 5 pts | Mots-clés FR/Fon (urgent, grave, ɖaxo, huhu...) |

**Seuils IRSE :**

| Score | Niveau |
|-------|--------|
| 0-24 | 🟢 Faible |
| 25-49 | 🟡 Modéré |
| 50-74 | 🟠 Élevé |
| 75-100 | 🔴 Critique |

## 🛠️ Technologies

- **React 18** + **TypeScript** + **Vite 5**
- **Tailwind CSS** (dark/light theme)
- **Leaflet** + **OpenStreetMap** (cartes, sans clé API)
- **Recharts** (visualisations)
- **Vitest** (tests unitaires)
- **lucide-react** (icônes)
- **Calcul Risk Engine** : TypeScript (frontend) + Python (`calcul_risque.py`)

## 📦 Installation

### Prérequis
- Node.js 20+
- npm

### Lancer en local

```bash
git clone https://github.com/faridath07/IndabaX_Equipe_18.git
cd IndabaX_Equipe_18
npm install
npm run dev
```

Le site sera accessible sur `http://localhost:5173`.

### Build de production

```bash
npm run build      # Build + TypeScript check
npm run preview     # Prévisualiser le build
```

### Tests

```bash
npm test            # Lancer tous les tests
npm run test:watch  # Mode watch
```

## 🌍 Variables d'environnement

Aucune variable d'environnement n'est requise pour faire fonctionner la démo. Toutes les fonctionnalités sont 100% client-side.

Si vous souhaitez intégrer une vraie API de transcription Fon (non incluse), créez un fichier `.env` à la racine:

```env
# Optionnel — pour une vraie API STT Fon
VITE_STT_API_URL=
VITE_STT_API_KEY=
```

## 🚀 Déploiement

Le déploiement est **automatique** via GitHub Actions à chaque push sur la branche `main`.

Workflow: `.github/workflows/deploy.yml`
- Install dependencies (`npm ci`)
- Type check (`tsc --noEmit`)
- Tests (`npm test`)
- Build (`npm run build`)
- Deploy to GitHub Pages

L'URL publique est : **https://faridath07.github.io/IndabaX_Equipe_18/**

## ⚠️ Limites

- Les signalements affichés sont des **données de démonstration** fictives.
- L'IRSE est une heuristique, **pas un modèle ML**. Elle est explicable mais indicative.
- L'objectif n'est pas de prédire une épidémie, mais de produire un **indice de risque** pour aider à prioriser.
- La reconnaissance vocale Fon en direct nécessiterait un modèle STT externe.
- Aucune donnée personnelle n'est collectée — l'app est 100% client-side.

## 🗺️ Roadmap

- [ ] Intégration WhatsApp Business API pour les signalements
- [ ] Vraie reconnaissance vocale Fon (modèle STT spécialisé)
- [ ] Notifications temps réel aux autorités
- [ ] Mode offline (PWA) pour zones à faible connectivité
- [ ] API ouverte pour intégrations tierces
- [ ] Version mobile native (React Native)

## 👥 Équipe

**Équipe 18 — IndabaX Bénin 2026**

Une solution inclusive qui sauve des vies. 🌍

## 📄 Licence

MIT — Libre d'utilisation et de modification.

---

**Built in Benin, designed for Africa.** 🇧🇯
