import { GoogleIcon } from './icons'

type GoogleButtonProps = {
  disabled?: boolean
  onClick: () => void
}

export function GoogleButton({ disabled = false, onClick }: GoogleButtonProps) {
  return (
    <button
      className="google-button"
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Continue with Google"
    >
      <GoogleIcon className="google-button__icon" />
      <span>Continue with Google</span>
    </button>
  )
}
