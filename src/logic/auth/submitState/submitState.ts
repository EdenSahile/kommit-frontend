// Décide si le bouton de soumission d'un formulaire d'auth est désactivé, en
// combinant l'état de remplissage (RM32, RM33) et un appel déjà en cours (RM17).
// Le spinner et le libellé aria de RM17 ne sont pas décidés ici : c'est du rendu.

export function isAuthSubmitDisabled(
  isFormFilled: boolean,
  isCallInProgress: boolean
): boolean {
  return !isFormFilled || isCallInProgress
}
