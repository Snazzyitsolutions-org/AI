import { AlertIcon } from './icons'

type FormBannerProps = {
  message: string
  onDismiss?: () => void
}

export function FormBanner({ message, onDismiss }: FormBannerProps) {
  return (
    <div className="form-banner" role="alert">
      <AlertIcon className="form-banner__icon" />
      <span>{message}</span>
      {onDismiss && (
        <button
          className="form-banner__close"
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss message"
        >
          ×
        </button>
      )}
    </div>
  )
}
