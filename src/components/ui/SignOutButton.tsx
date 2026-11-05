import { LogOutIcon } from 'lucide-react'
import { NAVBAR } from '@/data/layout'

type SignOutButtonProps = {
  onClick: () => void
  disabled?: boolean
}

export default function SignOutButton({
  onClick,
  disabled,
}: SignOutButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-base font-semibold text-kommit-grey-blue disabled:opacity-70"
    >
      <LogOutIcon className="size-6" />
      {NAVBAR.signOut}
    </button>
  )
}
