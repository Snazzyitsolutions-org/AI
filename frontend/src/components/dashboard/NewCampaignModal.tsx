import { useEffect, useRef, useState } from 'react'
import type { FormEvent, MouseEvent } from 'react'
import { ArrowRightIcon, SparkIcon } from '../icons'
import { AUDIENCES } from './campaignData'
import type { Audience } from './campaignData'
import { CalendarIcon, CloseIcon, MegaphoneIcon } from './DashboardIcons'

export type NewCampaignInput = {
  name: string
  audience: Audience
  aiPersonalization: boolean
  message: string
}

type NewCampaignModalProps = {
  onClose: () => void
  onCreate: (campaign: NewCampaignInput) => void
}

const DEFAULT_MESSAGE =
  'Hi {{first_name}}, I wanted to personally share our new collection and exclusive offer with you. Can I send you the catalog on WhatsApp?'

export function NewCampaignModal({ onClose, onCreate }: NewCampaignModalProps) {
  const [name, setName] = useState('')
  const [audienceId, setAudienceId] = useState(AUDIENCES[0].id)
  const [aiPersonalization, setAiPersonalization] = useState(true)
  const [message, setMessage] = useState(DEFAULT_MESSAGE)
  const [error, setError] = useState<string | null>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  const audience = AUDIENCES.find((item) => item.id === audienceId) ?? AUDIENCES[0]

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    const focusTimer = window.setTimeout(() => nameInputRef.current?.focus(), 80)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      window.clearTimeout(focusTimer)
    }
  }, [onClose])

  function handleOverlayClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose()
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (name.trim().length < 2) {
      setError('Give your campaign a name to continue.')
      nameInputRef.current?.focus()
      return
    }

    onCreate({
      name: name.trim(),
      audience,
      aiPersonalization,
      message: message.trim(),
    })
  }

  return (
    <div className="modal-overlay" onMouseDown={handleOverlayClick}>
      <section
        className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 p-5 sm:p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="campaign-modal-title"
      >
        {/* Soft Ambient Radial Mesh Accent */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-gradient-to-br from-emerald-400/15 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-600 flex items-center justify-center shadow-2xs">
              <MegaphoneIcon className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 inline-block">
                New Campaign
              </span>
              <h2 id="campaign-modal-title" className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                Launch WhatsApp Broadcast
              </h2>
            </div>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            onClick={onClose}
            aria-label="Close"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        <form className="relative z-10 mt-4 space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Campaign Name
              </label>
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value)
                  setError(null)
                }}
                placeholder="e.g. Q4 WhatsApp Enterprise Win-Back"
                maxLength={60}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Audience Cohort
              </label>
              <select
                value={audienceId}
                onChange={(event) => setAudienceId(event.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-slate-900"
              >
                {AUDIENCES.map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.label} · {item.detail} ({item.contacts.toLocaleString()} contacts)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-xs text-emerald-900">
            <span className="flex items-center gap-1.5 font-medium">
              <CalendarIcon className="w-3.5 h-3.5 text-emerald-600" />
              Immediate low-latency broadcast
            </span>
            <strong className="font-bold">{audience.contacts.toLocaleString('en-US')} contacts</strong>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center">
                <SparkIcon className="w-4 h-4" />
              </span>
              <div>
                <strong className="block text-xs font-bold text-slate-900">AI Personalization Engine</strong>
                <small className="text-[11px] text-slate-500">Synthesizes bespoke opening line per contact</small>
              </div>
            </div>
            <button
              type="button"
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                aiPersonalization ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
              role="switch"
              aria-checked={aiPersonalization}
              aria-label="Enable AI personalization"
              onClick={() => setAiPersonalization((enabled) => !enabled)}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                  aiPersonalization ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              WhatsApp Template Message
            </label>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={3}
              maxLength={420}
              placeholder="Write a short WhatsApp broadcast message…"
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-slate-900 resize-none font-mono"
            />
            <small className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
              <SparkIcon className="w-3 h-3 text-emerald-600" />
              AI dynamically resolves <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-700 font-semibold">{'{{first_name}}'}</code> &amp; variables.
            </small>
          </div>

          {error && (
            <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200/80 p-2.5 rounded-xl" role="alert">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Create Campaign</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
