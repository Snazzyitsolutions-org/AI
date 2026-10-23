import { getPasswordStrength } from '../lib/password'

type StrengthMeterProps = {
  password: string
}

const BAR_COLORS = [
  'bg-[#dfe9e3]',
  'bg-rose-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-emerald-600',
]

const LABEL_COLORS = [
  'text-[#9aada2]',
  'text-rose-500',
  'text-amber-600',
  'text-emerald-600',
  'text-emerald-700',
]

export function StrengthMeter({ password }: StrengthMeterProps) {
  const { score, label } = getPasswordStrength(password)

  return (
    <div className="mt-2 flex items-center justify-between gap-3" aria-live="polite">
      <div className="flex flex-1 gap-1">
        {[1, 2, 3, 4].map((level) => (
          <span
            key={level}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              score >= level ? BAR_COLORS[score] : 'bg-[#dfe9e3]'
            }`}
          />
        ))}
      </div>
      <span
        className={`shrink-0 text-[10px] font-semibold ${
          password ? LABEL_COLORS[score] : 'text-[#9aada2]'
        }`}
      >
        {password ? label : '8+ chars, letter & number'}
      </span>
    </div>
  )
}
