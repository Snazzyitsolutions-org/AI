import { EyeIcon, EyeOffIcon } from './icons'

type PasswordToggleProps = {
  visible: boolean
  onToggle: () => void
}

export function PasswordToggle({ visible, onToggle }: PasswordToggleProps) {
  return (
    <button
      className="flex h-8 w-8 items-center justify-center rounded-md text-[#9aada2] transition-colors hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
      type="button"
      onClick={onToggle}
      aria-label={visible ? 'Hide password' : 'Show password'}
      title={visible ? 'Hide password' : 'Show password'}
    >
      {visible ? (
        <EyeOffIcon className="h-4 w-4" />
      ) : (
        <EyeIcon className="h-4 w-4" />
      )}
    </button>
  )
}
