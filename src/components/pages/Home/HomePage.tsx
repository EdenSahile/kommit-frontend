import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { LogOutIcon } from 'lucide-react'
import Navbar from '@/components/ui/Navbar'
import AuthNavButton from '@/components/ui/AuthNavButton'
import Footer from '@/components/ui/Footer'
import { toast } from '@/components/ui/toast'
import { getSession, signOut } from '@/logic/auth/authApi/authApi'
import {
  ARRIVAL_FLAG_KEY,
  arrivalToastFor,
  type ArrivalFlag,
} from '@/logic/auth/arrivalToast/arrivalToast'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export default function HomePage() {
  const queryClient = useQueryClient()

  const sessionQuery = useQuery({
    queryKey: ['session'],
    queryFn: () => getSession(API_BASE_URL),
  })

  const signOutMutation = useMutation({
    mutationFn: () => signOut(API_BASE_URL),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['session'] }),
  })

  const session = sessionQuery.data
  const isAuthenticated = Boolean(session)
  const firstName = session?.user.name

  useEffect(() => {
    if (!session) return

    const flag = sessionStorage.getItem(ARRIVAL_FLAG_KEY) as ArrivalFlag | null
    sessionStorage.removeItem(ARRIVAL_FLAG_KEY)

    const arrivalToast = arrivalToastFor(flag, session.user.name)
    if (arrivalToast) {
      toast.add({
        type: arrivalToast.type,
        title: arrivalToast.message,
        description: '',
      })
    }
  }, [session])

  return (
    <div className="flex min-h-screen flex-col items-center bg-kommit-bg">
      <Navbar>
        {isAuthenticated ? (
          <button
            type="button"
            onClick={() => signOutMutation.mutate()}
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
