import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import Navbar from '@/components/ui/Navbar'
import AuthNavButton from '@/components/ui/AuthNavButton'
import AuthCard from '@/components/ui/AuthCard'
import AuthTextField from '@/components/ui/AuthTextField'
import AuthSubmitButton from '@/components/ui/AuthSubmitButton'
import Footer from '@/components/ui/Footer'
import { NAVBAR } from '@/data/layout'
import { SIGNIN } from '@/data/signin'
import { isSigninFormFilled } from '@/logic/auth/formState/formState'
import { isAuthSubmitDisabled } from '@/logic/auth/submitState/submitState'
import { signIn } from '@/lib/api/auth'
import { ARRIVAL_FLAG_KEY } from '@/logic/auth/arrivalToast/arrivalToast'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export default function SigninPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string>()

  const isFilled = isSigninFormFilled(email, password)

  const signinMutation = useMutation({
    mutationFn: () => signIn(API_BASE_URL, { email, password }),
    onSuccess: (result) => {
      if (result.ok) {
        sessionStorage.setItem(ARRIVAL_FLAG_KEY, 'signin')
        navigate('/')
        return
      }

      // Serveur muet : aucune ApiError, donc rien à afficher (cf. lib/api/auth.ts).
      if (!result.error) return

      setFormError(result.error.message)
    },
  })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!isFilled) return

    setFormError(undefined)
    signinMutation.mutate()
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-kommit-bg">
      <Navbar>
        <AuthNavButton to="/signup" variant="primary">
          {NAVBAR.signUp}
        </AuthNavButton>
      </Navbar>

      <div className="w-full px-6 py-8 md:px-12 lg:px-[200px]">
        <div className="h-10 sm:h-[154px]" />
      </div>

      <form className="w-full flex-1" noValidate onSubmit={handleSubmit}>
        <AuthCard
          title={SIGNIN.title}
          footerText={SIGNIN.footerText}
          footerLinkText={SIGNIN.footerLinkText}
          footerLinkTo="/signup"
        >
          <div className="flex w-full flex-1 flex-col gap-5">
            <AuthTextField
              label={SIGNIN.emailLabel}
              type="email"
              autoComplete="email"
              placeholder={SIGNIN.emailPlaceholder}
              value={email}
              onChange={(value) => {
                setEmail(value)
                setFormError(undefined)
              }}
            />
            <AuthTextField
              label={SIGNIN.passwordLabel}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(value) => {
                setPassword(value)
                setFormError(undefined)
              }}
            />
            {formError && (
              <p className="w-full text-center text-xs text-kommit-error">
                {formError}
              </p>
            )}
            {/* Bloc vide de la maquette (node 15:237), il pousse le bouton en bas de carte. */}
            <div className="min-h-[65px] flex-1" />
            <AuthSubmitButton
              label={SIGNIN.submit}
              loadingLabel={SIGNIN.submitLoading}
              isLoading={signinMutation.isPending}
              disabled={isAuthSubmitDisabled(isFilled, signinMutation.isPending)}
            />
          </div>
        </AuthCard>
      </form>

      <Footer />
    </div>
  )
}
