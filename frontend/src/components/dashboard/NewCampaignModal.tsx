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
  'Hi {{first_name}}, I wanted to personally invite you to see our new collection. Is this a good time for a quick call?'

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
        className="campaign-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="campaign-modal-title"
      >
        <div className="campaign-modal__head">
          <span className="campaign-modal__icon">
            <MegaphoneIcon />
          </span>
          <button type="button" className="campaign-modal__close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        <div className="campaign-modal__heading">
          <span className="campaign-modal__kicker">New calling campaign</span>
          <h2 id="campaign-modal-title">Launch something worth answering.</h2>
          <p>Set the audience, let AI add the personal touch, and you are ready to call.</p>
        </div>

        <form className="campaign-form" onSubmit={handleSubmit} noValidate>
          <div className="campaign-form__grid">
            <label className="modal-field">
              <span>Campaign name</span>
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value)
                  setError(null)
                }}
                placeholder="e.g. October win-back"
                maxLength={60}
              />
            </label>

            <label className="modal-field">
              <span>Contact audience</span>
              <select
                value={audienceId}
                onChange={(event) => setAudienceId(event.target.value)}
              >
                {AUDIENCES.map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.label} · {item.detail}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="campaign-form__audience">
            <span>
              <CalendarIcon />
              Start calling immediately
            </span>
            <strong>{audience.contacts.toLocaleString('en-US')} contacts</strong>
          </div>

          <div className="ai-toggle-row">
            <span className="ai-toggle-row__icon">
              <SparkIcon />
            </span>
            <span className="ai-toggle-row__copy">
              <strong>AI personalization</strong>
              <small>Write a unique opening line for every contact.</small>
            </span>
            <button
              type="button"
              className={`ai-toggle${aiPersonalization ? ' is-on' : ''}`}
              role="switch"
              aria-checked={aiPersonalization}
              aria-label="Enable AI personalization"
              onClick={() => setAiPersonalization((enabled) => !enabled)}
            >
              <span />
            </button>
          </div>

          <label className="modal-field modal-field--message">
            <span>Call script</span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={3}
              maxLength={420}
              placeholder="Write a short opening message…"
            />
            <small>
              <SparkIcon />
              AI will personalize <code>{'{{first_name}}'}</code> for every contact.
            </small>
          </label>

          {error && (
            <p className="campaign-form__error" role="alert">
              {error}
            </p>
          )}

          <div className="campaign-modal__actions">
            <button type="button" className="dash-button dash-button--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="dash-button dash-button--primary">
              Create campaign
              <ArrowRightIcon />
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
