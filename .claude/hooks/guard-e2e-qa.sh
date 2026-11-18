#!/bin/bash
# Hook PreToolUse, lancé avant chaque Edit, Write ou commande Bash de Claude.
# Ne s'applique qu'à une session de QA testing (/run-qa), qui pose le marqueur.
#
# 1. Repérer une session de QA en cours
#    - le marqueur <git-dir>/qa-session-active est posé par /run-qa au début, retiré à la fin ;
#    - il vit dans le dossier .git : propre à ce clone et à cet utilisateur, hors du suivi git ;
#    - un marqueur de plus de 60 min vient d'un QA qui a planté : on l'ignore.
# 2. Lister les tests e2e trackés par git
#    - un e2e tracké est un test EXISTANT, donc protégé (RM5) ;
#    - un e2e non tracké est un test que le QA vient de créer, donc libre (RM8).
# 3. Bloquer la modification
#    - Edit ou Write sur un e2e tracké : bloqué, quelle que soit la forme du chemin ;
#    - commande Bash qui écrit sur un e2e tracké : bloquée ;
#    - commande qui écrit sans nommer sa cible (patch, git apply...) : bloquée ;
#    - lire un e2e et lancer la suite e2e restent autorisés.
#
# Une fois la session de QA repérée, le hook échoue FERMÉ : s'il ne peut pas faire son
# travail (python3 absent, git muet), il bloque au lieu de laisser passer. Le garde-fou
# est la raison d'être du ticket, un garde-fou silencieusement éteint ne vaut rien.

bloquer() {
  printf '%s\n' "$1" >&2
  exit 2
}

# 1. Repérer une session de QA en cours
REPO="${CLAUDE_PROJECT_DIR:-}"
[ -n "$REPO" ] || REPO=$(git rev-parse --show-toplevel 2>/dev/null)
[ -n "$REPO" ] || exit 0

GITDIR=$(git -C "$REPO" rev-parse --absolute-git-dir 2>/dev/null)
if [ -n "$GITDIR" ]; then
  MARQUEUR="$GITDIR/qa-session-active"
elif [ -d "$REPO/.git" ]; then
  MARQUEUR="$REPO/.git/qa-session-active"
else
  exit 0
fi

[ -f "$MARQUEUR" ] || exit 0
[ -n "$(find "$MARQUEUR" -mmin +60 2>/dev/null)" ] && exit 0

# 2. Lister les tests e2e trackés par git, depuis le repo et non le dossier courant
command -v python3 >/dev/null 2>&1 || bloquer "Session de QA en cours mais python3 est introuvable : le garde-fou des tests e2e ne peut pas faire son travail, donc il bloque. Retirer $MARQUEUR pour sortir de la session de QA."
cd "$REPO" || bloquer "Session de QA en cours mais $REPO est inaccessible : le garde-fou des tests e2e bloque par sécurité."
TRACKED=$(git ls-files e2e/ 2>/dev/null) || bloquer "Session de QA en cours mais git ls-files a échoué : le garde-fou des tests e2e bloque par sécurité."
[ -n "$TRACKED" ] || bloquer "Session de QA en cours mais aucun test e2e tracké n'a été trouvé : le garde-fou ne peut pas distinguer les tests existants des nouveaux, donc il bloque."

# 3. Bloquer la modification
TRACKED="$TRACKED" python3 -I -c '
import json, os, re, sys


def normaliser(chemin):
    # Les chemins arrivent en absolu ou en relatif, avec des // ou des ./, et macOS est
    # insensible a la casse : on compare des chemins canoniques en minuscules.
    return os.path.realpath(chemin).casefold()


traques = {normaliser(t): t for t in os.environ["TRACKED"].split()}

d = json.load(sys.stdin)
tool = d.get("tool_name", "")
inp = d.get("tool_input") or {}


def est_traque(chemin):
    return traques.get(normaliser(chemin)) if chemin else None


cible = ""

if tool in ("Edit", "Write", "MultiEdit", "NotebookEdit"):
    chemin = inp.get("file_path") or inp.get("notebook_path") or ""
    if est_traque(chemin):
        cible = chemin

elif tool == "Bash":
    cmd = inp.get("command", "")
    # Ces commandes ecrivent sans que leur cible apparaisse dans la ligne : aucune regex de
    # chemin ne peut les juger, et aucune n est utile pendant un QA.
    aveugles = re.compile(r"\bpatch\b|\bgit\s+(apply|stash|checkout|restore|rm|mv)\b|\bdd\b|\bed\b|\bex\b|\bsponge\b")
    ecrivains = re.compile(r"(^|[;&|]\s*)(sudo\s+)?(rm|mv|cp|tee|truncate|install|python3?|node|perl|ruby|php)\b|\|\s*(tee|sponge)\b")
    en_place = re.compile(r"\b(sed|perl|awk|ruby|python3?)\b[^;|]*?(\s-i\b|--in-place|inplace)")

    # Le chemin du repo contient des espaces : decouper la commande en jetons ne marche
    # pas. On cherche donc la sous-chaine "e2e/", qui apparait dans toute mention d un
    # fichier du dossier, qu il soit absolu, relatif ou entre guillemets.
    def parle_de_e2e(texte):
        bas = texte.casefold()
        return "e2e/" in bas or re.search(r"(?:^|[\s\x27\"=])e2e(?=[\s\x27\";|&]|$)", bas) is not None

    apres_redirection = re.findall(r">>?([^|;&]*)", cmd)

    if aveugles.search(cmd):
        cible = cmd
    elif any(parle_de_e2e(chunk) for chunk in apres_redirection):
        cible = cmd
    elif parle_de_e2e(cmd) and (ecrivains.search(cmd) or en_place.search(cmd)):
        cible = cmd

if cible:
    print("Interdit pendant une session de QA (/run-qa) : tu ne peux pas modifier un test e2e existant (RM5). "
          "Tu peux seulement CREER de nouveaux fichiers e2e. Si ce test est un faux negatif, ne le corrige pas : "
          "note-le dans le rapport QA et laisse l utilisateur decider. Cible bloquee : " + cible[:200], file=sys.stderr)
    sys.exit(2)
'
