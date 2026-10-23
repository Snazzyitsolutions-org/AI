import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BrandMark } from './BrandMark'
import { BrandPanel } from './BrandPanel'

type AuthLayoutProps = {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#eef7f1] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(52,211,153,0.14),transparent_42%),radial-gradient(circle_at_88%_82%,rgba(20,184,166,0.16),transparent_44%)]" />
        <div className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-teal-200/30 blur-3xl" />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="absolute bottom-[18%] right-[7%] hidden h-6 w-6 text-emerald-400/60 lg:block"
        >
          <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="absolute left-[5%] top-[16%] hidden h-4 w-4 text-teal-400/50 lg:block"
        >
          <path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </div>

      <div className="relative grid w-full max-w-[1180px] overflow-hidden rounded-[26px] border border-white/80 bg-white shadow-[0_40px_100px_-45px_rgba(6,78,59,0.38),0_8px_24px_-12px_rgba(6,78,59,0.12)] lg:min-h-[720px] lg:grid-cols-[1.02fr_1fr]">
        <BrandPanel />

        <main className="relative flex flex-col justify-center bg-[#fbfdfc] px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12 xl:px-14">
          <Link
            to="/"
            aria-label="Back to workspace"
            className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-[#9aada2] transition-colors hover:bg-[#f0f7f3] hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 lg:right-6 lg:top-6"
          >
            <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
              <path
                d="m4 4 8 8m0-8-8 8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </Link>

          <div className="mb-8 flex justify-center lg:hidden">
            <BrandMark />
          </div>
          <div className="mx-auto w-full max-w-[420px]">{children}</div>
        </main>
      </div>

      <p className="relative mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-[11px] text-[#8da397]">
        <span>© {new Date().getFullYear()} CallWave</span>
        <span className="hidden h-1 w-1 rounded-full bg-[#c2d6c9] sm:block" aria-hidden="true" />
        <span>Clear conversations, simple connections.</span>
      </p>
    </div>
  )
}
