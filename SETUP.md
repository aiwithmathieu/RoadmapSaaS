# Roadmap SaaS — Setup Vercel + GitHub Sync

## Architecture

```
RoadmapSaaS/
├── index.html          ← Interface roadmap
├── data.json           ← Données (auto-committé par l'API)
├── api/
│   └── save.js         ← Serverless function Vercel (commit GitHub)
├── vercel.json         ← Config Vercel
└── package.json
```

**Flow :**
1. Page charge → fetch `data.json` depuis GitHub (lecture publique, gratuit)
2. Tu modifies une feature → sauvegarde localStorage (instantané) + POST `/api/save` (debounce 2s)
3. La serverless function commit `data.json` dans le repo via GitHub API
4. Léo (ou n'importe qui) charge la page → voit les données à jour

## Setup (15 minutes)

### 1. Créer un GitHub Personal Access Token

1. Va sur https://github.com/settings/tokens?type=beta
2. "Generate new token" (Fine-grained)
3. Nom : `roadmap-vercel`
4. Repository access : "Only select repositories" → **RoadmapSaaS**
5. Permissions → Repository permissions :
   - **Contents** : Read and Write
   - C'est tout
6. "Generate token" → **copie le token** (tu ne le reverras plus)

### 2. Remplacer le contenu du repo GitHub

Remplace le contenu actuel de `aiwithmathieu/RoadmapSaaS` par les fichiers du dossier `roadmap-vercel/` :

```bash
# Clone ton repo
git clone https://github.com/aiwithmathieu/RoadmapSaaS.git
cd RoadmapSaaS

# Copie les nouveaux fichiers (remplace index.html, ajoute api/, vercel.json, package.json)
# ... copie les fichiers depuis le dossier roadmap-vercel/

git add .
git commit -m "Add Vercel serverless + GitHub sync"
git push
```

### 3. Déployer sur Vercel

1. Va sur https://vercel.com → Sign in avec GitHub
2. "Import Project" → sélectionne **RoadmapSaaS**
3. Framework Preset : **Other**
4. Deploy
5. Va dans **Settings → Environment Variables** et ajoute :
   - `GITHUB_TOKEN` = le token copié à l'étape 1
   - `GITHUB_OWNER` = `aiwithmathieu`
   - `GITHUB_REPO` = `RoadmapSaaS`
6. **Redeploy** (important pour que les variables soient prises en compte)

### 4. C'est fini

- URL Vercel : `https://roadmap-saas-xxx.vercel.app` (ou custom domain)
- Chaque modification est sauvée dans GitHub automatiquement
- Léo ouvre la même URL → voit les mêmes données
- Si l'API est down → fallback localStorage, rien ne se perd

## Réplication pour un autre projet

1. Fork le repo
2. Change `GITHUB_OWNER` et `GITHUB_REPO` dans Vercel
3. Crée un nouveau token pour le nouveau repo
4. Deploy → fini

## Sécurité

- Le token GitHub est stocké **uniquement** dans les variables d'environnement Vercel (côté serveur)
- Il n'est **jamais** exposé dans le code client
- Le token a des permissions minimales (Contents en R/W sur un seul repo)
