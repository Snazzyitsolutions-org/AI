import { useState } from 'react'

export interface WhatsAppTemplateItem {
  id: string
  name: string
  category: 'Booking' | 'Sales' | 'Utility' | 'Marketing' | 'Finance'
  language: string
  status: 'Approved' | 'Pending'
  headerText?: string
  body: string
  footerText?: string
  buttons?: string[]
}

const APPROVED_TEMPLATES: WhatsAppTemplateItem[] = [
  {
    id: 'tmpl_1',
    name: 'demo_walkthrough_invite',
    category: 'Booking',
    language: 'English (US)',
    status: 'Approved',
    headerText: '🚀 CallWave Live Platform Walkthrough',
    body: 'Hi {{name}}, thank you for your interest in CallWave WhatsApp Automation! We would love to host a personalized 15-minute live demo tailored for {{company}}. Tap a slot below or reply with your preferred time.',
    footerText: 'Official Meta WhatsApp Business Solution Provider',
    buttons: ['Tomorrow 3:00 PM', 'Thursday 11:30 AM', 'Custom Slot'],
  },
  {
    id: 'tmpl_2',
    name: 'enterprise_pricing_quote',
    category: 'Sales',
    language: 'English (US)',
    status: 'Approved',
    headerText: '💼 Custom Enterprise Volume Rates',
    body: 'Hello {{name}}, here is the custom volume pricing structure for {{company}}. Our tier-1 high-throughput broadcast starts at ₹1,499/mo per sender number with unlimited agents and AI auto-pilot included.',
    footerText: 'Valid for 14 days • SLA 99.98%',
    buttons: ['Schedule Pricing Call', 'Download Rate Card'],
  },
  {
    id: 'tmpl_3',
    name: 'whatsapp_campaign_followup',
    category: 'Marketing',
    language: 'English (US)',
    status: 'Approved',
    headerText: '✨ Quick Follow-up from CallWave',
    body: 'Hi {{name}}, just checking in regarding automated WhatsApp broadcasts for {{company}}. Did you have a chance to review our zero-ban Meta Cloud API specifications?',
    footerText: 'Reply STOP to opt out',
    buttons: ['Yes, let’s connect', 'Send brochure', 'Follow up next week'],
  },
  {
    id: 'tmpl_4',
    name: 'order_delivery_update',
    category: 'Utility',
    language: 'English (US)',
    status: 'Approved',
    headerText: '📦 Order Confirmation & Tracking',
    body: 'Dear {{name}}, your order #CW-89421 from CallWave for {{company}} has been confirmed and provisioned successfully. Your dedicated sender instance is active and ready for broadcasts.',
    footerText: 'CallWave Systems Pvt Ltd',
    buttons: ['Open Sender Console', 'Contact Support'],
  },
  {
    id: 'tmpl_5',
    name: 'vip_exclusive_offer',
    category: 'Marketing',
    language: 'English (US)',
    status: 'Approved',
    headerText: '🎉 Exclusive 25% Bonus Credits',
    body: 'Exclusive Meta Partner perk for {{name}}! Recharge your {{company}} broadcast wallet this week and enjoy an instant 25% credit bonus with zero platform maintenance fees.',
    footerText: 'Limited time festive offer • Terms apply',
    buttons: ['Claim 25% Bonus 🎁', 'Talk to Account Manager'],
  },
  {
    id: 'tmpl_6',
    name: 'payment_invoice_link',
    category: 'Finance',
    language: 'English (US)',
    status: 'Approved',
    headerText: '💳 Invoice Statement Ready',
    body: 'Hi {{name}}, invoice #INV-2026-104 for {{company}} services has been generated. Amount due: ₹12,500. You can review the itemized breakdown and pay securely below.',
    footerText: 'Automated billing reminder',
    buttons: ['Pay via UPI/Card 💳', 'Download Tax PDF'],
  },
]

interface TemplateSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  contactName: string
  companyName: string
  onSelectTemplate: (formattedText: string, buttons?: string[]) => void
  onSendDirectly: (formattedText: string, buttons?: string[]) => void
}

export function TemplateSelectorModal({
  isOpen,
  onClose,
  contactName,
  companyName,
  onSelectTemplate,
  onSendDirectly,
}: TemplateSelectorModalProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  if (!isOpen) return null

  const firstName = contactName.split(' ')[0] || 'there'
  const company = companyName || 'your company'

  const interpolate = (text: string) => {
    return text.replace(/{{name}}/g, firstName).replace(/{{company}}/g, company)
  }

  const categories = ['All', 'Booking', 'Sales', 'Marketing', 'Utility', 'Finance']

  const filtered = APPROVED_TEMPLATES.filter((t) => {
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory
    const matchesQuery =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.body.toLowerCase().includes(search.toLowerCase()) ||
      (t.headerText && t.headerText.toLowerCase().includes(search.toLowerCase()))
    return matchesCat && matchesQuery
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[85vh] text-slate-900 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="templates-modal-title"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center shadow-2xs">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="templates-modal-title" className="text-sm sm:text-base font-bold text-slate-900">
                  Meta Approved Templates
                </h3>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  Verified Meta API
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Variables auto-filled for <strong className="text-slate-800">{contactName}</strong> ({company})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 space-y-3 flex-shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-200 shadow-2xs focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
            <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search templates by keyword, category, or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-700 text-xs font-bold">
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-2xs'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Templates List */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1 min-h-0 bg-slate-50/30">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No matching WhatsApp templates found for "{search}".
            </div>
          ) : (
            filtered.map((t) => {
              const interpolatedBody = interpolate(t.body)

              return (
                <div
                  key={t.id}
                  className="p-4 bg-white border border-slate-200/90 hover:border-emerald-400 rounded-2xl transition-all space-y-3 shadow-2xs hover:shadow-xs group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {t.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                        {t.category}
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-semibold font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {t.status}
                    </span>
                  </div>

                  {/* WhatsApp Message Card Preview */}
                  <div className="p-3.5 bg-[#f0fbf5] rounded-xl border border-emerald-100 text-xs text-slate-800 leading-relaxed space-y-2 shadow-2xs">
                    {t.headerText && (
                      <div className="font-bold text-emerald-900 text-xs pb-1 border-b border-emerald-100">
                        {t.headerText}
                      </div>
                    )}
                    <p className="whitespace-pre-line text-slate-800 font-normal">{interpolatedBody}</p>
                    {t.footerText && <div className="text-[10.5px] text-slate-500 pt-1">{t.footerText}</div>}
                    {t.buttons && t.buttons.length > 0 && (
                      <div className="pt-2 border-t border-emerald-100 flex flex-wrap gap-1.5">
                        {t.buttons.map((b, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-white text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-semibold shadow-2xs flex items-center gap-1"
                          >
                            <span>🔘</span>
                            <span>{b}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTemplate(interpolatedBody, t.buttons)
                        onClose()
                      }}
                      className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                    >
                      Use in Chat Bar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSendDirectly(interpolatedBody, t.buttons)
                        onClose()
                      }}
                      className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Send Now</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
