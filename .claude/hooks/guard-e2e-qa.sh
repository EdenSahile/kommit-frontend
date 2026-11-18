#!/bin/bash
# Hook PreToolUse, lancé avant chaque Edit, Write ou commande Bash de Claude.
# Ne s'applique qu'à une session de QA testing (/run-qa), qui pose le marqueur.
#
# 1. Vérifier qu'une session de QA est en cours
#    - le marqueur /tmp/qa-session-active est posé par /run-qa au début, retiré à la fin ;
#    - un marqueur de plus de 60 min vient d'un QA qui a planté : on l'ignore.
# 2. Lister les tests e2e trackés par git
#    - un e2e tracké est un test EXISTANT, donc protégé (RM5) ;
#    - un e2e non tracké est un test que le QA vient de créer, donc libre (RM8).
# 3. Bloquer la modification
#    - Edit ou Write sur un e2e tracké : bloqué ;
#    - commande Bash qui écrit sur un e2e tracké (rm, mv, >, git checkout…) : bloquée ;
#    - lire un e2e et lancer la suite e2e restent autorisés.

# 1. Vérifier qu'une session de QA est en cours
[ -f /tmp/qa-session-active ] || exit 0
[ -n "$(find /tmp/qa-session-active -mmin +60 2>/dev/null)" ] && exit 0

# 2. Lister les tests e2e trackés par git, depuis le repo et non le dossier courant
cd "$CLAUDE_PROJECT_DIR" || exit 0
TRACKED=$(git ls-files e2e/)
[ -z "$TRACKED" ] && exit 0

# 3. Bloquer la modification
TRACKED="$TRACKED" python3 -I -c '
import json, os, re, sys
tracked = set(os.environ["TRACKED"].split())
d = json.load(sys.stdin)
tool = d.get("tool_name", "")
inp = d.get("tool_input") or {}
writes = re.compile(r"(\bsed\s+-i|\bperl\s+-i|\brm\b|\bmv\b|\bcp\b|\btee\b|>|\bgit\s+(checkout|restore|rm|mv)\b|\btruncate\b)")
target = ""
if tool in ("Edit", "Write", "MultiEdit", "NotebookEdit"):
    path = inp.get("file_path") or inp.get("notebook_path") or ""
    if any(path == t or path.endswith("/" + t) for t in tracked):
        target = path
elif tool == "Bash":
    cmd = inp.get("command", "")
    if writes.search(cmd):
        # Le token doit etre un chemin autonome : la borne de gauche ecarte le
        # "e2e" de "pnpm test:e2e:qa:seq", colle a un ":".
        mentioned = re.findall(r"(?:^|[\s\x27\"=])(e2e(?:/[\w./-]*)?)", cmd)
        if any(m in tracked or m in ("e2e", "e2e/") for m in mentioned):
            target = cmd
if target:
    print("Interdit pendant une session de QA (/run-qa) : tu ne peux pas modifier un test e2e existant (RM5). "
          "Tu peux seulement CREER de nouveaux fichiers e2e. Si ce test est un faux negatif, ne le corrige pas : "
          "note-le dans le rapport QA et laisse l utilisateur decider. Cible bloquee : " + target[:200], file=sys.stderr)
    sys.exit(2)
'
