# État du backend — page de diagnostic

## Contexte

Premier écran du frontend Kommit, juste après le scaffold du projet. Il permet de vérifier à la main que le serveur backend répond et que la base de données est accessible, via deux boutons et une notification de résultat.

## Stack (rappel)

React, TypeScript, Tailwind, shadcn/ui (Base UI), Zod, TanStack Query, React Router, Vitest, React Testing Library, Playwright, Vite. Installée au fur et à mesure des besoins réels — pas tout d'un coup.

Pour cette itération, seuls sont nécessaires : Vite, React, TypeScript, Tailwind, shadcn/ui (Button, Card, Sonner), TanStack Query, Vitest. Zod, React Router, Playwright, CI/CD (Vercel/Render/GitHub Actions) sont hors périmètre — ajoutés quand un besoin réel apparaît.

## Endpoints backend utilisés

- `GET /` — check serveur. Réponse `200 { "status": "ok" }`. Si le serveur est injoignable : pas de réponse (erreur réseau côté fetch).
- `GET /db-health` — check base de données. Réponse `200 { "status": "ok" }` si la base répond, `503 { "status": "error" }` sinon.

URL de base configurable via la variable d'env `VITE_API_URL` (défaut `http://localhost:3000` en dev).

## Architecture

Scaffold Vite (template `react-ts`). Une seule page pour l'instant, pas de routeur — il sera ajouté quand une deuxième page apparaîtra.

## Composants

- `App.tsx` — rend `BackendStatusCard` et le `Toaster` (Sonner) de shadcn/ui.
- `src/components/BackendStatusCard.tsx` — titre "Kommit" / sous-titre "État du backend", les deux boutons ("Check serveur", "Check BDD"). Chaque bouton déclenche une mutation TanStack Query (`useMutation`).
- `src/logic/backendStatus.ts` — fonctions pures, sans React :
  - `checkServer()` / `checkDb()` : appellent l'endpoint, mesurent le temps de réponse, renvoient `{ ok: true, latencyMs: number }` ou `{ ok: false, message: string }`.
  - `buildSuccessToast(latencyMs)` / `buildErrorToast(message)` : construisent le titre et la description du toast à partir du résultat.

## Flux de données

Clic sur un bouton → `mutate()` → fonction pure de `logic/` appelle l'endpoint correspondant → au retour, le composant appelle `toast.success(...)` ou `toast.error(...)` avec les chaînes déjà construites par `logic/`.

## Gestion des erreurs

- Échec réseau (serveur injoignable) ou statut non-2xx → toast d'erreur.
- `db-health` en 503 → toast d'erreur, avec le message du corps de réponse si présent.
- Pas de retry automatique, pas de error boundary global : un check en échec est un résultat normal de la page, pas un bug de l'app.

## Tests

- Vitest sur `src/logic/backendStatus.ts` : construction des messages de succès/erreur, formatage du temps de réponse. Sans rendu, sans React.
- Pas de test de composant RTL pour cette itération : le clic → toast est le parcours critique de la page ; il sera couvert par un test end-to-end Playwright plus tard, pas par un test de composant.

## Hors périmètre pour cette itération

Zod (pas de formulaire), React Router (une seule page), Playwright (ajouté avec le premier parcours e2e), CI/CD Vercel/Render/GitHub Actions (ajoutée quand le déploiement devient un besoin réel).
