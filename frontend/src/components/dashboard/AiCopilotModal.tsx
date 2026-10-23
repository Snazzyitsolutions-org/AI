import { useState, useEffect } from 'react'

interface AiCopilotModalProps {
  isOpen: boolean
  onClose: () => void
  contactName: string
  companyName: string
  leadStage: string
  lastMessageText: string
  onInsertInChat: (text: string) => void
  onSendNow: (text: string) => void
}

type ToneType = 'closer' | 'professional' | 'friendly' | 'urgent' | 'consultative'

export function AiCopilotModal({
  isOpen,
  onClose,
  contactName,
  companyName,
  leadStage,
  lastMessageText,
  onInsertInChat,
  onSendNow,
}: AiCopilotModalProps) {
  const firstName = contactName.split(' ')[0] || 'there'
  const company = companyName || 'your team'

  const [selectedTone, setSelectedTone] = useState<ToneType>('closer')
  const [customGoal, setCustomGoal] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedDraft, setGeneratedDraft] = useState('')

  // Generate initial draft when modal opens
  useEffect(() => {
    if (isOpen) {
      generateDraft('closer', '')
    }
  }, [isOpen, contactName, lastMessageText])

  if (!isOpen) return null

  const generateDraft = (tone: ToneType, customGoalText: string) => {
    setIsGenerating(true)
    setGeneratedDraft('')

    // Build intelligent context-aware templates
    let draft = ''
    if (customGoalText.trim()) {
      draft = `Hi ${firstName}, regarding ${company}: ${customGoalText.trim()} We can set this up seamlessly with official Meta Cloud API tier-4 integration. Would Tomorrow at 3:00 PM work for a brief 15-minute walkthrough?`
    } else if (tone === 'closer') {
      draft = `Hi ${firstName}! Absolutely, I have prepared the tailored enterprise breakdown for ${company}. With CallWave, you get unlimited agents, zero-ban rate spintax pacing, and 99.98% delivery SLA. Can I lock in Tomorrow at 3:00 PM or Thursday 11:30 AM to walk you through your live numbers?`
    } else if (tone === 'professional') {
      draft = `Hello ${firstName}, thank you for your query regarding ${company}. We have provisioned the requested specifications and pricing tier details. We ensure complete compliance with Meta Business guidelines and dedicated throughput. Please let us know if you require any additional technical documentation.`
    } else if (tone === 'friendly') {
      draft = `Hey ${firstName}! Great connecting with you. We'd love to help ${company} scale WhatsApp broadcasts without any friction! Let me know when you have 10 minutes this week—happy to jump on a quick call and answer any questions.`
    } else if (tone === 'urgent') {
      draft = `Hi ${firstName}, quick update for ${company}: our quarterly enterprise volume discount tier expires this Friday! If we confirm your onboarding slot today, we can lock in 25% extra broadcast credits permanently. Let me know if you’d like me to reserve your account.`
    } else {
      draft = `Hi ${firstName}, based on your requirements at ${company}, our automated broadcast solution will streamline your agent workflows while keeping costs predictable. What is the current monthly volume you are looking to support?`
    }

    setTimeout(() => {
      setGeneratedDraft(draft)
      setIsGenerating(false)
    }, 450)
  }

  const handleQuickPrompt = (_promptLabel: string, promptGoal: string) => {
    setCustomGoal(promptGoal)
    generateDraft(selectedTone, promptGoal)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col text-slate-900 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-copilot-title"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center shadow-2xs">
              <span className="text-base">✨</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="ai-copilot-title" className="text-sm sm:text-base font-bold text-slate-900">
                  Generate with AI Copilot
                </h3>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  GPT-4o / Claude
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Replying to <strong className="text-slate-800">{contactName}</strong> • {companyName} ({leadStage})
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

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Incoming message context */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              💬 Inbound Context from {firstName}:
            </span>
            <p className="text-slate-800 italic font-medium leading-relaxed">
              "{lastMessageText || 'No prior message'}"
            </p>
          </div>

          {/* Quick Prompts */}
          <div>
            <span className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
              ⚡ 1-Click Goal Prompts
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() =>
                  handleQuickPrompt(
                    'Book Demo',
                    'propose 2 demo slots for a personalized 15-minute walkthrough'
                  )
                }
                className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 font-medium transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                🎯 Book Live Demo
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickPrompt(
                    'Pricing Quote',
                    'offer custom volume pricing starting at ₹1,499/mo with zero platform fees'
                  )
                }
                className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 font-medium transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                💰 Send Custom Pricing
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickPrompt(
                    'Compliance / Zero-Ban',
                    'assure zero-ban guarantee with official Meta Cloud API and spintax delivery'
                  )
                }
                className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 font-medium transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                🛡️ Zero-Ban Assurance
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickPrompt(
                    '15% Discount',
                    'offer an exclusive 15% discount if they confirm a pilot this week'
                  )
                }
                className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 font-medium transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                🎁 15% VIP Discount
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickPrompt(
                    'Friendly Check-in',
                    'check in politely and ask if they have any questions on our proposal'
                  )
                }
                className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 font-medium transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                🤝 Gentle Check-in
              </button>
            </div>
          </div>

          {/* Tone Selector */}
          <div>
            <span className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
              🎭 Response Tone
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-xs">
              {[
                { id: 'closer', label: '🚀 Sales Closer' },
                { id: 'professional', label: '💼 Professional' },
                { id: 'friendly', label: '😊 Friendly' },
                { id: 'urgent', label: '⚡ Urgent Offer' },
                { id: 'consultative', label: '💡 Consultative' },
              ].map((tone) => (
                <button
                  key={tone.id}
                  type="button"
                  onClick={() => {
                    setSelectedTone(tone.id as ToneType)
                    generateDraft(tone.id as ToneType, customGoal)
                  }}
                  className={`p-2 rounded-xl text-center font-semibold border transition-all cursor-pointer ${
                    selectedTone === tone.id
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-xs ring-1 ring-emerald-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-2xs'
                  }`}
                >
                  {tone.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generated AI Draft Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                <span>✨ Generated WhatsApp Reply:</span>
              </span>
              <button
                type="button"
                onClick={() => generateDraft(selectedTone, customGoal)}
                className="text-[11px] text-slate-500 hover:text-emerald-700 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>🔄 Regenerate</span>
              </button>
            </div>

            <div className="relative">
              <textarea
                rows={4}
                value={generatedDraft}
                onChange={(e) => setGeneratedDraft(e.target.value)}
                placeholder={isGenerating ? 'AI is crafting your tailored response…' : ''}
                className="w-full p-3.5 bg-[#f0fbf5] border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all resize-none leading-relaxed shadow-2xs"
              />
              {isGenerating && (
                <div className="absolute inset-0 bg-[#f0fbf5]/90 rounded-xl flex items-center justify-center gap-2 text-xs text-emerald-800 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  Generating tailored reply…
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isGenerating || !generatedDraft.trim()}
              onClick={() => {
                onInsertInChat(generatedDraft)
                onClose()
              }}
              className="px-4 py-2 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            >
              Insert in Input Bar
            </button>
            <button
              type="button"
              disabled={isGenerating || !generatedDraft.trim()}
              onClick={() => {
                onSendNow(generatedDraft)
                onClose()
              }}
              className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <span>Send Instantly</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
