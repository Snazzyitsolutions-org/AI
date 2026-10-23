import { useState } from 'react'

export interface ScheduledMessageItem {
  id: string
  convId: string
  contactName: string
  phone: string
  text: string
  scheduledDate: string
  scheduledTime: string
  presetLabel: string
}

interface ScheduleMessageModalProps {
  isOpen: boolean
  onClose: () => void
  contactName: string
  contactPhone: string
  initialText: string
  onSchedule: (item: ScheduledMessageItem) => void
}

export function ScheduleMessageModal({
  isOpen,
  onClose,
  contactName,
  contactPhone,
  initialText,
  onSchedule,
}: ScheduleMessageModalProps) {
  const [text, setText] = useState(initialText || '')

  // Calculate default date & time (Tomorrow 09:00 AM)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const defaultDateStr = tomorrow.toISOString().split('T')[0]

  const [date, setDate] = useState(defaultDateStr)
  const [time, setTime] = useState('09:00')
  const [selectedPreset, setSelectedPreset] = useState<'30m' | '2h' | 'tomorrow_9am' | 'next_mon' | 'custom'>('tomorrow_9am')
  const [autoCancelOnReply, setAutoCancelOnReply] = useState(true)

  if (!isOpen) return null

  const handleApplyPreset = (preset: '30m' | '2h' | 'tomorrow_9am' | 'next_mon') => {
    setSelectedPreset(preset)
    const now = new Date()

    if (preset === '30m') {
      now.setMinutes(now.getMinutes() + 30)
      setDate(now.toISOString().split('T')[0])
      setTime(now.toTimeString().slice(0, 5))
    } else if (preset === '2h') {
      now.setHours(now.getHours() + 2)
      setDate(now.toISOString().split('T')[0])
      setTime(now.toTimeString().slice(0, 5))
    } else if (preset === 'tomorrow_9am') {
      const tom = new Date()
      tom.setDate(tom.getDate() + 1)
      setDate(tom.toISOString().split('T')[0])
      setTime('09:00')
    } else if (preset === 'next_mon') {
      const nextMon = new Date()
      const day = nextMon.getDay()
      const diff = nextMon.getDate() + (day === 0 ? 1 : 8 - day)
      nextMon.setDate(diff)
      setDate(nextMon.toISOString().split('T')[0])
      setTime('10:00')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return

    const presetLabels: Record<string, string> = {
      '30m': 'In 30 Minutes',
      '2h': 'In 2 Hours',
      tomorrow_9am: 'Tomorrow at 09:00 AM',
      next_mon: 'Next Monday at 10:00 AM',
      custom: `${date} at ${time}`,
    }

    onSchedule({
      id: `sched_${Date.now()}`,
      convId: '',
      contactName,
      phone: contactPhone,
      text: text.trim(),
      scheduledDate: date,
      scheduledTime: time,
      presetLabel: presetLabels[selectedPreset] || `${date} ${time}`,
    })

    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col text-slate-900 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-modal-title"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center shadow-2xs">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="schedule-modal-title" className="text-sm sm:text-base font-bold text-slate-900">
                  Schedule WhatsApp Message
                </h3>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  Auto-Queue
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                To: <span className="text-slate-800 font-semibold">{contactName}</span> ({contactPhone})
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Quick Presets */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
              ⚡ Quick Timing Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleApplyPreset('30m')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                  selectedPreset === '30m'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs ring-1 ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-2xs'
                }`}
              >
                In 30 Mins
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('2h')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                  selectedPreset === '2h'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs ring-1 ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-2xs'
                }`}
              >
                In 2 Hours
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('tomorrow_9am')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                  selectedPreset === 'tomorrow_9am'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs ring-1 ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-2xs'
                }`}
              >
                Tomorrow 9 AM
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('next_mon')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                  selectedPreset === 'next_mon'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs ring-1 ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-2xs'
                }`}
              >
                Next Mon 10 AM
              </button>
            </div>
          </div>

          {/* Date & Time Picker */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Send Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value)
                  setSelectedPreset('custom')
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-slate-900 outline-none transition-all shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Send Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => {
                  setTime(e.target.value)
                  setSelectedPreset('custom')
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-slate-900 outline-none transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Message Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Scheduled Message Text
              </label>
              <span className="text-[10px] text-slate-400">{text.length} characters</span>
            </div>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type the WhatsApp message you want to schedule..."
              className="w-full p-3 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all resize-none shadow-2xs leading-relaxed"
            />
          </div>

          {/* Settings / Options */}
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-1.5 text-xs">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoCancelOnReply}
                onChange={(e) => setAutoCancelOnReply(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span className="text-slate-800 font-medium">
                Cancel schedule if <strong className="text-slate-900">{contactName}</strong> replies beforehand
              </span>
            </label>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 pl-6.5 font-medium">
              <span>🛡️</span>
              <span>Prevents duplicate follow-ups automatically</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!text.trim()}
              className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Confirm Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
