import type { ReactNode } from 'react'
import { ArrowRightIcon } from './icons'

type SubmitButtonProps = {
  loading: boolean
  loadingLabel: string
  children: ReactNode
}

export function SubmitButton({ loading, loadingLabel, children }: SubmitButtonProps) {
  return (
    <button
      className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-emerald-600 to-teal-600 text-[13px] font-bold text-white shadow-[0_10px_24px_-10px_rgba(16,132,100,0.55)] transition-all duration-200 hover:from-emerald-700 hover:to-teal-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/25 active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
      type="submit"
      disabled={loading}
      aria-busy={loading}
    >
      {loading ? (
        <>
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
            aria-hidden="true"
          />
          {loadingLabel}
        </>
      ) : (
        <>
          {children}
          <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </>
      )}
    </button>
  )
}
