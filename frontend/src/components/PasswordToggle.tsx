import { EyeIcon, EyeOffIcon } from './icons'

type PasswordToggleProps = {
  visible: boolean
  onToggle: () => void
}

export function PasswordToggle({ visible, onToggle }: PasswordToggleProps) {
  return (
    <button
      className="password-toggle"
      type="button"
      onClick={onToggle}
      aria-label={visible ? 'Hide password' : 'Show password'}
      title={visible ? 'Hide password' : 'Show password'}
    >
      {visible ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  )
}
