import { useState } from 'react'
import { CheckCircleIcon, CloseIcon } from './DashboardIcons'
import { ShieldCheckIcon, SparkIcon } from '../icons'

type RechargeCreditsModalProps = {
  onClose: () => void
  onComplete: (message: string) => void
}

type Pack = {
  id: string
  credits: string
  price: string
  perCredit: string
  tag?: string
  popular?: boolean
}

const PACKS: Pack[] = [
  { id: 'starter', credits: '5,000', price: '$49', perCredit: '$0.0098 / credit' },
  { id: 'growth', credits: '20,000', price: '$159', perCredit: '$0.0079 / credit', tag: 'Save 20%', popular: true },
  { id: 'scale', credits: '50,000', price: '$349', perCredit: '$0.0069 / credit', tag: 'Save 30%' },
]

export function RechargeCreditsModal({ onClose, onComplete }: RechargeCreditsModalProps) {
  const [selectedPack, setSelectedPack] = useState('growth')
  const [autoTopUp, setAutoTopUp] = useState(true)

  function handleRecharge() {
    const pack = PACKS.find((item) => item.id === selectedPack)
    onClose()
    onComplete(`${pack?.credits ?? ''} template credits added to your workspace`)
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 p-5 sm:p-6 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recharge-credits-title"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
              <SparkIcon className="w-5 h-5" />
            </span>
            <div>
              <h2 id="recharge-credits-title" className="text-base font-extrabold text-slate-900 tracking-tight">
                Recharge template credits
              </h2>
              <p className="text-[11px] text-slate-500">
                Credits are shared across every WhatsApp sender in this workspace.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {PACKS.map((pack) => {
            const active = pack.id === selectedPack
            return (
              <button
                key={pack.id}
                type="button"
                onClick={() => setSelectedPack(pack.id)}
                className={`relative text-left p-3 rounded-2xl border transition-all cursor-pointer ${active
                    ? 'border-emerald-500 bg-emerald-50/60 ring-4 ring-emerald-500/10'
                    : 'border-slate-200 bg-white hover:border-emerald-300'
                  }`}
              >
                {pack.tag && (
                  <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[9px] font-extrabold">
                    {pack.tag}
                  </span>
                )}
                <strong className="block text-lg font-extrabold text-slate-900 tabular-nums">
                  {pack.credits}
                </strong>
                <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  credits
                </span>
                <span className="mt-2 block text-sm font-bold text-slate-900">{pack.price}</span>
                <span className="block text-[10px] text-slate-500">{pack.perCredit}</span>
                {active && (
                  <CheckCircleIcon className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 text-emerald-600" />
                )}
              </button>
            )
          })}
        </div>

        <label className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 px-3.5 py-2.5 cursor-pointer">
          <span>
            <strong className="block text-xs font-bold text-slate-800">Auto top-up</strong>
            <span className="block text-[10.5px] text-slate-500">
              Recharge automatically when the pool drops below 15%.
            </span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={autoTopUp}
            onClick={() => setAutoTopUp((current) => !current)}
            className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${autoTopUp ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${autoTopUp ? 'translate-x-4' : ''
                }`}
            />
          </button>
        </label>

        <div className="mt-4 rounded-2xl border border-emerald-200/70 bg-emerald-50/60 px-3.5 py-2.5 flex items-start gap-2">
          <ShieldCheckIcon className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-emerald-900/80 leading-relaxed">
            Secure checkout via Stripe. Unused credits never expire and are shared across all
            connected senders.
          </p>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleRecharge}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all"
          >
            Recharge {PACKS.find((pack) => pack.id === selectedPack)?.price}
          </button>
        </div>
      </div>
    </div>
  )
}
