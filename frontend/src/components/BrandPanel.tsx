import { BrandMark } from './BrandMark'
import { CheckIcon, PhoneIcon, ShieldCheckIcon } from './icons'

const WAVEFORM_HEIGHTS = [8, 15, 11, 21, 16, 25, 13, 19, 9]

export function BrandPanel() {
  return (
    <section
      className="relative hidden overflow-hidden bg-gradient-to-br from-[#052f24] via-[#064936] to-[#0c6b50] p-9 text-white lg:flex lg:flex-col xl:p-11"
      aria-label="About CallWave"
    >
      {/* Glow + flowing lines */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-emerald-400/15 blur-3xl" />
        <svg
          viewBox="0 0 600 780"
          fill="none"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full opacity-[0.13]"
        >
          <path
            d="M-40 170C80 60 150 260 290 150S500 30 660 170"
            stroke="white"
            strokeWidth="1.2"
          />
          <path
            d="M-60 250C90 130 190 330 330 210S530 100 680 240"
            stroke="white"
            strokeWidth="1"
          />
          <path
            d="M-50 620C90 480 210 720 360 570S560 440 680 600"
            stroke="white"
            strokeWidth="1.2"
          />
          <path
            d="M-30 700C120 560 230 790 400 640S610 520 700 660"
            stroke="white"
            strokeWidth="1"
          />
        </svg>
        <div className="absolute right-10 top-1/3 h-64 w-64 rounded-full border border-white/[0.07]" />
        <div className="absolute right-24 top-1/2 h-44 w-44 rounded-full border border-white/[0.05]" />
      </div>

      <div className="relative">
        <BrandMark tone="light" />
      </div>

      <div className="relative mt-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.18em] text-emerald-50/90 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
          Conversations, made simple
        </span>

        <h1 className="mt-6 text-[38px] font-extrabold leading-[1.06] tracking-tight xl:text-[43px]">
          Every great
          <br />
          conversation
          <br />
          <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-lime-200 bg-clip-text text-transparent">
            starts here.
          </span>
        </h1>

        <p className="mt-4 max-w-[21rem] text-[13px] leading-relaxed text-emerald-50/70 xl:text-sm">
          One secure account for clear calls, closer teams, and conversations that feel
          effortless.
        </p>

        <ul className="mt-6 space-y-3 text-[12px] text-emerald-50/85">
          <li className="flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-emerald-200">
              <ShieldCheckIcon className="h-3.5 w-3.5" />
            </span>
            Private by design, secure by default
          </li>
          <li className="flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-emerald-200">
              <CheckIcon className="h-3.5 w-3.5" />
            </span>
            One account for every conversation
          </li>
        </ul>
      </div>

      <div className="relative mt-auto pt-8" aria-hidden="true">
        <div className="rounded-[16px] border border-white/15 bg-white/[0.09] p-4 shadow-[0_20px_40px_-24px_rgba(0,0,0,0.6)] backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-[10px] font-semibold text-emerald-100">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300" />
              </span>
              Incoming call
            </span>
            <span className="font-mono text-[10px] tabular-nums text-emerald-100/50">00:24</span>
          </div>

          <div className="mt-3.5 flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-200 to-teal-400 text-[11px] font-extrabold text-emerald-950 ring-2 ring-white/20">
              MK
            </span>
            <div className="min-w-0 flex-1">
              <strong className="block truncate text-[12px] font-bold text-white">
                Maya Kapoor
              </strong>
              <span className="block truncate text-[10px] text-emerald-100/55">
                Weekly product huddle
              </span>
            </div>
            <span className="hidden items-end gap-[3px] sm:flex">
              {WAVEFORM_HEIGHTS.map((height, index) => (
                <span
                  key={index}
                  className="w-[3px] rounded-full bg-emerald-300/60"
                  style={{ height }}
                />
              ))}
            </span>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-emerald-950 shadow-lg shadow-emerald-400/30">
              <PhoneIcon className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>

        <div className="mt-3 inline-flex items-center gap-2.5 rounded-[12px] border border-white/10 bg-emerald-950/40 px-3.5 py-2.5 backdrop-blur-sm">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
            <ShieldCheckIcon className="h-3.5 w-3.5" />
          </span>
          <span className="text-[10px] leading-tight">
            <strong className="block font-semibold text-white">Secure connection</strong>
            <small className="text-emerald-100/50">Your details stay protected</small>
          </span>
        </div>
      </div>
    </section>
  )
}
