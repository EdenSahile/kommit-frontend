import { useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Navbar from '@/components/ui/Navbar'
import AuthNavButton from '@/components/ui/AuthNavButton'
import SignOutButton from '@/components/ui/SignOutButton'
import Footer from '@/components/ui/Footer'
import { toast } from '@/components/ui/toast'
import { NAVBAR } from '@/data/layout'
import { HOME_AUTHENTICATED, HOME_VISITOR } from '@/data/home'
import { getSession, signOut } from '@/lib/api/auth'
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

  // La déconnexion est silencieuse (RM5) : le toast d'arrivée encore à l'écran
  // doit partir avec la session, sinon il survit à l'état connecté qui l'a produit.
  const arrivalToastId = useRef<string | null>(null)

  const signOutMutation = useMutation({
    mutationFn: () => signOut(API_BASE_URL),
    onSuccess: () => {
      if (arrivalToastId.current) {
        toast.close(arrivalToastId.current)
        arrivalToastId.current = null
      }
      queryClient.invalidateQueries({ queryKey: ['session'] })
    },
  })

  const session = sessionQuery.data
  const isAuthenticated = Boolean(session)
  const firstName = session?.user.name
  const isSessionResolved = !sessionQuery.isPending

  useEffect(() => {
    if (!session) return

    const flag = sessionStorage.getItem(ARRIVAL_FLAG_KEY) as ArrivalFlag | null
    sessionStorage.removeItem(ARRIVAL_FLAG_KEY)

    const arrivalToast = arrivalToastFor(flag, session.user.name)
    if (arrivalToast) {
      arrivalToastId.current = toast.add({
        type: arrivalToast.type,
        title: arrivalToast.message,
        description: '',
      })
    }
  }, [session])

  return (
    <div className="flex min-h-screen flex-col items-center bg-kommit-bg">
      <Navbar>
        {isSessionResolved &&
          (isAuthenticated ? (
            <SignOutButton
              onClick={() => signOutMutation.mutate()}
              disabled={signOutMutation.isPending}
            />
          ) : (
            <>
              <AuthNavButton to="/signin" variant="secondary">
                {NAVBAR.signIn}
              </AuthNavButton>
              <AuthNavButton to="/signup" variant="primary">
                {NAVBAR.signUp}
              </AuthNavButton>
            </>
          ))}
      </Navbar>

      <section className="mx-auto flex w-full max-w-[1280px] flex-col items-center px-6 py-8 md:px-12 lg:px-[200px]">
        <div className="flex flex-col items-center gap-3 py-7 text-center">
          {isSessionResolved &&
            (isAuthenticated ? (
              <>
                <h1 className="text-3xl font-bold text-kommit-heading sm:text-5xl">
                  {HOME_AUTHENTICATED.titleStart}
                  <span className="text-kommit-accent">
                    {firstName}
                    {HOME_AUTHENTICATED.titleAccentSuffix}
                  </span>
                </h1>
                <p className="max-w-[504px] text-lg text-kommit-grey-blue">
                  {HOME_AUTHENTICATED.subtitle}
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-kommit-heading sm:text-5xl">
                  {HOME_VISITOR.titleStart}
                  <span className="text-kommit-accent">
                    {HOME_VISITOR.titleAccent}
                  </span>
                </h1>
                <p className="max-w-[544px] text-lg text-kommit-grey-blue">
                  {HOME_VISITOR.subtitle}
                </p>
              </>
            ))}
        </div>
      </section>

      <div className="min-h-px flex-1" />

      <Footer />
    </div>
  )
}
