import { FOOTER } from '@/data/layout'

export default function Footer() {
  return (
    <footer className="flex w-full items-center justify-center px-6 py-10 md:px-12 lg:px-[156px]">
      <p className="text-center text-sm text-kommit-grey">
        {FOOTER.creditPrefix}{' '}
        <a
          href={FOOTER.creditUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold"
        >
          {FOOTER.creditName}
        </a>{' '}
        {FOOTER.rights}
      </p>
    </footer>
  )
}
