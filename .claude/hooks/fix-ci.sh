#!/bin/bash
# Hook PostToolUse (async), lancé après chaque `gh pr create` fait par Claude.
#
# 1. Identifier la PR que Claude vient d'ouvrir
#    - vérifie que la commande était bien un `gh pr create` ;
#    - lit l'URL de la PR dans ce que la commande a affiché ;
#    - retrouve l'adresse de la session Claude qui a ouvert la PR (session initiale).
# 2. Surveiller le résultat de la CI
#    - attend la fin du run de CI de la PR ;
#    - si la CI est verte, s'arrête là ;
#    - si la CI est rouge, passe à l'étape 3.
# 3. Lancer la correction
#    - si la CI est rouge, ouvre une fenêtre Terminal.app ;
#    - y lance un /goal qui fait repasser la PR au vert ;
#    - à la fin, le goal envoie son compte rendu à la session initiale.
LOG="/tmp/fix-ci.log"
exec >> "$LOG" 2>&1
[ -n "$IS_FIX_CI_SESSION" ] && exit 0

# 1. Identifier la PR que Claude vient d'ouvrir
read -r cmd url cwd < <(python3 -I -c '
import json,sys,re
d=json.load(sys.stdin)
cmd=(d.get("tool_input") or {}).get("command","")
r=d.get("tool_response");s=r.get("stdout","") if isinstance(r,dict) else str(r)
m=re.search(r"https://github\.com/\S+/pull/\d+",s)
print("yes" if "gh pr create" in cmd else "no", m.group(0) if m else "-", d.get("cwd","-"))')
echo "$(date '+%H:%M:%S') hook déclenché : cmd=$cmd url=$url"
[ "$cmd" = yes ] && [ "$url" != - ] || exit 0
n=${url##*/}; cd "$cwd" || exit 1
# Le hook est lancé par le process `claude` de la session initiale : on remonte ses process
# parents jusqu'à celui qui a une socket dans /tmp/cc-socks/ (son adresse pour les messages).
pid=$$; sock=""
while [ "$pid" -gt 1 ]; do
  [ -S "/tmp/cc-socks/$pid.sock" ] && { sock="uds:/tmp/cc-socks/$pid.sock"; break; }
  pid=$(ps -o ppid= -p "$pid" | tr -d ' ')
done
echo "$(date '+%H:%M:%S') session initiale : ${sock:-introuvable}"

# 2. Surveiller le résultat de la CI
# Cette attente dure 1 à 2 minutes. Elle ne bloque pas la session Claude, parce que
# le hook tourne en arrière-plan (`"async": true` dans settings.json).
# Attend que le check de GitHub Actions existe : d autres checks (ex. Vercel) peuvent être déjà verts avant.
for i in $(seq 1 30); do gh pr checks "$n" 2>&1 | grep -q "/actions/runs/" && break; sleep 5; done
if gh pr checks "$n" --watch --interval 10 > /dev/null 2>&1; then echo "$(date '+%H:%M:%S') PR #$n verte, rien à faire"; exit 0; fi

# 3. Lancer la correction
echo "$(date '+%H:%M:%S') PR #$n rouge, ouverture de la fenêtre du goal"
launcher=$(mktemp -t kom13-goal).sh
cat > "$launcher" <<LAUNCH
cd "$cwd"
export IS_FIX_CI_SESSION=1
unset CLAUDE_CODE_CHILD_SESSION
claude --permission-mode bypassPermissions "/goal Consigne (worker) : actuellement, la CI de la PR #$n est rouge. Fais-la passer au vert. Tu as le droit de commit et push sur la branche de la PR, jamais sur dev. Tu ne merges pas la PR. Lance \\\`date\\\` au début et après chaque push. À la fin, que la CI soit verte ou que tu t'arrêtes, envoie avec SendMessage à la session $sock un compte rendu : pour chaque échec, la cause trouvée et la correction poussée. Preuve de fin (évaluateur) : le goal est atteint quand la sortie de \\\`gh pr checks $n\\\`, lancée après le dernier push, montre tous les checks en pass, et que le compte rendu a été envoyé avec SendMessage à $sock. Il s'arrête aussi après 3 tours sans vert, ou quand la sortie de \\\`date\\\` montre 15 minutes écoulées depuis le début."
LAUNCH
osascript -e 'tell application "Terminal"' -e 'activate' -e "do script \"bash '$launcher'\"" -e 'end tell'
echo "$(date '+%H:%M:%S') fenêtre ouverte"
