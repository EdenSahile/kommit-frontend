import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardTitle } from '@/components/ui/card'
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
      <Card className="w-full min-h-[479px] items-center gap-8 rounded-[8px] border border-[rgba(194,198,214,0.15)] bg-white p-[33px] ring-0 drop-shadow-[0px_12px_16px_rgba(20,28,37,0.04)]">
        <CardTitle className="text-2xl font-bold text-kommit-heading">
          <h1>{title}</h1>
        </CardTitle>

        {children}

        <p className="text-center text-sm text-kommit-grey">
          {footerText}{' '}
          <Link to={footerLinkTo} className="text-kommit-blue-dark">
            {footerLinkText}
          </Link>
        </p>
      </Card>

      <SecurityNotice />
    </div>
  )
}
