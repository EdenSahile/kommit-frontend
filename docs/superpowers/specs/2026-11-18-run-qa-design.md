# Design : skill /run-qa (KOM-15)

## Intent

Créer un skill `/run-qa` qui remplace un QA testeur humain. Il teste une US complète sur le lien de déploiement DEV, produit un rapport avec preuves (captures), et ne touche jamais au code de prod ni aux tests existants.

## Pourquoi

L'équipe Kommit n'a qu'une personne. Chaque session de QA manuelle bloque le développement. Automatiser le QA libère du temps de dev.

## Goals

- Tester 100 % des règles métier d'une US déclenchables depuis l'app
- Produire un rapport exploitable (OK/KO, captures, gravité)
- Protéger le code (garde-fous vérifiables)

## Non-goals

- Tester les routes backend en direct (API-only)
- Remplacer les tests unitaires
- Corriger les bugs trouvés

## Anti-goals

- Modifier le code de prod pendant le QA
- Modifier les tests e2e existants (même pour corriger un faux négatif)
- Dépasser 20 minutes de QA

## Contraintes

- KOM-14 terminé : le backend DEV reste réveillé, les e2e tournent sur le lien déployé
- Base Neon DEV partagée avec le local : comptes de test dédiés, supprimés à la fin
- Navigateur piloté par MCP Playwright
- Pas d'env de recette : le QA tourne en DEV

## Approaches

### A. Skill unique sans subagent (écarté)

Le skill fait tout séquentiellement. La passe 2 (exploration) est créative et longue : elle remplirait le contexte du skill principal avec du bruit (snapshots, captures). Écarté.

### B. Skill + subagent pour la passe 2 (choisi)

Le skill `/run-qa` orchestre les 2 passes et compile le rapport. La passe 1 est mécanique (lancer les e2e, écrire les manquants), le skill la gère directement. La passe 2 (exploration navigateur) est déléguée à un subagent `qa-explorer` qui navigue via MCP Playwright et remonte ses constats. Le rapport est compilé par le skill principal à partir des résultats des 2 passes.

### C. Plusieurs subagents (écarté)

Un agent par passe + un pour le rapport. Trop de coordination pour pas assez de gain. La passe 1 est mécanique, pas besoin d'un agent dédié.

## Design

### 1. Fichiers créés

| Fichier | Rôle |
|---------|------|
| `.claude/skills/run-qa/SKILL.md` | Le skill, point d'entrée `/run-qa` |
| `.claude/agents/qa-explorer.md` | Subagent passe 2 (exploration navigateur) |
| `.claude/hooks/guard-e2e-qa.sh` | Hook : bloque la modif des e2e existants pendant le QA |

### 2. Workflow du skill

```
/run-qa
  │
  ├─ 1. Vérifier .env.qa (sinon demander à l'utilisateur)
  ├─ 2. Lire les tickets TO TEST depuis Notion, grouper par US, demander laquelle
  ├─ 3. Lire les règles métier des tickets de l'US choisie
  ├─ 4. Activer le hook guard-e2e-qa (IS_QA_SESSION=1)
  ├─ 5. Chrono : noter l'heure de début
  │
  ├─ PASSE 1 (cas simples)
  │   ├─ 5a. Lancer pnpm test:e2e:qa:seq sur le lien déployé
  │   ├─ 5b. Comparer les RM de l'US avec les e2e existants
  │   ├─ 5c. Écrire les e2e manquants (nouveaux fichiers seulement)
  │   ├─ 5d. Lancer les nouveaux e2e
  │   └─ 5e. Si KO → continuer les tests restants, puis STOP (pas de passe 2)
  │
  ├─ PASSE 2 (cas tordus) — seulement si passe 1 = 0 KO
  │   ├─ 6a. Lancer le subagent qa-explorer
  │   ├─ 6b. L'explorer navigue via MCP Playwright, max 15 cas, min 1/zone
  │   └─ 6c. Récupérer les constats + captures
  │
  ├─ 7. Compiler le rapport dans testing/qa-reports/
  ├─ 8. Vérifier le chrono (< 20 min, sinon rapport partiel)
  └─ 9. Proposer la suppression des comptes de test
```

### 3. Hook guard-e2e-qa.sh

Bloque Edit/Write/Bash sur tout fichier dans `e2e/` qui existait avant le début du QA. Les nouveaux fichiers e2e (créés pendant le QA) ne sont pas bloqués.

**Activation par fichier marqueur** (pas par variable d'env) : le skill crée `/tmp/qa-session-active` au début du QA et le supprime à la fin. Le hook vérifie `[ -f /tmp/qa-session-active ]` : si le fichier n'existe pas, il laisse tout passer. Raison : `protect-tests.sh` utilise `IS_FIX_CI_SESSION` parce que `fix-ci.sh` lance un nouveau process Claude avec cette variable exportée. `/run-qa` tourne dans la session courante, et un `Bash` call ne peut pas injecter une variable d'env dans le process parent de Claude. Le fichier marqueur résout le problème.

Pour distinguer les fichiers existants des nouveaux : le hook liste les fichiers e2e via `git ls-files e2e/` au moment de l'appel. Tout fichier tracké est protégé, tout fichier non tracké est libre.

### 4. Rapport QA

Fichier : `testing/qa-reports/qa-<US>-<date>.md`
Captures : `testing/qa-reports/captures/<nom-du-test>.png`

Structure du rapport :
```markdown
# Rapport QA — US1 Authentification — 2026-11-18

## Bilan
- Passe 1 : X/Y OK, Z KO
- Passe 2 : X/Y OK, Z KO
- Durée : Xm Ys

## KO par gravité

### ⛔ Bloquants
| Test | Description | Capture |
|------|-------------|---------|

### ⚠️ Non bloquants
| Test | Description | Capture |
|------|-------------|---------|

### 💡 Améliorations
| Test | Description | Capture |
|------|-------------|---------|

## Passe 1 — Détail
...

## Passe 2 — Détail
...
```

### 5. Couverture e2e de l'US1 (état actuel)

**Déjà couvert (17 RM)** : RM1, RM2, RM3, RM4, RM5, RM6, RM7, RM8, RM9, RM10/11, RM12, RM13, RM15, RM16, RM17, RM24, RM25, RM30, RM31

**E2e à écrire en passe 1 (4 RM)** :
- RM32 : bouton signin grisé si champs vides
- RM33 : bouton signup grisé si champ requis vide (+ prénom espaces = vide)
- RM21 : unicité email insensible casse/espaces
- RM20 : prénom d'espaces seulement, refusé par le serveur

**Hors périmètre UI (non testable depuis l'app)** :
- RM18/19 : INTERNAL_ERROR (nécessite panne serveur simulée)
- RM2 backend : route protégée 401 (appel API direct)

### 6. Nettoyage des comptes de test

Après le QA, le skill propose de supprimer les comptes créés pendant la session. Les e2e utilisent `uniqueEmail()` qui génère des emails en `*@test.dev`, identifiables. La suppression passe par une requête SQL directe sur la base Neon DEV (via `E2E_DATABASE_URL` déjà configuré dans `.env.qa`).

## Mes choix (non décidés par l'utilisateur)

- Le rapport va dans `testing/qa-reports/` (pas dans `docs/`) : c'est un artefact de testing, pas de la doc
- Les captures sont des fichiers PNG, pas des base64 inline : plus légers dans git, plus lisibles
- Le hook utilise `git ls-files` pour distinguer fichiers existants des nouveaux : simple et fiable
- Le subagent qa-explorer est un agent `.claude/agents/`, pas un fork : il a besoin de son propre contexte (consignes garde-fou, pas d'héritage du contexte de la conversation)
- Le hook utilise un fichier marqueur `/tmp/qa-session-active` au lieu d'une variable d'env : un Bash call ne peut pas injecter une env var dans le process Claude parent (le builder check a confirmé ce point)
- Le groupement par US utilise le champ `US` existant dans le schéma Notion (valeurs F1-US1, F2-US1, etc.)
