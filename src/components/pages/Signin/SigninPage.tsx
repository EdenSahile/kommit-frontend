import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import Navbar from '@/components/ui/Navbar'
import AuthNavButton from '@/components/ui/AuthNavButton'
import AuthCard from '@/components/ui/AuthCard'
import AuthTextField from '@/components/ui/AuthTextField'
import AuthSubmitButton from '@/components/ui/AuthSubmitButton'
import Footer from '@/components/ui/Footer'
import { isSigninFormFilled } from '@/logic/auth/authFormState/authFormState'
import { signIn } from '@/logic/auth/authApi/authApi'
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
          Créer un compte
        </AuthNavButton>
      </Navbar>

      <div className="w-full px-[200px] py-8">
        <div className="h-[154px]" />
      </div>

      <form className="w-full flex-1" onSubmit={handleSubmit}>
        <AuthCard
          title="Se connecter"
          footerText="Pas de compte ?"
          footerLinkText="Créer un compte maintenant."
          footerLinkTo="/signup"
        >
          <div className="flex w-full flex-col gap-5">
            <AuthTextField
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="jean.dev@gmail.com"
              value={email}
              onChange={(value) => {
                setEmail(value)
                setFormError(undefined)
              }}
            />
            <AuthTextField
              label="Mot de passe"
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
            <AuthSubmitButton
              label="Me connecter"
              disabled={!isFilled || signinMutation.isPending}
            />
          </div>
        </AuthCard>
      </form>

      <Footer />
    </div>
  )
}
