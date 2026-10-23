import { useEffect } from 'react'
import type { MouseEvent } from 'react'
import { SparkIcon } from '../icons'
import {
  CalendarIcon,
  CloseIcon,
  CopyIcon,
  PencilIcon,
  SendIcon,
  TemplateIcon,
  TrashIcon,
  WhatsAppIcon,
} from './DashboardIcons'
import { TemplateMessagePreview } from './TemplateMessagePreview'
import {
  extractVariableNumbers,
  formatTemplateDate,
  getLanguageLabel,
} from './templateData'
import type { WhatsAppTemplate } from './templateData'

type TemplateDetailDrawerProps = {
  template: WhatsAppTemplate
  onClose: () => void
  onEdit: (template: WhatsAppTemplate) => void
  onDuplicate: (template: WhatsAppTemplate) => void
  onDelete: (template: WhatsAppTemplate) => void
  onSendTest: (template: WhatsAppTemplate) => void
}

export function TemplateDetailDrawer({
  template,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
  onSendTest,
}: TemplateDetailDrawerProps) {
  const variables = extractVariableNumbers(template.headerText, template.body)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  function handleOverlayClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <div className="modal-overlay" onMouseDown={handleOverlayClick}>
      <div
        className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-detail-title"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/70 flex-shrink-0">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                  template.status === 'Approved'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                    : template.status === 'Pending'
                    ? 'bg-amber-50 text-amber-800 border-amber-200/80'
                    : template.status === 'Rejected'
                    ? 'bg-rose-50 text-rose-800 border-rose-200/80'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    template.status === 'Approved'
                      ? 'bg-emerald-500'
                      : template.status === 'Pending'
                      ? 'bg-amber-500'
                      : template.status === 'Rejected'
                      ? 'bg-rose-500'
                      : 'bg-slate-400'
                  }`}
                />
                {template.status}
              </span>

              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 text-[10px] font-semibold">
                {template.category}
              </span>
            </div>

            <h2 id="template-detail-title" className="text-base sm:text-lg font-bold text-slate-900 truncate">
              {template.name}
            </h2>
            <small className="block text-xs text-slate-500 truncate">
              {getLanguageLabel(template.language)} · {variables.length} variable
              {variables.length === 1 ? '' : 's'} · {template.usageCount.toLocaleString('en-US')} sends
            </small>
          </div>

          <button
            type="button"
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
            onClick={onClose}
            aria-label="Close template details"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body - Two Column Layout */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Left: Authentic WhatsApp Phone Mockup */}
            <div className="md:col-span-6 flex flex-col items-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
                Live Client Preview
              </span>

              <div className="w-full max-w-[280px] rounded-3xl border-4 border-slate-800 bg-[#efeae2] shadow-xl overflow-hidden flex flex-col text-slate-900">
                {/* Phone Top Notch / Status Bar */}
                <div className="bg-[#075e54] text-white px-3 py-1 flex items-center justify-between text-[10px] font-semibold">
                  <span>9:41</span>
                  <span>📶 🔋</span>
                </div>

                {/* WhatsApp Chat Header */}
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

                {/* Chat Wallpaper Canvas */}
                <div className="p-3 min-h-[300px] flex flex-col justify-end space-y-2 bg-[#efeae2] relative">
                  <div className="text-center">
                    <span className="px-2 py-0.5 rounded-md bg-white/70 text-slate-500 text-[9px] font-semibold shadow-2xs">
                      TODAY
                    </span>
                  </div>

                  <TemplateMessagePreview
                    headerType={template.headerType}
                    headerText={template.headerText}
                    body={template.body}
                    footer={template.footer}
                    buttons={template.buttons}
                    compact
                  />
                </div>

                {/* Simulated Bottom Message Input Bar */}
                <div className="p-2 bg-[#f0f2f5] border-t border-slate-200 flex items-center gap-2 text-xs">
                  <span className="flex-1 px-3 py-1 bg-white rounded-full text-slate-400 text-[10px]">
                    Message
                  </span>
                  <div className="w-6 h-6 rounded-full bg-[#00a884] text-white flex items-center justify-center text-xs">
                    <SendIcon className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Technical Specs, Variables, Usage & Review */}
            <div className="md:col-span-6 space-y-4">
              {/* Template Specs */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <TemplateIcon className="w-3.5 h-3.5 text-emerald-600" />
                  Template Specifications
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50">
                    <small className="block text-[10px] text-slate-400 font-semibold uppercase">Category</small>
                    <strong className="text-slate-800">{template.category}</strong>
                  </div>

                  <div className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50">
                    <small className="block text-[10px] text-slate-400 font-semibold uppercase">Language</small>
                    <strong className="text-slate-800">{getLanguageLabel(template.language)}</strong>
                  </div>

                  <div className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50">
                    <small className="block text-[10px] text-slate-400 font-semibold uppercase">Header Type</small>
                    <strong className="text-slate-800 capitalize">{template.headerType}</strong>
                  </div>

                  <div className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50">
                    <small className="block text-[10px] text-slate-400 font-semibold uppercase">Buttons</small>
                    <strong className="text-slate-800">{template.buttons.length} attached</strong>
                  </div>

                  <div className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50">
                    <small className="block text-[10px] text-slate-400 font-semibold uppercase">Created</small>
                    <strong className="text-slate-800">{formatTemplateDate(template.createdAt)}</strong>
                  </div>

                  <div className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50">
                    <small className="block text-[10px] text-slate-400 font-semibold uppercase">Updated</small>
                    <strong className="text-slate-800">{formatTemplateDate(template.updatedAt)}</strong>
                  </div>
                </div>
              </div>

              {/* Dynamic Variables */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <SparkIcon className="w-3.5 h-3.5 text-emerald-600" />
                  Personalisation Variables
                </span>

                {variables.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {variables.map((variable) => (
                      <span
                        key={variable}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/70 text-emerald-800 font-mono font-bold text-xs shadow-2xs"
                      >
                        {`{{${variable}}}`}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                    This template has no variables — static copy for all recipients.
                  </p>
                )}
              </div>

              {/* Lifetime Usage Card */}
              <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
                    Lifetime Dispatch Usage
                  </span>
                  <strong className="text-emerald-700 font-bold">{template.usageCount.toLocaleString('en-US')} sends</strong>
                </div>
                <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                    style={{ width: `${Math.min(100, Math.max(8, template.usageCount / 220))}%` }}
                  />
                </div>
                <small className="block text-[10px] text-slate-400">
                  Across all active campaigns and automations in this workspace.
                </small>
              </div>

              {/* Meta Review Alert if Rejected */}
              {template.rejectionReason && (
                <div className="p-3.5 rounded-2xl border border-rose-200 bg-rose-50/80 text-rose-800 text-xs space-y-1" role="alert">
                  <strong className="block font-bold">Meta review feedback:</strong>
                  <p className="text-[11px] leading-relaxed">{template.rejectionReason}</p>
                  <span className="text-[10px] text-rose-600 block mt-1">
                    Edit the template to comply with WhatsApp Business Policy and resubmit.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between gap-2.5 bg-slate-50/80 flex-shrink-0">
          <button
            type="button"
            className="px-3 py-2 rounded-xl text-xs font-semibold border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
            onClick={() => onDelete(template)}
          >
            <TrashIcon className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
              onClick={() => onSendTest(template)}
            >
              <SendIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>Send test</span>
            </button>

            <button
              type="button"
              className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
              onClick={() => onDuplicate(template)}
            >
              <CopyIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>Duplicate</span>
            </button>

            <button
              type="button"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              onClick={() => onEdit(template)}
            >
              <PencilIcon className="w-3.5 h-3.5" />
              <span>Edit template</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
