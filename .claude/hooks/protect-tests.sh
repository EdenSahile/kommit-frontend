#!/bin/bash
# Hook PreToolUse, lancé avant chaque Edit, Write ou commande Bash de Claude.
# Ne s'applique qu'à la session qui répare la CI (lancée par fix-ci.sh avec IS_FIX_CI_SESSION=1).
#
# 1. Vérifier qu'on est dans la session qui répare la CI
#    - si IS_FIX_CI_SESSION n'est pas défini, laisse tout passer.
# 2. Repérer un fichier protégé
#    - les tests : *.test.ts, *.test.tsx, le dossier e2e/ ;
#    - leur config : vitest.config.*, playwright.config.* ;
#    - le lint : eslint.config.* ;
#    - la CI : .github/workflows/.
# 3. Bloquer la modification
#    - Edit ou Write sur un fichier protégé : bloqué ;
#    - commande Bash qui modifie un fichier protégé (sed -i, rm, mv, >, git checkout…) : bloquée ;
#    - la lecture reste autorisée (cat, grep, lancer les tests).

# 1. Vérifier qu'on est dans la session qui répare la CI
[ -z "$IS_FIX_CI_SESSION" ] && exit 0

# 2 et 3. Repérer un fichier protégé et bloquer la modification
python3 -I -c '
import json, re, sys
d = json.load(sys.stdin)
tool = d.get("tool_name", "")
inp = d.get("tool_input") or {}
protected = re.compile(r"(\.test\.tsx?\b|(^|/)e2e/|vitest\.config|playwright\.config|eslint\.config|\.github/workflows/)")
writes = re.compile(r"(\bsed\s+-i|\bperl\s+-i|\brm\b|\bmv\b|\bcp\b|\btee\b|>|\bgit\s+(checkout|restore|rm|mv)\b|\btruncate\b)")
target = ""
if tool in ("Edit", "Write", "MultiEdit", "NotebookEdit"):
    path = inp.get("file_path") or inp.get("notebook_path") or ""
    if protected.search(path):
        target = path
elif tool == "Bash":
    cmd = inp.get("command", "")
    if protected.search(cmd) and writes.search(cmd):
        target = cmd
if target:
    print("Interdit dans la session qui répare la CI : tu ne peux pas modifier un test, sa config, le lint ou la CI (RM6). "
          "Corrige le code de la PR. Si c est impossible sans toucher à ce fichier, arrête-toi et préviens l utilisateur. "
          "Cible bloquée : " + target[:200], file=sys.stderr)
    sys.exit(2)
'
