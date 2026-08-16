import { Link } from 'react-router-dom'
import { LogOutIcon } from 'lucide-react'
import Logo from '@/components/ui/Logo'

type NavbarProps = {
  isAuthenticated: boolean
  onSignOut?: () => void
}

export default function Navbar({ isAuthenticated, onSignOut }: NavbarProps) {
  return (
    <header className="flex w-full items-center justify-between bg-white/80 px-6 py-5 backdrop-blur-[6px]">
      <Link to="/">
        <Logo />
      </Link>

      <nav className="flex items-center gap-6">
        {isAuthenticated ? (
          <button
            type="button"
            onClick={onSignOut}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-base font-semibold text-kommit-grey-blue"
          >
            <LogOutIcon className="size-6" />
            Se déconnecter
          </button>
        ) : (
          <>
            <Link
              to="/signin"
              className="flex items-center justify-center rounded-[4px] border border-kommit-blue-dark bg-white px-4 py-3 text-base font-semibold text-kommit-blue-text"
            >
              Se connecter
            </Link>
            <Link
              to="/signup"
              className="flex items-center justify-center rounded-[4px] border border-kommit-blue-dark bg-gradient-to-r from-kommit-blue-dark to-kommit-blue-light px-4 py-3 text-base font-semibold text-white hover:opacity-80"
            >
              Créer un compte
            </Link>
          </>
        )}
      </nav>
    </header>
  )
}
