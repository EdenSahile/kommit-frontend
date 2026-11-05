// Décide si le toast d'arrivée doit s'afficher, et avec quel message (RM3, RM4, RM24, RM25).
// Le flag est à usage unique : il vaut 'signup' ou 'signin' juste après une auth réussie,
// et null dans tous les autres cas (reload, retour navigateur, ouverture directe avec
// session persistée). Sa lecture à usage unique est portée par `consumeArrivalFlag`,
// qui reçoit le storage en paramètre pour rester testable sans navigateur.

// Clé sessionStorage utilisée par les pages signin/signup et l'accueil pour
// transporter le flag d'une auth réussie jusqu'au rendu du toast.
export const ARRIVAL_FLAG_KEY = 'kommit:arrivalFlag'

export type ArrivalFlag = 'signup' | 'signin'

export type ArrivalToast = {
  type: 'success'
  message: string
}

// Le storage est injecté en paramètre : `logic/` ne touche jamais `sessionStorage`
// directement, et le test lui passe une fausse implémentation.
export type ArrivalFlagStorage = Pick<Storage, 'getItem' | 'removeItem'>

// STUB — aucune logique métier ici. Implémentation à l'étape suivante du workflow.
export function consumeArrivalFlag(
  _storage: ArrivalFlagStorage
): ArrivalFlag | null {
  return null
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
