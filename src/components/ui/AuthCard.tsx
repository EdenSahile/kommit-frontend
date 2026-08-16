import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import SecurityNotice from '@/components/ui/SecurityNotice'

type AuthCardProps = {
  title: string
  children: ReactNode
  footerText: string
  footerLinkText: string
  footerLinkTo: string
}

export default function AuthCard({
  title,
  children,
  footerText,
  footerLinkText,
  footerLinkTo,
}: AuthCardProps) {
  return (
    <div className="mx-auto flex w-full max-w-[400px] flex-col items-center">
      <div className="flex w-full flex-col items-center gap-8 rounded-[8px] border border-[rgba(194,198,214,0.15)] bg-white p-[33px] drop-shadow-[0px_12px_16px_rgba(20,28,37,0.04)]">
        <h1 className="text-2xl font-bold text-kommit-heading">{title}</h1>

        {children}

        <p className="text-center text-sm text-kommit-grey">
          {footerText}{' '}
          <Link to={footerLinkTo} className="text-kommit-blue-dark">
            {footerLinkText}
          </Link>
        </p>
      </div>

      <SecurityNotice />
    </div>
  )
}
