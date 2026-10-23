import { AlertIcon } from './icons'

type FormBannerProps = {
  message: string
  onDismiss?: () => void
}

export function FormBanner({ message, onDismiss }: FormBannerProps) {
  return (
    <div
      className="mb-4 flex items-start gap-2.5 rounded-[10px] border border-[#edd3cd] bg-[#fdf4f1] px-3.5 py-2.5 text-[12px] leading-relaxed text-[#9a493c]"
      role="alert"
    >
      <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#c06858]" />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button
          className="-mr-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[#bb7a6f] transition-colors hover:bg-[#f2ddd7] hover:text-[#8d3f33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c06858]/40"
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss message"
        >
          <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
            <path
              d="m4 4 8 8m0-8-8 8"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
