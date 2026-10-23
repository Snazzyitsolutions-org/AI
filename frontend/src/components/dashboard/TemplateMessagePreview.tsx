import type { ReactNode } from 'react'
import type { TemplateButton, TemplateHeaderType } from './templateData'
import {
  FileTextIcon,
  ImageIcon,
  LinkIcon,
  QuickReplyIcon,
  VideoIcon,
} from './DashboardIcons'
import { PhoneIcon } from '../icons'

type TemplateMessagePreviewProps = {
  headerType: TemplateHeaderType
  headerText?: string
  body: string
  footer?: string
  buttons?: TemplateButton[]
  samples?: Record<string, string>
  compact?: boolean
  time?: string
}

function renderTemplateText(text: string, samples: Record<string, string> = {}): ReactNode {
  return text.split(/(\{\{\s*\d+\s*\}\})/g).map((part, index) => {
    const match = part.match(/^\{\{\s*(\d+)\s*\}\}$/)

    if (!match) return part

    const sample = samples[match[1]]
    return (
      <mark
        className="bg-emerald-100 text-emerald-900 font-mono font-bold px-1.5 py-0.5 rounded text-[11px] mx-0.5 inline-block"
        key={`${match[1]}-${index}`}
      >
        {sample?.trim() ? sample : `{{${match[1]}}}`}
      </mark>
    )
  })
}

function MediaHeader({ type }: { type: Exclude<TemplateHeaderType, 'none' | 'text'> }) {
  const meta = {
    image: { Icon: ImageIcon, label: 'Image Header (.jpg / .png)' },
    video: { Icon: VideoIcon, label: 'Video Header (.mp4)' },
    document: { Icon: FileTextIcon, label: 'Document Header (.pdf)' },
  }[type]

  return (
    <div className="w-full h-24 mb-2.5 rounded-xl bg-slate-100 border border-slate-200/80 flex flex-col items-center justify-center gap-1.5 text-slate-500 text-xs">
      <meta.Icon className="w-5 h-5 text-slate-400" />
      <span className="font-medium text-[11px]">{meta.label}</span>
    </div>
  )
}

export function TemplateMessagePreview({
  headerType,
  headerText,
  body,
  footer,
  buttons = [],
  samples = {},
  compact = false,
  time = '9:41 AM',
}: TemplateMessagePreviewProps) {
  return (
    <div className={`w-full ${compact ? 'text-xs' : 'text-sm'}`}>
      {/* WhatsApp Message Bubble */}
      <div className="relative rounded-2xl rounded-tl-xs bg-white border border-[#e9edef] p-3.5 shadow-sm text-slate-800 space-y-2">
        {/* Header Section */}
        {headerType === 'text' && headerText && (
          <p className="font-bold text-xs text-slate-900 pb-1.5 border-b border-slate-100 leading-snug">
            {headerText}
          </p>
        )}

        {headerType !== 'none' && headerType !== 'text' && (
          <MediaHeader type={headerType} />
        )}

        {/* Message Body */}
        <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
          {renderTemplateText(body, samples)}
        </p>

        {/* Footer Text */}
        {footer && (
          <p className="text-[10px] text-slate-400 italic pt-0.5">
            {footer}
          </p>
        )}

        {/* Timestamp & WhatsApp Double Checkmark */}
        <div className="flex items-center justify-end gap-1 pt-1 text-[10px] text-slate-400">
          <span>{time}</span>
          <span className="text-sky-500 font-bold" aria-label="Delivered">
            ✓✓
          </span>
        </div>
      </div>

      {/* WhatsApp Interactive Action Buttons (URL, Quick Reply, Phone) */}
      {buttons.length > 0 && (
        <div className="mt-2 space-y-1.5">
          {buttons.map((button, index) => {
            const Icon =
              button.type === 'url' ? LinkIcon : button.type === 'phone' ? PhoneIcon : QuickReplyIcon

            return (
              <div
                key={`${button.label}-${index}`}
                className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-50 border border-[#e9edef] text-emerald-700 text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
              >
                <Icon className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span className="truncate">{button.label || 'Action Button'}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
