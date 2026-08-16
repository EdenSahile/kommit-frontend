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
      className={`flex items-center justify-center rounded-[4px] border border-kommit-blue-dark px-4 py-3 text-base font-semibold ${variantClasses}`}
    >
      {children}
    </Link>
  )
}
