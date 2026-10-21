import { useEffect } from 'react'
import { CloseIcon, CheckCircleIcon } from './DashboardIcons'

type ToastProps = {
  message: string
  onClose: () => void
}

export function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 4200)
    return () => window.clearTimeout(timer)
  }, [onClose])

  return (
    <div className="dashboard-toast" role="status" aria-live="polite">
      <span className="dashboard-toast__icon">
        <CheckCircleIcon />
      </span>
      <span>{message}</span>
      <button type="button" onClick={onClose} aria-label="Dismiss notification">
        <CloseIcon />
      </button>
      <i className="dashboard-toast__timer" aria-hidden="true" />
    </div>
  )
}
