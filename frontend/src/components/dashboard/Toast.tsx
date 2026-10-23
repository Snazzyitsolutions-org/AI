import { useEffect } from 'react'
import { CloseIcon, CheckCircleIcon } from './DashboardIcons'

type ToastProps = {
  message: string
  onClose: () => void
}

export function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 4000)
    return () => window.clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#0c3529]/95 text-white p-3.5 px-4 shadow-2xl backdrop-blur-xl border border-emerald-500/30 max-w-sm animate-in fade-in slide-in-from-bottom-4"
      role="status"
      aria-live="polite"
    >
      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-[#c8f169] flex items-center justify-center shrink-0">
        <CheckCircleIcon className="w-3.5 h-3.5 text-[#c8f169]" />
      </span>
      <span className="text-xs font-semibold text-slate-100 flex-1 leading-snug">
        {message}
      </span>
      <button
        type="button"
        onClick={onClose}
        className="w-6 h-6 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer shrink-0"
        aria-label="Dismiss notification"
      >
        <CloseIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
