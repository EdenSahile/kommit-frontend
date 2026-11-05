import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type AuthNavButtonProps = {
  to: string
  variant: 'primary' | 'secondary'
  children: ReactNode
}

export default function AuthNavButton({
  to,
  variant,
  children,
}: AuthNavButtonProps) {
  const variantClasses =
    variant === 'primary'
      ? 'bg-gradient-to-r from-kommit-blue-dark to-kommit-blue-light text-white hover:opacity-80'
      : 'bg-white text-kommit-blue-text'

  return (
    <Link
      to={to}
      className={`flex min-h-11 shrink-0 items-center justify-center rounded-[4px] border border-kommit-blue-dark px-3 py-2 text-sm font-semibold whitespace-nowrap sm:min-h-0 sm:px-4 sm:py-3 sm:text-base ${variantClasses}`}
    >
      {children}
    </Link>
  )
}
