import type { ReactNode } from 'react'

type FormFieldProps = {
  id: string
  label: string
  type?: 'text' | 'email' | 'password'
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoComplete?: string
  autoFocus?: boolean
  error?: string
  hint?: string
  icon?: ReactNode
  trailing?: ReactNode
  disabled?: boolean
}

export function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  autoFocus = false,
  error,
  hint,
  icon,
  trailing,
  disabled = false,
}: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[12px] font-semibold text-[#33493e]"
      >
        {label}
      </label>

      <div className="group relative">
        {icon && (
          <span
            className={`pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center transition-colors ${
              error ? 'text-rose-400' : 'text-[#9aada2] group-focus-within:text-emerald-600'
            }`}
          >
            <span className="[&_svg]:h-4 [&_svg]:w-4">{icon}</span>
          </span>
        )}

        <input
          id={id}
          name={id}
          className={`h-12 w-full rounded-[10px] border bg-white text-[13px] text-[#15271f] outline-none transition-all duration-150 placeholder:text-[#9fb1a6] disabled:cursor-not-allowed disabled:bg-[#f3f7f4] disabled:text-[#8a9c91] ${
            icon ? 'pl-10' : 'pl-3.5'
          } ${trailing ? 'pr-11' : 'pr-3.5'} ${
            error
              ? 'border-[#e7b4ab] hover:border-[#dc9d92] focus:border-[#c96a5a] focus:ring-4 focus:ring-[#c96a5a]/10'
              : 'border-[#dfe9e3] hover:border-[#cbdcd1] focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
          }`}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          disabled={disabled}
          spellCheck={false}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          aria-required="true"
        />

        {trailing && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-1.5">
            {trailing}
          </span>
        )}
      </div>

      {error ? (
        <p
          id={errorId}
          className="mt-1.5 flex items-start gap-1 text-[11px] font-medium text-rose-600"
          role="alert"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            className="mt-px h-3.5 w-3.5 shrink-0"
            aria-hidden="true"
          >
            <circle cx="10" cy="10" r="7.4" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 6.3v4.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="10" cy="13.6" r="0.9" fill="currentColor" />
          </svg>
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1.5 text-[11px] text-[#82968a]">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
