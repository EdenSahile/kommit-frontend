import kommitIcon from '@/assets/kommit-icon.png'
import { NAVBAR } from '@/data/layout'

export default function Logo() {
  return (
    <div className="flex items-center gap-[3px]">
      {/* Décoratif : le nom « Kommit » est déjà lu juste à côté. */}
      <img
        src={kommitIcon}
        alt=""
        aria-hidden="true"
        className="h-[29px] w-[35px] object-cover"
      />
      <span className="text-kommit-logo text-[20px] font-bold tracking-[-0.5px]">
        {NAVBAR.logoText}
      </span>
    </div>
  )
}
