#!/bin/bash
# Hook PostToolUse (async), lancé après chaque `gh pr create` fait par Claude.
#
# 1. Identifier la PR que Claude vient d'ouvrir
#    - vérifie que la commande était bien un `gh pr create` ;
#    - lit l'URL de la PR dans ce que la commande a affiché ;
#    - en déduit le repo GitHub ET le dossier local de ce repo ;
#    - retrouve l'adresse de la session Claude qui a ouvert la PR (session initiale).
# 2. Surveiller le résultat de la CI
#    - interroge l'état réel des checks, pas le code de sortie de `gh` ;
#    - verte : s'arrête là ;
#    - illisible ou indécise : l'écrit dans le journal et s'arrête là ;
#    - rouge : passe à l'étape 3.
# 3. Lancer la correction
#    - ouvre une fenêtre Terminal.app dans le dossier du repo de la PR ;
#    - y lance un /goal qui fait repasser la PR au vert ;
#    - à la fin, le goal envoie son compte rendu à la session initiale.
#
# Le repo se déduit de l'URL de la PR, jamais du dossier de la session : les 2 repos du
# projet numérotent leurs PR séparément, et `gh pr checks <n>` lancé dans le mauvais repo
# répond « Could not resolve to a PullRequest » avec le même code de sortie qu'une CI rouge.
LOG="/tmp/fix-ci.log"
exec >> "$LOG" 2>&1
[ -n "$IS_FIX_CI_SESSION" ] && exit 0

journal() { echo "$(date '+%H:%M:%S') $*"; }

# 1. Identifier la PR que Claude vient d'ouvrir
read -r cmd url cwd < <(python3 -I -c '
import json,sys,re
d=json.load(sys.stdin)
cmd=(d.get("tool_input") or {}).get("command","")
r=d.get("tool_response");s=r.get("stdout","") if isinstance(r,dict) else str(r)
m=re.search(r"https://github\.com/\S+/pull/\d+",s)
print("yes" if "gh pr create" in cmd else "no", m.group(0) if m else "-", d.get("cwd","-"))')
journal "hook déclenché : cmd=$cmd url=$url"
[ "$cmd" = yes ] && [ "$url" != - ] || exit 0

n=${url##*/}
repo=$(printf '%s\n' "$url" | sed -E 's#^https://github\.com/([^/]+/[^/]+)/pull/[0-9]+$#\1#')
case "$repo" in */*) ;; *) journal "repo illisible dans l'URL, arrêt" ; exit 0 ;; esac
journal "PR #$n du repo $repo"

# Dossier local de CE repo : on cherche, parmi les dossiers voisins, celui dont l'origine
# correspond. Le dossier de la session ne convient pas : elle peut travailler sur l'autre repo.
dossier=""
for d in "$cwd" "$cwd"/../*; do
  [ -d "$d/.git" ] || continue
  o=$(git -C "$d" remote get-url origin 2>/dev/null)
  case "$o" in *"$repo"|*"$repo".git) dossier=$(cd "$d" && pwd); break ;; esac
done
if [ -z "$dossier" ]; then
  journal "dossier local de $repo introuvable, arrêt (aucune fenêtre ouverte)"
  exit 0
fi
journal "dossier local : $dossier"

# Le hook est lancé par le process `claude` de la session initiale : on remonte ses process
# parents jusqu'à celui qui a une socket dans /tmp/cc-socks/ (son adresse pour les messages).
pid=$$; sock=""
while [ "$pid" -gt 1 ]; do
  [ -S "/tmp/cc-socks/$pid.sock" ] && { sock="uds:/tmp/cc-socks/$pid.sock"; break; }
  pid=$(ps -o ppid= -p "$pid" | tr -d ' ')
done
journal "session initiale : ${sock:-introuvable}"

# 2. Surveiller le résultat de la CI
# On lit l'état réel des checks, parce que le code de sortie de `gh pr checks` vaut 1
# aussi bien pour « un check a échoué » que pour « je n'ai pas pu lire la PR ».
# L'attente dure 1 à 3 minutes et ne bloque pas la session : le hook est async.
etat=indecis
for i in $(seq 1 36); do
  verdict=$(gh pr checks "$n" --repo "$repo" --json state --jq '
    [.[].state] as $s
    | if ($s | length) == 0 then "vide"
      elif ($s | map(select(. == "FAILURE" or . == "TIMED_OUT" or . == "CANCELLED" or . == "ACTION_REQUIRED")) | length) > 0 then "rouge"
      elif ($s | map(select(. == "SUCCESS" or . == "NEUTRAL" or . == "SKIPPED")) | length) == ($s | length) then "verte"
      else "encours" end' 2>/dev/null)
  case "$verdict" in
    rouge|verte) etat=$verdict; break ;;
    vide|encours) sleep 10 ;;
    *) journal "lecture des checks impossible (tentative $i)"; sleep 10 ;;
  esac
done

if [ "$etat" = verte ]; then journal "PR #$n verte, rien à faire"; exit 0; fi
if [ "$etat" != rouge ]; then journal "état des checks indécis après l'attente, arrêt (aucune fenêtre ouverte)"; exit 0; fi

# 3. Lancer la correction
journal "PR #$n rouge, ouverture de la fenêtre du goal"
launcher=$(mktemp -t kom13-goal).sh
cat > "$launcher" <<LAUNCH
cd "$dossier"
export IS_FIX_CI_SESSION=1
unset CLAUDE_CODE_CHILD_SESSION
claude --permission-mode bypassPermissions "/goal Consigne (worker) : la CI de la PR #$n du repo $repo est rouge. Tu travailles dans le repo $repo, dont le dossier local est $dossier ; ce projet contient plusieurs repos, donc passe toujours --repo $repo à chaque commande gh. Fais repasser cette PR au vert. Tu as le droit de commit et push sur la branche de la PR, jamais sur la branche de base. Tu ne merges pas la PR. Lance \\\`date\\\` au début et après chaque push. À la fin, que la CI soit verte ou que tu t'arrêtes, envoie avec SendMessage à la session $sock un compte rendu : pour chaque échec, la cause trouvée et la correction poussée. Si tu constates que la CI est déjà verte, dis-le dans le compte rendu et arrête-toi sans rien pousser. Preuve de fin (évaluateur) : le goal est atteint quand la sortie de \\\`gh pr checks $n --repo $repo\\\`, lancée après le dernier push, montre tous les checks en pass, et que le compte rendu a été envoyé avec SendMessage à $sock. Il s'arrête aussi après 3 tours sans vert, ou quand la sortie de \\\`date\\\` montre 15 minutes écoulées depuis le début."
LAUNCH
osascript -e 'tell application "Terminal"' -e 'activate' -e "do script \"bash '$launcher'\"" -e 'end tell'
journal "fenêtre ouverte"
