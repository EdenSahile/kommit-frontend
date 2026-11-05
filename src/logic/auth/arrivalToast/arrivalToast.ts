// Décide si le toast d'arrivée doit s'afficher, et avec quel message (CA3, CA4, CA24, CA25).
// Le flag est à usage unique : il vaut 'signup' ou 'signin' juste après une auth réussie,
// et null dans tous les autres cas (reload, retour navigateur, ouverture directe avec
// session persistée) — sa consommation (écriture/suppression en storage) est câblée
// ailleurs, hors de cette fonction pure.

// Clé sessionStorage utilisée par les pages signin/signup et l'accueil pour
// transporter le flag d'une auth réussie jusqu'au rendu du toast.
export const ARRIVAL_FLAG_KEY = 'kommit:arrivalFlag'

export type ArrivalFlag = 'signup' | 'signin'

export type ArrivalToast = {
  type: 'success'
  message: string
}

export function arrivalToastFor(
  flag: ArrivalFlag | null,
  firstName: string
): ArrivalToast | null {
  if (flag === 'signup') {
    return { type: 'success', message: `Bienvenue ${firstName}, ton compte est créé.` }
  }

  if (flag === 'signin') {
    return { type: 'success', message: `Content de te revoir ${firstName}` }
  }

  return null
}
