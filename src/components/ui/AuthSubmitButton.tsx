type AuthSubmitButtonProps = {
  label: string
  disabled?: boolean
}

export default function AuthSubmitButton({
  label,
  disabled = false,
}: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`flex h-[43px] w-full items-end justify-center rounded-[4px] bg-gradient-to-br from-kommit-blue-dark to-kommit-blue-light py-2.5 text-sm font-bold tracking-[-0.35px] text-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] ${
        disabled ? 'opacity-30' : 'cursor-pointer'
      }`}
    >
      {label}
    </button>
  )
}
