import { useState, useCallback } from 'react'
import { aiApi } from '../../lib/api'

interface AiCopilotModalProps {
  isOpen: boolean
  onClose: () => void
  contactName: string
  companyName: string
  leadStage: string
  onInsertInChat: (text: string) => void
  onSendNow: (text: string) => void
}

type ToneType = 'closer' | 'professional' | 'friendly' | 'urgent' | 'consultative'
type LanguageType = 'English' | 'Hindi' | 'Hinglish'

export function AiCopilotModal({
  isOpen,
  onClose,
  contactName,
  companyName,
  leadStage,
  onInsertInChat,
  onSendNow,
}: AiCopilotModalProps) {
  const [selectedTone, setSelectedTone] = useState<ToneType>('closer')
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageType>('English')
  const [customGoal, setCustomGoal] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedDraft, setGeneratedDraft] = useState('')
  const [generationError, setGenerationError] = useState('')
  const [modelName, setModelName] = useState('')

 const generateDraft = useCallback(
  async (tone: ToneType, language: LanguageType, goal: string) => {
    setIsGenerating(true)
    setGenerationError('')
    setGeneratedDraft('')

    try {
      const result = await aiApi.generateReply({
        prompt: goal,
        tone,
        language,
        contactName,
        companyName,
        leadStage,
      })

      setGeneratedDraft(result.reply)
      setModelName(result.model ?? '')
    } catch (error) {
      setGenerationError(
        error instanceof Error ? error.message : 'Could not generate a reply.',
      )
    } finally {
      setIsGenerating(false)
    }
  },
  [contactName, companyName, leadStage],
)
  if (!isOpen) return null

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
                  {modelName ? `Ollama · ${modelName}` : 'Ollama'}
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
          {/* Reply instructions */}
          <div>
            <label
              htmlFor="ai-copilot-goal"
              className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2"
            >
              What should the reply say?
            </label>
            <textarea
              id="ai-copilot-goal"
              rows={2}
              maxLength={2000}
              value={customGoal}
              onChange={(event) => {
                setCustomGoal(event.target.value)
                setGenerationError('')
              }}
              placeholder="Describe what you want to send, e.g. I’ll send over the pricing deck and WhatsApp template specs."
              className="w-full p-3 bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all resize-y leading-relaxed"
            />
            <div className="flex justify-end mt-2">
              <button
                type="button"
                disabled={isGenerating || !customGoal.trim()}
                onClick={() => void generateDraft(selectedTone, selectedLanguage, customGoal.trim())}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate reply
              </button>
            </div>
          </div>

          {/* Language Selector */}
          <div>
            <span className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
              Reply language
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['English', 'Hindi', 'Hinglish'] as LanguageType[]).map((language) => (
                <button
                  key={language}
                  type="button"
                  disabled={isGenerating}
                  onClick={() => {
                    setSelectedLanguage(language)
                    if (customGoal.trim()) {
                      void generateDraft(selectedTone, language, customGoal.trim())
                    }
                  }}
                  aria-pressed={selectedLanguage === language}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
                    selectedLanguage === language
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-xs ring-1 ring-emerald-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {language}
                </button>
              ))}
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
                  disabled={isGenerating}
                  onClick={() => {
                    const nextTone = tone.id as ToneType
                    setSelectedTone(nextTone)
                    if (customGoal.trim()) {
                      void generateDraft(nextTone, selectedLanguage, customGoal.trim())
                    }
                  }}
                  aria-pressed={selectedTone === tone.id}
                  className={`p-2 rounded-xl text-center font-semibold border transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
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
                disabled={isGenerating || !customGoal.trim()}
                onClick={() => void generateDraft(selectedTone, selectedLanguage, customGoal.trim())}
                className="text-[11px] text-slate-500 hover:text-emerald-700 font-semibold flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>🔄 Regenerate</span>
              </button>
            </div>

            <div className="relative">
              <textarea
                rows={4}
                value={generatedDraft}
                onChange={(e) => setGeneratedDraft(e.target.value)}
                placeholder={isGenerating ? 'Ollama is generating your reply…' : ''}
                className="w-full p-3.5 bg-[#f0fbf5] border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all resize-none leading-relaxed shadow-2xs"
              />
              {isGenerating && (
                <div className="absolute inset-0 bg-[#f0fbf5]/90 rounded-xl flex items-center justify-center gap-2 text-xs text-emerald-800 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  Generating with Ollama…
                </div>
              )}
            </div>
            {generationError && (
              <p role="alert" className="mt-2 text-xs font-medium text-rose-700">
                {generationError}
              </p>
            )}
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
