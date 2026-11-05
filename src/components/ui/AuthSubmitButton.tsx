import { Loader2Icon } from 'lucide-react'

type AuthSubmitButtonProps = {
  label: string
  /** Annoncé aux lecteurs d'écran pendant l'appel, jamais affiché (RM17). */
  loadingLabel: string
  disabled?: boolean
  isLoading?: boolean
}

export default function AuthSubmitButton({
  label,
  loadingLabel,
  disabled = false,
  isLoading = false,
}: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`flex h-[43px] w-full items-center justify-center rounded-[4px] bg-gradient-to-br from-kommit-blue-dark to-kommit-blue-light py-2.5 text-sm font-bold tracking-[-0.35px] text-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] ${
        disabled ? 'opacity-30' : 'cursor-pointer'
      }`}
    >
      {isLoading ? (
        <>
          <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
          <span className="sr-only">{loadingLabel}</span>
        </>
      ) : (
        label
      )}
    </button>
  )
}
