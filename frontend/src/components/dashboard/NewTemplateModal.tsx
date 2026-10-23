import { useEffect, useRef, useState } from 'react'
import type { FormEvent, MouseEvent } from 'react'
import { SparkIcon } from '../icons'
import {
  CloseIcon,
  FileTextIcon,
  ImageIcon,
  PlusIcon,
  QuickReplyIcon,
  SendIcon,
  TemplateIcon,
  TrashIcon,
  VideoIcon,
  WhatsAppIcon,
} from './DashboardIcons'
import { TemplateMessagePreview } from './TemplateMessagePreview'
import {
  TEMPLATE_CATEGORIES,
  TEMPLATE_HEADER_TYPES,
  TEMPLATE_LANGUAGES,
  extractVariableNumbers,
} from './templateData'
import type {
  TemplateButton,
  TemplateButtonType,
  TemplateCategory,
  TemplateDraftInput,
  TemplateFormInitial,
  TemplateHeaderType,
} from './templateData'

type NewTemplateModalProps = {
  mode: 'create' | 'edit'
  initial?: TemplateFormInitial
  onClose: () => void
  onSave: (input: TemplateDraftInput) => void
}

const MAX_BODY = 1024
const MAX_HEADER = 60
const MAX_FOOTER = 60
const MAX_BUTTONS = 3

const DEFAULT_BODY =
  'Hi {{1}}, thank you for choosing CallWave! We have something special for you: {{2}}.'

const DEFAULT_SAMPLES: Record<string, string> = {
  '1': 'Aarav',
  '2': '20% off',
  '3': 'SAVE20',
  '4': 'Sunday, 8 PM',
}

const AI_DRAFTS: Record<
  TemplateCategory,
  {
    headerType: TemplateHeaderType
    headerText: string
    body: string
    footer: string
    buttons: TemplateButton[]
  }[]
> = {
  Marketing: [
    {
      headerType: 'text',
      headerText: 'A little something for you',
      body: 'Hi {{1}}, we saved a special offer just for you — {{2}} off your next order. Use code {{3}} before {{4}}.',
      footer: 'CallWave Store · Reply STOP to opt out',
      buttons: [{ type: 'url', label: 'Claim my offer', value: 'https://example.com/offer' }],
    },
    {
      headerType: 'image',
      headerText: '',
      body: '{{1}}, our newest collection just landed and we think you will love it. Explore {{2}} fresh arrivals before they sell out.',
      footer: 'New season · Limited stock',
      buttons: [{ type: 'url', label: 'Shop the collection', value: 'https://example.com/new' }],
    },
    {
      headerType: 'none',
      headerText: '',
      body: 'We miss you, {{1}}! Come back and enjoy {{2}} off with code {{3}}. Your offer is valid until {{4}}.',
      footer: 'One use per customer',
      buttons: [
        { type: 'quick-reply', label: 'Unlock my offer' },
        { type: 'quick-reply', label: 'Not now' },
      ],
    },
  ],
  Utility: [
    {
      headerType: 'text',
      headerText: 'Order confirmed',
      body: 'Hi {{1}}, your order {{2}} is confirmed. We will notify you as soon as it ships. Order total: {{3}}.',
      footer: 'Questions? Just reply to this message.',
      buttons: [{ type: 'quick-reply', label: 'Track my order' }],
    },
    {
      headerType: 'none',
      headerText: '',
      body: 'Hi {{1}}, this is a reminder for your appointment on {{2}} at {{3}}. Reply RESCHEDULE if you need a different time.',
      footer: 'CallWave Clinic · 24-hour cancellation',
      buttons: [
        { type: 'quick-reply', label: 'Confirm' },
        { type: 'quick-reply', label: 'Reschedule' },
      ],
    },
    {
      headerType: 'none',
      headerText: '',
      body: 'Good news {{1}}! Your order {{2}} has shipped and will arrive by {{3}}. You can track every step below.',
      footer: 'CallWave Logistics',
      buttons: [{ type: 'url', label: 'Track shipment', value: 'https://example.com/track' }],
    },
  ],
  Authentication: [
    {
      headerType: 'none',
      headerText: '',
      body: '{{1}} is your CallWave verification code. It expires in {{2}} minutes. Never share this code with anyone.',
      footer: 'If you did not request this code, please ignore this message.',
      buttons: [],
    },
    {
      headerType: 'none',
      headerText: '',
      body: 'Use code {{1}} to confirm your order {{2}}. This code is valid for {{3}} minutes.',
      footer: 'Do not share this code with anyone.',
      buttons: [],
    },
  ],
}

function nextVariableNumber(headerText: string, body: string) {
  const numbers = extractVariableNumbers(headerText, body).map(Number)
  return numbers.length > 0 ? Math.max(...numbers) + 1 : 1
}

export function NewTemplateModal({ mode, initial, onClose, onSave }: NewTemplateModalProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState<TemplateCategory>(initial?.category ?? 'Marketing')
  const [language, setLanguage] = useState(initial?.language ?? 'en_US')
  const [headerType, setHeaderType] = useState<TemplateHeaderType>(initial?.headerType ?? 'none')
  const [headerText, setHeaderText] = useState(initial?.headerText ?? '')
  const [body, setBody] = useState(initial?.body ?? DEFAULT_BODY)
  const [footer, setFooter] = useState(initial?.footer ?? '')
  const [buttons, setButtons] = useState<TemplateButton[]>(
    initial?.buttons?.map((button) => ({ ...button })) ?? [],
  )
  const [submitForReview, setSubmitForReview] = useState(initial?.submitForReview ?? true)
  const [samples, setSamples] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  const nameInputRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  const variables = extractVariableNumbers(headerText, body)

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

  function handleNameChange(value: string) {
    setName(
      value
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .slice(0, 64),
    )
    setError(null)
  }

  function insertVariable() {
    const next = nextVariableNumber(headerText, body)
    const token = `{{${next}}}`
    const textarea = bodyRef.current
    const start = textarea?.selectionStart ?? body.length
    const end = textarea?.selectionEnd ?? body.length
    const nextBody = `${body.slice(0, start)}${token}${body.slice(end)}`

    setBody(nextBody)

    window.requestAnimationFrame(() => {
      const node = bodyRef.current
      if (!node) return
      node.focus()
      const position = start + token.length
      node.setSelectionRange(position, position)
    })
  }

  function applyAiDraft() {
    const drafts = AI_DRAFTS[category]
    const draft = drafts[Math.floor(Math.random() * drafts.length)]

    setHeaderType(draft.headerType)
    setHeaderText(draft.headerText)
    setBody(draft.body)
    setFooter(draft.footer)
    setButtons(draft.buttons.map((button) => ({ ...button })))
    setError(null)
  }

  function addButton() {
    if (buttons.length >= MAX_BUTTONS) return
    setButtons((current) => [...current, { type: 'quick-reply', label: '', value: '' }])
  }

  function updateButton(index: number, patch: Partial<TemplateButton>) {
    setButtons((current) =>
      current.map((button, buttonIndex) =>
        buttonIndex === index ? { ...button, ...patch } : button,
      ),
    )
  }

  function changeButtonType(index: number, type: TemplateButtonType) {
    updateButton(index, { type, value: type === 'quick-reply' ? '' : buttons[index].value ?? '' })
  }

  function removeButton(index: number) {
    setButtons((current) => current.filter((_, buttonIndex) => buttonIndex !== index))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const cleanName = name.trim()
    const cleanBody = body.trim()
    const cleanHeader = headerText.trim()
    const cleanFooter = footer.trim()

    if (cleanName.length < 3) {
      setError('Give your template a name with at least 3 characters.')
      nameInputRef.current?.focus()
      return
    }

    if (!/^[a-z0-9_]+$/.test(cleanName)) {
      setError('Template names can only use lowercase letters, numbers and underscores.')
      nameInputRef.current?.focus()
      return
    }

    if (headerType === 'text' && !cleanHeader) {
      setError('Add the text that should appear in the template header.')
      return
    }

    if (cleanBody.length < 10) {
      setError('Write a message body with at least 10 characters.')
      bodyRef.current?.focus()
      return
    }

    const incompleteButton = buttons.find((button) => !button.label.trim())
    if (incompleteButton) {
      setError('Every button needs a label, or remove the empty button.')
      return
    }

    const missingValue = buttons.find(
      (button) => button.type !== 'quick-reply' && !button.value?.trim(),
    )
    if (missingValue) {
      setError(
        missingValue.type === 'url'
          ? 'Add a website URL for every URL button.'
          : 'Add a phone number for every call button.',
      )
      return
    }

    const invalidUrl = buttons.find(
      (button) =>
        button.type === 'url' && !/^https?:\/\/\S+/i.test(button.value?.trim() ?? ''),
    )
    if (invalidUrl) {
      setError('Website URLs must start with http:// or https://.')
      return
    }

    onSave({
      name: cleanName,
      category,
      language,
      headerType,
      headerText: headerType === 'text' ? cleanHeader : '',
      body: cleanBody,
      footer: cleanFooter,
      buttons: buttons.map((button) => ({
        ...button,
        label: button.label.trim(),
        value: button.type === 'quick-reply' ? undefined : button.value?.trim(),
      })),
      submitForReview,
    })
  }

  const mediaHint =
    headerType === 'image'
      ? 'Attach a JPG or PNG up to 5 MB when sending. Recommended 1.91:1 ratio.'
      : headerType === 'video'
        ? 'Attach an MP4 up to 16 MB when sending. Keep it under 60 seconds.'
        : 'Attach a PDF up to 100 MB when sending this template.'

  return (
    <div className="modal-overlay" onMouseDown={handleOverlayClick}>
      <section
        className="relative w-full max-w-5xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 p-5 sm:p-6 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-editor-title"
      >
        {/* Soft Ambient Radial Mesh Accent */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-gradient-to-br from-emerald-400/15 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Modal Head */}
        <div className="relative z-10 flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-600 flex items-center justify-center shadow-2xs">
              <TemplateIcon className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 inline-block">
                WhatsApp Template Studio
              </span>
              <h2 id="template-editor-title" className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                {mode === 'edit' ? 'Edit Your WhatsApp Template' : 'Create a WhatsApp Template'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            onClick={onClose}
            aria-label="Close template editor"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body - 2 Column Layout with Live Preview */}
        <form className="relative z-10 mt-4 overflow-y-auto flex-1 flex flex-col justify-between" onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pr-1">
            {/* Left: Input Fields */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Template Name
                  </label>
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={name}
                    onChange={(event) => handleNameChange(event.target.value)}
                    placeholder="e.g. festive_sale_2026"
                    maxLength={64}
                    spellCheck={false}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-slate-900 font-mono transition-all"
                  />
                  <small className="text-[10px] text-slate-400 mt-1 block">
                    Lowercase letters, numbers, and underscores only.
                  </small>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(event) => {
                      setCategory(event.target.value as TemplateCategory)
                      setError(null)
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none text-slate-900 transition-all cursor-pointer font-medium"
                  >
                    {TEMPLATE_CATEGORIES.map((item) => (
                      <option value={item} key={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <small className="text-[10px] text-slate-400 mt-1 block">
                    {category === 'Marketing'
                      ? 'Offers, launches and re-engagement.'
                      : category === 'Utility'
                        ? 'Orders, payments and appointments.'
                        : 'One-time passwords and verification.'}
                  </small>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none text-slate-900 transition-all cursor-pointer font-medium"
                  >
                    {TEMPLATE_LANGUAGES.map((item) => (
                      <option value={item.code} key={item.code}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Header Type
                  </label>
                  <select
                    value={headerType}
                    onChange={(event) => {
                      const next = event.target.value as TemplateHeaderType
                      setHeaderType(next)
                      if (next !== 'text') setHeaderText('')
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none text-slate-900 transition-all cursor-pointer font-medium"
                  >
                    {TEMPLATE_HEADER_TYPES.map((item) => (
                      <option value={item.value} key={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {headerType === 'text' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Header Text</label>
                    <small className="text-[10px] text-slate-400">{headerText.length}/{MAX_HEADER}</small>
                  </div>
                  <input
                    type="text"
                    value={headerText}
                    onChange={(event) => setHeaderText(event.target.value.slice(0, MAX_HEADER))}
                    placeholder="A short, bold headline"
                    maxLength={MAX_HEADER}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none text-slate-900 transition-all"
                  />
                </div>
              )}

              {headerType !== 'none' && headerType !== 'text' && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-xs text-slate-600">
                  {headerType === 'image' ? (
                    <ImageIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : headerType === 'video' ? (
                    <VideoIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <FileTextIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  )}
                  <span className="text-[11px]">{mediaHint}</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Message Body</label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={insertVariable}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <PlusIcon className="w-3 h-3 text-emerald-600" />
                      <span>Variable</span>
                    </button>
                    <button
                      type="button"
                      onClick={applyAiDraft}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-semibold border border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <SparkIcon className="w-3 h-3 text-emerald-600" />
                      <span>AI Draft</span>
                    </button>
                  </div>
                </div>
                <textarea
                  ref={bodyRef}
                  value={body}
                  onChange={(event) => {
                    setBody(event.target.value.slice(0, MAX_BODY))
                    setError(null)
                  }}
                  rows={4}
                  maxLength={MAX_BODY}
                  placeholder="Write the message customers will receive…"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-slate-900 transition-all font-mono resize-none"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span>Use {'{{1}}'}, {'{{2}}'} for personalization. Meta requires sample values.</span>
                  <span>{body.length}/{MAX_BODY}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Footer Text (Optional)</label>
                  <small className="text-[10px] text-slate-400">{footer.length}/{MAX_FOOTER}</small>
                </div>
                <input
                  type="text"
                  value={footer}
                  onChange={(event) => setFooter(event.target.value.slice(0, MAX_FOOTER))}
                  placeholder="e.g. Reply STOP to opt out"
                  maxLength={MAX_FOOTER}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none text-slate-900 transition-all"
                />
              </div>

              {/* Interactive Buttons */}
              <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="block text-xs font-bold text-slate-900">Interactive Buttons</strong>
                    <small className="text-[10px] text-slate-500">Add up to {MAX_BUTTONS} quick replies or URL links.</small>
                  </div>
                  <button
                    type="button"
                    onClick={addButton}
                    disabled={buttons.length >= MAX_BUTTONS}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <PlusIcon className="w-3 h-3 text-emerald-600" />
                    <span>Add Button</span>
                  </button>
                </div>

                {buttons.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">
                    No buttons yet. Buttons make it easier for customers to reply with 1 tap.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {buttons.map((button, index) => (
                      <div key={index} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
                        <select
                          value={button.type}
                          onChange={(e) => changeButtonType(index, e.target.value as TemplateButtonType)}
                          className="px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700 cursor-pointer font-medium"
                        >
                          <option value="quick-reply">Quick reply</option>
                          <option value="url">Website</option>
                          <option value="phone">Call</option>
                        </select>

                        <input
                          type="text"
                          value={button.label}
                          onChange={(e) => updateButton(index, { label: e.target.value.slice(0, 25) })}
                          placeholder="Button label"
                          maxLength={25}
                          className="flex-1 px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-900"
                        />

                        {button.type !== 'quick-reply' && (
                          <input
                            type="text"
                            value={button.value ?? ''}
                            onChange={(e) => updateButton(index, { value: e.target.value })}
                            placeholder={button.type === 'url' ? 'https://example.com' : '+14155550132'}
                            className="flex-1 px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-900"
                          />
                        )}

                        <button
                          type="button"
                          onClick={() => removeButton(index)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          aria-label={`Remove button ${index + 1}`}
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit for Meta Review Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center">
                    <SendIcon className="w-4 h-4" />
                  </span>
                  <div>
                    <strong className="block text-xs font-bold text-slate-900">Submit for Meta Review</strong>
                    <small className="text-[11px] text-slate-500">Approved templates can be broadcasted immediately (≈ 24h review)</small>
                  </div>
                </div>
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    submitForReview ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                  role="switch"
                  aria-checked={submitForReview}
                  onClick={() => setSubmitForReview((current) => !current)}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                      submitForReview ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {error && (
                <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200/80 p-2.5 rounded-xl" role="alert">
                  {error}
                </p>
              )}
            </div>

            {/* Right: Live WhatsApp Phone Preview */}
            <aside className="lg:col-span-5 flex flex-col items-center bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80" aria-label="Live WhatsApp preview">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
                Live WhatsApp Preview
              </span>

              <div className="w-full max-w-[280px] rounded-3xl border-4 border-slate-800 bg-[#efeae2] shadow-xl overflow-hidden flex flex-col text-slate-900">
                <div className="bg-[#075e54] text-white px-3 py-1 flex items-center justify-between text-[10px] font-semibold">
                  <span>9:41</span>
                  <span>📶 🔋</span>
                </div>

                <div className="bg-[#075e54] text-white px-3 py-2 flex items-center gap-2 border-b border-[#054c44]">
                  <div className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    <WhatsAppIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <strong className="text-xs truncate">CallWave Official</strong>
                      <span className="text-emerald-300 text-[10px]">✓</span>
                    </div>
                    <small className="text-[9px] text-white/80 block leading-tight">Verified Business</small>
                  </div>
                </div>

                <div className="p-3 min-h-[260px] flex flex-col justify-end space-y-2 bg-[#efeae2]">
                  <div className="text-center">
                    <span className="px-2 py-0.5 rounded-md bg-white/70 text-slate-500 text-[9px] font-semibold shadow-2xs">
                      TODAY
                    </span>
                  </div>

                  <TemplateMessagePreview
                    headerType={headerType}
                    headerText={headerText}
                    body={body || 'Your message preview will appear here.'}
                    footer={footer}
                    buttons={buttons}
                    samples={samples}
                    compact
                  />
                </div>

                <div className="p-2 bg-[#f0f2f5] border-t border-slate-200 flex items-center gap-2 text-xs">
                  <span className="flex-1 px-3 py-1 bg-white rounded-full text-slate-400 text-[10px]">
                    Message
                  </span>
                  <div className="w-6 h-6 rounded-full bg-[#00a884] text-white flex items-center justify-center text-xs">
                    <SendIcon className="w-3 h-3" />
                  </div>
                </div>
              </div>

              {variables.length > 0 && (
                <div className="w-full mt-4 p-3 rounded-xl bg-white border border-slate-200/80 space-y-2">
                  <span className="block text-[11px] font-bold text-slate-700">Sample preview values</span>
                  <div className="grid grid-cols-2 gap-2">
                    {variables.map((variable) => (
                      <div key={variable} className="space-y-0.5">
                        <label className="text-[10px] font-mono text-emerald-800 font-bold">{`{{${variable}}}`}</label>
                        <input
                          type="text"
                          value={samples[variable] ?? ''}
                          placeholder={DEFAULT_SAMPLES[variable] ?? 'Sample'}
                          onChange={(e) =>
                            setSamples((current) => ({
                              ...current,
                              [variable]: e.target.value,
                            }))
                          }
                          className="w-full px-2 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded-md outline-none text-slate-900"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>

          {/* Footer Buttons */}
          <div className="relative z-10 pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-shrink-0">
            <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <QuickReplyIcon className="w-3.5 h-3.5 text-slate-400" />
              {mode === 'edit'
                ? 'Changes to approved templates may need a fresh review.'
                : 'You can keep this as a draft and submit it later.'}
            </span>

            <div className="flex items-center gap-2">
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
                <SendIcon className="w-3.5 h-3.5" />
                <span>{mode === 'edit' ? 'Save Changes' : 'Create Template'}</span>
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  )
}
