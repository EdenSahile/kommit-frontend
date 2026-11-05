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
import { SIGNUP, SIGNUP_ERRORS } from '@/data/signup'
import { isSignupFormFilled } from '@/logic/auth/formState/formState'
import { isAuthSubmitDisabled } from '@/logic/auth/submitState/submitState'
import { signupFieldsToFlag } from '@/logic/auth/fieldErrors/fieldErrors'
import { signUp } from '@/lib/api/auth'
import { errorTargetFor } from '@/logic/auth/errorTarget/errorTarget'
import { ARRIVAL_FLAG_KEY } from '@/logic/auth/arrivalToast/arrivalToast'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export default function SignupPage() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // RM30 : avant la 1re soumission, aucun message ; après, les messages se
  // recalculent à chaque saisie. D'où un booléen plutôt qu'un message par champ.
  const [hasSubmittedOnce, setHasSubmittedOnce] = useState(false)
  const [emailServerError, setEmailServerError] = useState<string>()
  const [formError, setFormError] = useState<string>()

  const isFilled = isSignupFormFilled(firstName, email, password)
  const flagged = signupFieldsToFlag(
    { firstName, email, password },
    hasSubmittedOnce
  )

  const signupMutation = useMutation({
    mutationFn: () =>
      signUp(API_BASE_URL, { name: firstName.trim(), email, password }),
    onSuccess: (result) => {
      if (result.ok) {
        sessionStorage.setItem(ARRIVAL_FLAG_KEY, 'signup')
        navigate('/')
        return
      }

      // Serveur muet : aucune ApiError, donc rien à afficher (cf. lib/api/auth.ts).
      if (!result.error) return

      const target =
        result.error.code === 'EMAIL_ALREADY_EXISTS'
          ? errorTargetFor(result.error.code)
          : 'form'

      if (target === 'email') {
        setEmailServerError(result.error.message)
      } else {
        setFormError(result.error.message)
      }
    },
  })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setHasSubmittedOnce(true)

    const toFlag = signupFieldsToFlag({ firstName, email, password }, true)
    if (toFlag.firstName || toFlag.email || toFlag.password) return

    setFormError(undefined)
    signupMutation.mutate()
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-kommit-bg">
      <Navbar>
        <AuthNavButton to="/signin" variant="secondary">
          {NAVBAR.signIn}
        </AuthNavButton>
      </Navbar>

      <div className="w-full px-6 py-8 md:px-12 lg:px-[200px]">
        <div className="h-10 sm:h-[154px]" />
      </div>

      <form className="w-full flex-1" noValidate onSubmit={handleSubmit}>
        <AuthCard
          title={SIGNUP.title}
          footerText={SIGNUP.footerText}
          footerLinkText={SIGNUP.footerLinkText}
          footerLinkTo="/signin"
        >
          <div className="flex w-full flex-col gap-5">
            <AuthTextField
              label={SIGNUP.firstNameLabel}
              type="text"
              autoComplete="given-name"
              value={firstName}
              onChange={setFirstName}
              errorMessage={
                flagged.firstName ? SIGNUP_ERRORS.firstName : undefined
              }
            />
            <AuthTextField
              label={SIGNUP.emailLabel}
              type="email"
              autoComplete="email"
              placeholder={SIGNUP.emailPlaceholder}
              value={email}
              onChange={(value) => {
                setEmail(value)
                setEmailServerError(undefined)
              }}
              errorMessage={
                emailServerError ??
                (flagged.email ? SIGNUP_ERRORS.email : undefined)
              }
            />
            <AuthTextField
              label={SIGNUP.passwordLabel}
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={setPassword}
              errorMessage={
                flagged.password ? SIGNUP_ERRORS.password : undefined
              }
            />
            {formError && (
              <p className="w-full text-center text-xs text-kommit-error">
                {formError}
              </p>
            )}
            <AuthSubmitButton
              label={SIGNUP.submit}
              disabled={isAuthSubmitDisabled(isFilled, signupMutation.isPending)}
            />
          </div>
        </AuthCard>
      </form>

      <Footer />
    </div>
  )
}
