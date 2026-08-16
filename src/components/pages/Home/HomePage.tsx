import Navbar from '@/components/ui/Navbar'
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
      <Navbar isAuthenticated={isAuthenticated} onSignOut={onSignOut} />

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
