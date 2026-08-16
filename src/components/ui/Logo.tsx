import kommitIcon from '@/assets/kommit-icon.png'

export default function Logo() {
  return (
    <div className="flex items-center gap-[3px]">
      <img
        src={kommitIcon}
        alt="Kommit"
        className="h-[29px] w-[35px] object-cover"
      />
      <span className="text-[20px] font-bold tracking-[-0.5px] text-[#0f172a]">
        Kommit
      </span>
    </div>
  )
}
