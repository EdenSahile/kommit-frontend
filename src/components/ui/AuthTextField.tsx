type AuthTextFieldProps = {
  label: string
  type: 'text' | 'email' | 'password'
  autoComplete: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  errorMessage?: string
}

export default function AuthTextField({
  label,
  type,
  autoComplete,
  placeholder,
  value,
  onChange,
  errorMessage,
}: AuthTextFieldProps) {
  return (
    <div className="flex w-full flex-col items-start gap-1.5">
      <span className="text-xs font-semibold tracking-[0.6px] text-kommit-grey uppercase">
        {label}
      </span>
      <input
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`h-[43px] w-full rounded-[4px] border-x border-t border-b-2 bg-kommit-input-bg px-3 text-sm text-kommit-grey-blue placeholder:text-kommit-placeholder focus:outline-none ${
          errorMessage
            ? 'border-kommit-error'
            : 'border-kommit-input-border focus:border-kommit-blue-dark'
        }`}
      />
      {errorMessage && (
        <p className="w-full text-xs text-kommit-error">{errorMessage}</p>
      )}
    </div>
  )
}
