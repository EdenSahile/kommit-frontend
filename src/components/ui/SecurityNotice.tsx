import { LockIcon } from 'lucide-react'

export default function SecurityNotice() {
  return (
    <div className="flex items-center gap-2 pt-8">
      <LockIcon className="size-3 text-kommit-grey/60" />
      <span className="text-[10px] font-medium tracking-[1px] text-kommit-grey/60 uppercase">
        Authentification sécurisée
      </span>
    </div>
  )
}
