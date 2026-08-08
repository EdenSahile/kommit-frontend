# Kommit — Frontend

Frontend du projet Kommit (React, TypeScript, Vite). Repo indépendant du backend (`kommit-backend`, dossier voisin) — voir `.claude/rules/perimetre-frontend.md`.

## Arborescence

```
kommit-frontend/
├── .claude/
│   ├── agents/            # sous-agents dédiés (revue de code, tests, maquettes...)
│   ├── hooks/              # hooks Claude Code
│   ├── rules/               # contraintes de comportement, toujours actives
│   ├── skills/              # workflows invocables (write-ui, write-tests, open-pr...)
│   └── settings.json
├── docs/
│   └── superpowers/
│       ├── specs/            # design docs validés
│       └── plans/            # plans d'implémentation
└── .gitignore
```
