import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Logo from '@/components/ui/Logo'

type NavbarProps = {
  children: ReactNode
}

export default function Navbar({ children }: NavbarProps) {
  return (
    <header className="flex w-full items-center justify-between bg-white/80 px-6 py-5 backdrop-blur-[6px]">
      <Link to="/">
        <Logo />
      </Link>

      <nav className="flex items-center gap-6">{children}</nav>
    </header>
  )
}
