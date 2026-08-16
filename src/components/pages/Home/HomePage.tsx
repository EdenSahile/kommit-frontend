import { LogOutIcon } from 'lucide-react'
import Navbar from '@/components/ui/Navbar'
import AuthNavButton from '@/components/ui/AuthNavButton'
import Footer from '@/components/ui/Footer'

type HomePageProps = {
  isAuthenticated: boolean
  firstName?: string
  onSignOut?: () => void
}

export default function HomePage({
  isAuthenticated,
  firstName,
  onSignOut,
}: HomePageProps) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-kommit-bg">
      <Navbar>
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
            <AuthNavButton to="/signin" variant="secondary">
              Se connecter
            </AuthNavButton>
            <AuthNavButton to="/signup" variant="primary">
              Créer un compte
            </AuthNavButton>
          </>
        )}
      </Navbar>

      <section className="flex w-full flex-col items-center px-[200px] py-8">
        <div className="flex flex-col items-center gap-3 py-7 text-center">
          {isAuthenticated ? (
            <>
              <h1 className="text-5xl font-bold text-kommit-heading">
                Quoi de neuf aujourd&apos;hui,{' '}
                <span className="text-kommit-accent">{firstName} ?</span>
              </h1>
              <p className="max-w-[504px] text-lg text-kommit-grey-blue">
                Renseigne ton daily du jour ci-dessous.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-5xl font-bold text-kommit-heading">
                Prêt(e) pour ton{' '}
                <span className="text-kommit-accent">daily standup ?</span>
              </h1>
              <p className="max-w-[544px] text-lg text-kommit-grey-blue">
                Track tes résultats pour que les jours ne se ressemblent pas.
              </p>
            </>
          )}
        </div>
      </section>

      <div className="min-h-px flex-1" />

      <Footer />
    </div>
  )
}
