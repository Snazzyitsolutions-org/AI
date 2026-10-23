import { GoogleIcon } from './icons'

type GoogleButtonProps = {
  disabled?: boolean
  onClick: () => void
}

export function GoogleButton({ disabled = false, onClick }: GoogleButtonProps) {
  return (
    <button
      className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-[10px] border border-[#dfe9e3] bg-white text-[13px] font-semibold text-[#35493f] shadow-[0_1px_2px_rgba(14,60,43,0.04)] transition-all duration-150 hover:border-[#cbdcd1] hover:bg-[#f8fbf9] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-60"
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Continue with Google"
    >
      <GoogleIcon className="h-[17px] w-[17px] shrink-0" />
      <span>Continue with Google</span>
    </button>
  )
}
