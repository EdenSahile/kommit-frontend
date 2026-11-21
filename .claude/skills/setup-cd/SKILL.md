---
name: setup-cd
description: Assiste la mise en place du déploiement continu du frontend sur Vercel. Prépare le `vercel.json`, indique les variables d'environnement et le réglage de l'auth cross-origin, et liste ce que tu poses toi-même dans le dashboard Vercel (brancher le repo, variables, branche de prod). Utiliser quand l'utilisateur dit "setup-cd", "branche Vercel", "mets en place la CD front", "déploiement continu frontend".
---

## Entrée

- La **cible** (Vercel) et la **branche déployée** (`dev`), depuis le ticket CD ou la demande directe.
- L'**URL du backend déployé** (l'API que le front doit appeler en prod, pas `localhost`).
- Le **repo courant** : une SPA Vite + React Router, buildée avec `pnpm build`. En particulier son `package.json` pour le script `build`, son `.nvmrc` pour la version de Node, et son `.env.example` pour le nom exact de chaque variable.
- Optionnel : un **ticket de CD** (lien ou ID). S'il est donné, le skill suit ses règles métier.

## Sortie

- Un fichier de config **`vercel.json`** à la racine du repo, déclarant le build et la réécriture SPA.
- L'**URL publique du frontend de DEV** (ex. `https://<nom-du-projet>.vercel.app`).
- Un **déploiement continu fonctionnel, mis en place avec l'utilisateur** : à chaque merge sur la branche déployée, Vercel build et déploie, et l'app déployée **s'affiche ET se connecte** (auth cross-origin qui marche), pas seulement une page qui charge. La session tient d'une page à l'autre.
- Un **plan d'ensemble en prose**, en trois sections (repo frontend / dashboard Vercel / blocage backend), qui donne la vue globale.
- Une **liste de tâches `TaskCreate`** qui reprend ce plan, une tâche par action, cochée au fil de l'avancement.
- La liste explicite de ce qui reste à faire **à la main dans le dashboard Vercel** (et côté backend).

## Accompagner l'utilisateur jusqu'au bout

Le skill ne lâche pas l'utilisateur avant la fin du ticket.

1. **Au démarrage, une tâche par étape** avec `TaskCreate`, sans tâche pour les règles métier du ticket. Chaque tâche passe en `in_progress` quand on l'attaque, et en `completed` seulement après vérification.
2. **Une étape à la fois** : annoncer l'étape, ce qu'elle sert à obtenir, et ce que l'utilisateur doit faire.
3. **Chaque étape manuelle se termine par une question** (« C'est fait ? ») : ne pas passer à la suite sans réponse.
4. **Vérifier soi-même quand c'est possible** : ne pas se contenter du « oui » de l'utilisateur (ex. après la saisie des variables, vérifier que le déploiement repart et que l'app répond).
5. **Ne rendre la main qu'à la fin du ticket** : quand toutes les règles métier sont vérifiées, ou bloquées avec une raison claire.

---

> ⚠️ **Skill écrit de connaissance, pas encore éprouvé sur un vrai déploiement** (contrairement à `setup-ci`, prouvé bout en bout). À valider et corriger au premier branchement Vercel réel.

> ⚠️ **Si `TaskCreate` n'existe pas, ne pas chercher un outil de remplacement, il n'y en a pas.** Depuis Claude Code **2.1.233**, les outils de todo (`TaskCreate`, `TaskGet`, `TaskUpdate`, `TaskList`, et l'ancien `TodoWrite`) sont **coupés par défaut sur les modèles récents**. Ils sont toujours dans le binaire, simplement désactivés. Le message d'erreur est trompeur : il annonce « disabled for this session », ce qui laisse croire à un réglage de projet, alors qu'aucune config du repo n'est en cause.
>
> Le réglage, dans `~/.claude/settings.json` :
>
> ```json
> { "env": { "CLAUDE_CODE_ENABLE_TODO_TOOLS": "1" } }
> ```
>
> La variable est lue au démarrage du process : il faut **relancer une session** pour qu'elle prenne. À défaut, restituer le plan en prose seul et le dire, plutôt que de simuler un suivi de tâches qui n'existe pas.

## Format de restitution — vue d'ensemble ET tâches cochables

Restituer en **deux temps complémentaires**, jamais l'un sans l'autre. Le premier donne la cohérence et le « pourquoi » ; le second donne le suivi vivant en bas d'écran. Les garder alignés : même ordre, même découpage.

1. **Un plan d'ensemble en prose**, en trois sections :
   - **§1 Dans ce repo (frontend)** — ce qui se commite ici (`vercel.json`).
   - **§2 Dashboard Vercel** — les étapes à cliquer soi-même (import du repo, preset Vite, variable `VITE_API_URL`, Production Branch, deploy).
   - **§3 Blocage backend** — l'auth cross-origin, à faire dans le repo backend + le dashboard Render.
2. **Une liste `TaskCreate`** qui reprend ce plan, **une tâche par action concrète**, dans le même ordre. Suivre le statut au fil de l'eau : passer la tâche en **`in_progress`** au moment où on l'attaque (elle s'affiche en orange), puis en **`completed`** quand elle est finie. Ne jamais annoncer « on est sur la tâche X » sans l'avoir passée en `in_progress` — sinon l'affichage et le discours ne collent pas.

Ne pas numéroter deux fois de deux façons différentes : les sous-points d'une section de prose et les tâches doivent se correspondre un pour un, pour que l'utilisateur retrouve chaque tâche dans le plan.

## Comment

### 0. Faire valider le nom et les valeurs, avant d'écrire

Même format de question que pour chaque valeur (`AskUserQuestion`), même si une valeur a été trouvée, pour que l'utilisateur sache de quoi il est question :
1. ce dont le skill a besoin, et à quoi ça sert, en 1 phrase ;
2. la valeur trouvée, et où (ticket, `.env.example`, code), ou une valeur proposée si rien n'est trouvé ;
3. « Je l'utilise ? », avec en options la valeur trouvée ou proposée, et une saisie libre. Le libellé de chaque option est la valeur complète (ex. l'URL entière), pas un raccourci.

Dans cet ordre :
1. **L'URL publique du frontend, dans un formulaire à part.** Poser exactement : « J'ai besoin de l'URL publique de ton frontend sur Vercel : c'est elle que le backend autorise dans ses origines. J'ai trouvé `<URL>` dans `<source>`. Je l'utilise ? ». Source, dans cet ordre :
   1. les origines autorisées du backend, si le repo backend est accessible ;
   2. le ticket ;
   3. sinon, `https://<nom-du-repo>-<prénom>-dev.vercel.app`.

   Le nom du projet Vercel est la partie avant `.vercel.app`. Attendre la réponse avant la suite : les questions suivantes affichent les vraies valeurs, jamais un repère comme `<nom>`.
2. **Les variables non secrètes de `.env.example`** (ex. `<URL_DU_BACKEND>`), avec l'URL réelle du backend en ligne.

**Ne jamais lire `.env`** : il peut contenir des secrets. Les valeurs trouvées viennent seulement du ticket, de `.env.example` ou du code.

**Une URL prévue est vérifiée à la création.** L'URL du frontend se déduit du nom, mais Vercel la change si le nom est déjà pris. Après la création, comparer l'URL réelle avec celle prévue. Si elle diffère, prévenir l'utilisateur de mettre à jour les origines autorisées du backend.

### 1. Brancher le service Vercel

Un projet Vercel connecté au repo frontend. Preset **Vite** (build `pnpm build`, sortie `dist`, install `pnpm install --frozen-lockfile`). Node lu depuis le `.nvmrc` (24). Définir la **Production Branch** selon le besoin : `dev` si c'est l'environnement DEV visé ; sinon `main` = prod et `dev` sort en preview.

### 2. Variables d'environnement (le piège Vite)

Vite n'expose au client **que** les variables préfixées **`VITE_`**, et **au moment du build**. L'URL du backend doit donc être `VITE_API_URL` (ou similaire), posée dans Vercel **par environnement** (Production / Preview). Une variable non préfixée `VITE_` n'arrivera jamais dans le bundle → le front tape dans le vide.

### 3. Auth cross-origin (le vrai point dur)

Le front déployé (domaine `*.vercel.app`) appelle le backend déployé (autre domaine). Les cookies de session (better-auth, `credentials: 'include'`) sont alors **cross-site** : ils exigent `SameSite=None; Secure` côté backend, et le **CORS du backend doit autoriser l'origine Vercel avec credentials** (ajouter l'URL Vercel à `CORS_ORIGINS` côté back). Sans ça, l'app s'affiche mais la connexion échoue en silence. C'est l'échec le plus fréquent d'un front déployé.

### 4. `vercel.json` pré-rempli — le cadre qui sert à guider

Écrire le `vercel.json` **complet à l'avance**, en dérivant du `package.json` tout ce qui est déterminable sans deviner : `framework`, `installCommand`, `buildCommand`, `outputDirectory`, plus la réécriture SPA. Le fichier ne fait pas tout tout seul (il n'agit qu'une fois sur la branche déployée, et ne crée ni le projet ni les variables), mais il sert de **cadre** : il fige les valeurs exactes, et c'est à partir de lui qu'on dicte à l'utilisateur quoi coller au dashboard.

```json
{
  "framework": "vite",
  "installCommand": "pnpm install --frozen-lockfile",
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- `buildCommand` = le script `build` du `package.json` (ici `tsc -b && vite build` via `pnpm build`), pour garder le typecheck que le défaut Vercel (`vite build`) sauterait.
- La **réécriture SPA** est indispensable : React Router côté client, sans elle un lien direct vers une page profonde renvoie un 404.
- Ce qu'on **ne peut pas** mettre dans le fichier et qui reste manuel au dashboard : créer/brancher le projet, poser les variables d'env (on ne lit pas le vrai `.env`), définir la Production Branch.

### 5. Porte de qualité (note)

Vercel déploie au merge **même si la CI GitHub est rouge** — il lance son propre build, il ignore ton workflow lint/test. Pour ne déployer que sur CI verte : option « attendre les checks » côté Vercel, ou branch protection (cf. `setup-ci` §6, non applicable sur privé gratuit). Le signaler, ne pas prétendre que le déploiement est gated par défaut.

### 6. Vérifier

Déclencher un déploiement (merge sur `dev`), ouvrir l'URL déployée, et **tester la connexion réelle** — pas juste que la page charge : se connecter, vérifier que la session tient (c'est ce qui valide l'auth cross-origin des §2-3).

## Ce qui se fait à la main (Vercel ne s'automatise pas tout en CLI)

Lister clairement pour l'utilisateur ce qui passe par le dashboard : créer/brancher le projet, poser les variables d'environnement, définir la Production Branch. Le skill prépare le `vercel.json` et l'URL/les valeurs ; l'utilisateur clique la partie dashboard.

## Hors périmètre

- La **CI** (lint/build/test) : c'est `setup-ci`.
- Le **déploiement du backend** : autre repo, autre plateforme (Render, cf. `deploy-render` côté back).
