import { useEffect, useRef, useState } from 'react'
import type { FormEvent, MouseEvent } from 'react'
import { CalendarIcon, CloseIcon, PipelineIcon, PlusIcon } from './DashboardIcons'
import { DEAL_OWNERS, DEAL_STAGES, formatCompactCurrency } from './crmData'
import type { DealPriority, DealSource, DealStage } from './crmData'

export type NewDealInput = {
  name: string
  company: string
  contactName: string
  email: string
  phone: string
  value: number
  stage: DealStage
  priority: DealPriority
  owner: string
  source: DealSource
  closeDate: string
  nextStep: string
  notes: string
}

type NewDealModalProps = {
  onClose: () => void
  onCreate: (deal: NewDealInput) => void
}

const PRIORITIES: DealPriority[] = ['High', 'Medium', 'Low']

const SOURCES: DealSource[] = [
  'Manual',
  'AI Voice Call',
  'WhatsApp Inbound',
  'Campaign',
  'Website',
  'Referral',
]

type FormState = {
  name: string
  company: string
  contactName: string
  email: string
  phone: string
  value: string
  stage: DealStage
  priority: DealPriority
  owner: string
  source: DealSource
  closeDate: string
  nextStep: string
  notes: string
}

function defaultCloseDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + 30)
  return date.toISOString().slice(0, 10)
}

const fieldClass =
  'w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-slate-900 placeholder:text-slate-400'

export function NewDealModal({ onClose, onCreate }: NewDealModalProps) {
  const [form, setForm] = useState<FormState>(() => ({
    name: '',
    company: '',
    contactName: '',
    email: '',
    phone: '',
    value: '',
    stage: 'New',
    priority: 'Medium',
    owner: DEAL_OWNERS[0],
    source: 'Manual',
    closeDate: defaultCloseDate(),
    nextStep: '',
    notes: '',
  }))
  const [error, setError] = useState<string | null>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

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

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError(null)
  }

  function handleOverlayClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose()
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (form.name.trim().length < 3) {
      setError('Give the deal a clear title to continue.')
      nameInputRef.current?.focus()
      return
    }
    if (!form.company.trim() || !form.contactName.trim()) {
      setError('Company and contact name are required.')
      return
    }

    const value = Number(form.value)
    if (!Number.isFinite(value) || value <= 0) {
      setError('Enter a deal value greater than zero.')
      return
    }

    onCreate({
      name: form.name.trim(),
      company: form.company.trim(),
      contactName: form.contactName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      value,
      stage: form.stage,
      priority: form.priority,
      owner: form.owner,
      source: form.source,
      closeDate: form.closeDate || defaultCloseDate(),
      nextStep: form.nextStep.trim(),
      notes: form.notes.trim(),
    })
  }

  const previewValue = Number(form.value)
  const hasPreviewValue = Number.isFinite(previewValue) && previewValue > 0

  return (
    <div className="modal-overlay" onMouseDown={handleOverlayClick}>
      <section
        className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 p-5 sm:p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-deal-title"
      >
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-gradient-to-br from-emerald-400/15 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-600 flex items-center justify-center shadow-2xs">
              <PipelineIcon className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 inline-block">
                New Deal
              </span>
              <h2
                id="new-deal-title"
                className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5"
              >
                Add to Revenue Pipeline
              </h2>
            </div>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            onClick={onClose}
            aria-label="Close new deal dialog"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        <form className="relative z-10 mt-4 space-y-3.5" onSubmit={handleSubmit} noValidate>
          {error && (
            <p className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="deal-name">
              Deal title <span className="text-rose-500">*</span>
            </label>
            <input
              ref={nameInputRef}
              id="deal-name"
              type="text"
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
              placeholder="e.g. Enterprise AI Agent Rollout"
              maxLength={80}
              className={fieldClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="deal-company">
                Company <span className="text-rose-500">*</span>
              </label>
              <input
                id="deal-company"
                type="text"
                value={form.company}
                onChange={(event) => update('company', event.target.value)}
                placeholder="Acme Cloud Studios"
                className={fieldClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="deal-contact">
                Contact name <span className="text-rose-500">*</span>
              </label>
              <input
                id="deal-contact"
                type="text"
                value={form.contactName}
                onChange={(event) => update('contactName', event.target.value)}
                placeholder="Rahul Mehta"
                className={fieldClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="deal-email">
                Email
              </label>
              <input
                id="deal-email"
                type="email"
                value={form.email}
                onChange={(event) => update('email', event.target.value)}
                placeholder="rahul@acmecloud.io"
                className={fieldClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="deal-phone">
                Phone
              </label>
              <input
                id="deal-phone"
                type="tel"
                value={form.phone}
                onChange={(event) => update('phone', event.target.value)}
                placeholder="+1 (555) 000-0000"
                className={fieldClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="deal-value">
                Deal value (USD) <span className="text-rose-500">*</span>
              </label>
              <input
                id="deal-value"
                type="number"
                min="0"
                step="500"
                value={form.value}
                onChange={(event) => update('value', event.target.value)}
                placeholder="48000"
                className={fieldClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="deal-close">
                Expected close
              </label>
              <input
                id="deal-close"
                type="date"
                value={form.closeDate}
                onChange={(event) => update('closeDate', event.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="deal-stage">
                Stage
              </label>
              <select
                id="deal-stage"
                value={form.stage}
                onChange={(event) => update('stage', event.target.value as DealStage)}
                className={fieldClass}
              >
                {DEAL_STAGES.filter((stage) => stage.id !== 'Won' && stage.id !== 'Lost').map(
                  (stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.label}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="deal-priority">
                Priority
              </label>
              <select
                id="deal-priority"
                value={form.priority}
                onChange={(event) => update('priority', event.target.value as DealPriority)}
                className={fieldClass}
              >
                {PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="deal-owner">
                Deal owner
              </label>
              <select
                id="deal-owner"
                value={form.owner}
                onChange={(event) => update('owner', event.target.value)}
                className={fieldClass}
              >
                {DEAL_OWNERS.map((owner) => (
                  <option key={owner} value={owner}>
                    {owner}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="deal-source">
                Source
              </label>
              <select
                id="deal-source"
                value={form.source}
                onChange={(event) => update('source', event.target.value as DealSource)}
                className={fieldClass}
              >
                {SOURCES.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="deal-next-step">
              Next step
            </label>
            <input
              id="deal-next-step"
              type="text"
              value={form.nextStep}
              onChange={(event) => update('nextStep', event.target.value)}
              placeholder="e.g. Send the revised proposal and book a follow-up"
              className={fieldClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="deal-notes">
              Notes
            </label>
            <textarea
              id="deal-notes"
              rows={2}
              value={form.notes}
              onChange={(event) => update('notes', event.target.value)}
              placeholder="Context, buying signals, or internal notes…"
              className={`${fieldClass} resize-none`}
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
              <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
              {hasPreviewValue
                ? `${formatCompactCurrency(previewValue)} · ${form.stage} stage`
                : 'Deal value unlocks revenue forecasting'}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <PlusIcon className="w-4 h-4" />
                Create deal
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  )
}
