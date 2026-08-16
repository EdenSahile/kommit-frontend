import { useState } from 'react'
import Navbar from '@/components/ui/Navbar'
import AuthNavButton from '@/components/ui/AuthNavButton'
import AuthCard from '@/components/ui/AuthCard'
import AuthTextField from '@/components/ui/AuthTextField'
import AuthSubmitButton from '@/components/ui/AuthSubmitButton'
import Footer from '@/components/ui/Footer'

export default function SignupPage() {
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const isFilled =
    firstName.trim() !== '' && email.trim() !== '' && password.trim() !== ''

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

      <form className="w-full flex-1">
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
              onChange={setFirstName}
            />
            <AuthTextField
              label="Email*"
              type="email"
              autoComplete="email"
              placeholder="jean.dev@gmail.com"
              value={email}
              onChange={setEmail}
            />
            <AuthTextField
              label="Mot de passe*"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={setPassword}
            />
            <AuthSubmitButton label="Créer un compte" disabled={!isFilled} />
          </div>
        </AuthCard>
      </form>

      <Footer />
    </div>
  )
}
