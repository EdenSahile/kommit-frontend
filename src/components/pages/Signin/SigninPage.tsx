import { useState } from 'react'
import Navbar from '@/components/ui/Navbar'
import AuthNavButton from '@/components/ui/AuthNavButton'
import AuthCard from '@/components/ui/AuthCard'
import AuthTextField from '@/components/ui/AuthTextField'
import AuthSubmitButton from '@/components/ui/AuthSubmitButton'
import Footer from '@/components/ui/Footer'

export default function SigninPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const isFilled = email.trim() !== '' && password.trim() !== ''

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

      <form className="w-full flex-1">
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
              onChange={setEmail}
            />
            <AuthTextField
              label="Mot de passe"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={setPassword}
            />
            <AuthSubmitButton label="Me connecter" disabled={!isFilled} />
          </div>
        </AuthCard>
      </form>

      <Footer />
    </div>
  )
}
