import { Link } from 'react-router-dom'

type BrandMarkProps = {
  to?: string
  compact?: boolean
  tone?: 'default' | 'light'
}

export function BrandMark({ to = '/', compact = false, tone = 'default' }: BrandMarkProps) {
  return (
    <Link
      to={to}
      aria-label="CallWave dashboard"
      className="inline-flex items-center gap-2.5 group no-underline focus:outline-none select-none"
    >
      <span className="flex items-center justify-center w-9 h-9 rounded-[12px] bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 shadow-md shadow-emerald-500/25 ring-1 ring-emerald-400/30 text-white shrink-0 transition-transform duration-300 group-hover:scale-105 p-1.5">
        <img
          src="/logo.png"
          alt="CallWave"
          className="w-full h-full object-contain filter drop-shadow-xs"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      </span>
      {!compact && (
        <div className="flex flex-col">
          <span
            className={
              tone === 'light'
                ? 'text-xl font-extrabold tracking-tight text-white transition-colors'
                : 'text-xl font-extrabold tracking-tight text-slate-900 transition-colors group-hover:text-emerald-950'
            }
          >
            CallWave<span className={tone === 'light' ? 'text-emerald-300' : 'text-emerald-500'}>.</span>
          </span>
        </div>
      )}
    </Link>
  )
}
