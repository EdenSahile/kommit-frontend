// Réveille le backend déployé avant une session de QA.
//
// Sur l'offre gratuite de Render, le service s'endort après 15 minutes sans requête et met
// jusqu'à une minute à repartir. Mesuré le 2026-11-20 : 51 secondes. Sans ce réveil, les
// premiers tests de la passe 1 échouent sur un backend absent, ce qui n'apprend rien sur
// l'app et fait passer le QA pour inexploitable.
//
// La racine sert de contrôle de santé : c'est elle que déclare `healthCheckPath` dans le
// render.yaml du backend. `/health` n'existe pas et renvoie 404, malgré ce qu'affirment les
// tickets KOM-11 et KOM-27.

const API_URL = process.env.VITE_API_URL
const DELAI_MAX_MS = 120_000
const PAUSE_MS = 3_000

if (!API_URL) {
  console.error("VITE_API_URL absent : lancer via pnpm qa:wake.")
  process.exit(1)
}

if (API_URL.includes('localhost')) {
  console.error(`VITE_API_URL vise ${API_URL} : le QA ne teste que des liens déployés.`)
  process.exit(1)
}

const debut = Date.now()
let tentatives = 0

while (Date.now() - debut < DELAI_MAX_MS) {
  tentatives += 1
  try {
    const reponse = await fetch(API_URL, { signal: AbortSignal.timeout(DELAI_MAX_MS) })
    if (reponse.ok) {
      const secondes = Math.round((Date.now() - debut) / 1000)
      console.log(`Backend réveillé en ${secondes}s, après ${tentatives} tentative(s).`)
      process.exit(0)
    }
    console.log(`Tentative ${tentatives} : statut ${reponse.status}, le service démarre encore.`)
  } catch {
    console.log(`Tentative ${tentatives} : pas de réponse, le service démarre encore.`)
  }
  await new Promise((suite) => setTimeout(suite, PAUSE_MS))
}

console.error(`Le backend n'a pas répondu en ${DELAI_MAX_MS / 1000}s sur ${API_URL}. Vérifier son état dans Render avant de lancer le QA.`)
process.exit(1)
