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
  icon: ReactNode
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
    <div className={`field${error ? ' field--error' : ''}`}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <div className="input-shell">
        <span className="input-shell__icon">{icon}</span>
        <input
          id={id}
          name={id}
          className="input-shell__input"
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
        {trailing}
      </div>
      {error ? (
        <p id={errorId} className="field__message field__message--error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="field__message">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
