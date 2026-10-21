import { getPasswordStrength } from '../lib/password'

type StrengthMeterProps = {
  password: string
}

export function StrengthMeter({ password }: StrengthMeterProps) {
  const { score, label } = getPasswordStrength(password)

  return (
    <div className="strength" aria-live="polite">
      <div className="strength__bars" data-score={score}>
        {[1, 2, 3, 4].map((level) => (
          <span key={level} className={score >= level ? 'is-active' : ''} />
        ))}
      </div>
      <span className={`strength__label${password ? ` strength__label--${score}` : ''}`}>
        {password ? label : '8+ chars, letter & number'}
      </span>
    </div>
  )
}
