import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import Navbar from '@/components/ui/Navbar'
import AuthNavButton from '@/components/ui/AuthNavButton'
import AuthCard from '@/components/ui/AuthCard'
import AuthTextField from '@/components/ui/AuthTextField'
import AuthSubmitButton from '@/components/ui/AuthSubmitButton'
import Footer from '@/components/ui/Footer'
import { isSignupFormFilled } from '@/logic/auth/authFormState/authFormState'
import {
  isEmailValid,
  isFirstNameValid,
  isPasswordValid,
} from '@/logic/auth/authValidation/authValidation'
import { signUp } from '@/logic/auth/authApi/authApi'
import { authErrorTargetFor } from '@/logic/auth/authErrorTarget/authErrorTarget'
import { ARRIVAL_FLAG_KEY } from '@/logic/auth/arrivalToast/arrivalToast'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export default function SignupPage() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstNameError, setFirstNameError] = useState<string>()
  const [emailError, setEmailError] = useState<string>()
  const [passwordError, setPasswordError] = useState<string>()
  const [formError, setFormError] = useState<string>()

  const isFilled = isSignupFormFilled(firstName, email, password)

  const signupMutation = useMutation({
    mutationFn: () =>
      signUp(API_BASE_URL, { name: firstName.trim(), email, password }),
    onSuccess: (result) => {
      if (result.ok) {
        sessionStorage.setItem(ARRIVAL_FLAG_KEY, 'signup')
        navigate('/')
        return
      }

      const target =
        result.error.code === 'EMAIL_ALREADY_EXISTS'
          ? authErrorTargetFor(result.error.code)
          : 'form'

      if (target === 'email') {
        setEmailError(result.error.message)
      } else {
        setFormError(result.error.message)
      }
    },
  })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const firstNameValid = isFirstNameValid(firstName)
    const emailValid = isEmailValid(email)
    const passwordValid = isPasswordValid(password)

    setFirstNameError(firstNameValid ? undefined : 'Le prénom est obligatoire.')
    setEmailError(emailValid ? undefined : 'Adresse email invalide.')
    setPasswordError(
      passwordValid
        ? undefined
        : 'Le mot de passe doit contenir au moins 8 caractères.'
    )

    if (!firstNameValid || !emailValid || !passwordValid) return

    setFormError(undefined)
    signupMutation.mutate()
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-kommit-bg">
      <Navbar>
        <AuthNavButton to="/signin" variant="secondary">
          Se connecter
        </AuthNavButton>
      </Navbar>

      <div className="w-full px-[200px] py-8">
        <div className="h-[154px]" />
      </div>

      <form className="w-full flex-1" noValidate onSubmit={handleSubmit}>
        <AuthCard
          title="Créer un compte"
          footerText="Tu as déjà un compte ?"
          footerLinkText="Connecte-toi."
          footerLinkTo="/signin"
        >
          <div className="flex w-full flex-col gap-5">
            <AuthTextField
              label="Prénom*"
              type="text"
              autoComplete="given-name"
              value={firstName}
              onChange={(value) => {
                setFirstName(value)
                setFirstNameError(undefined)
              }}
              errorMessage={firstNameError}
            />
            <AuthTextField
              label="Email*"
              type="email"
              autoComplete="email"
              placeholder="jean.dev@gmail.com"
              value={email}
              onChange={(value) => {
                setEmail(value)
                setEmailError(undefined)
              }}
              errorMessage={emailError}
            />
            <AuthTextField
              label="Mot de passe*"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(value) => {
                setPassword(value)
                setPasswordError(undefined)
              }}
              errorMessage={passwordError}
            />
            {formError && (
              <p className="w-full text-center text-xs text-kommit-error">
                {formError}
              </p>
            )}
            <AuthSubmitButton
              label="Créer un compte"
              disabled={!isFilled || signupMutation.isPending}
            />
          </div>
        </AuthCard>
      </form>

      <Footer />
    </div>
  )
}
