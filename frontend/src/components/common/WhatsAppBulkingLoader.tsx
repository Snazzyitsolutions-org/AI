export interface WhatsAppBulkingLoaderProps {
  variant?: 'fullscreen' | 'modal' | 'card' | 'inline'
  size?: 'sm' | 'md' | 'lg'
  onCancel?: () => void
}

export function WhatsAppBulkingLoader({
  variant = 'fullscreen',
  size = 'lg',
  onCancel,
}: WhatsAppBulkingLoaderProps) {
  // Size classes for the central WhatsApp icon
  const iconDimensions = {
    sm: 'w-14 h-14 rounded-2xl',
    md: 'w-20 h-20 rounded-[22px]',
    lg: 'w-24 h-24 sm:w-28 sm:h-28 rounded-3xl',
  }[size]

  const svgDimensions = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-12 h-12 sm:w-14 sm:h-14',
  }[size]

  const containerDimensions = {
    sm: 'w-36 h-36',
    md: 'w-48 h-48',
    lg: 'w-64 h-64 sm:w-72 sm:h-72',
  }[size]

  // The Clean, Pure WhatsApp Animated Icon Loader
  const WhatsAppIconLoader = (
    <div
      className={`relative flex items-center justify-center ${containerDimensions} select-none`}
      role="status"
      aria-label="Loading"
    >
      {/* Outer Pulse Concentric Waves */}
      <span className="absolute inset-4 rounded-full bg-whatsapp-500/25 animate-broadcast pointer-events-none" />
      <span className="absolute inset-4 rounded-full bg-whatsapp-600/20 animate-broadcast-delayed pointer-events-none" />
      <span className="absolute inset-4 rounded-full bg-whatsapp-400/15 animate-broadcast-late pointer-events-none" />

      {/* Subtle Outer Rotating Radar Orbit */}
      <div className="absolute inset-6 rounded-full border border-dashed border-whatsapp-500/30 animate-radar-spin pointer-events-none" />

      {/* Central WhatsApp Glowing Icon */}
      <div
        className={`relative z-10 flex items-center justify-center ${iconDimensions} bg-gradient-to-tr from-whatsapp-700 via-whatsapp-600 to-whatsapp-500 shadow-whatsapp-glow transform transition-transform hover:scale-105 animate-pulse`}
      >
        {/* Inner Highlight Shimmer Ring */}
        <div className="absolute inset-1 rounded-[inherit] border border-white/30 pointer-events-none" />

        {/* WhatsApp Official SVG Glyph */}
        <svg
          className={`${svgDimensions} text-white drop-shadow-md`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm0 18.06c-1.49 0-2.95-.4-4.22-1.15l-.3-.18-3.13.82.84-3.05-.2-.32a8.04 8.04 0 01-1.24-4.27c0-4.48 3.65-8.13 8.13-8.13 2.17 0 4.21.85 5.75 2.38a8.08 8.08 0 012.38 5.75c0 4.48-3.65 8.13-8.13 8.13zm4.46-6.09c-.24-.12-1.45-.72-1.68-.8-.22-.09-.39-.12-.55.12-.17.24-.63.8-.78.96-.14.17-.29.19-.53.07-.24-.12-1.03-.38-1.96-1.21-.72-.65-1.21-1.45-1.35-1.69-.14-.24-.02-.37.1-.49.11-.11.24-.29.37-.43.12-.14.17-.24.25-.4.08-.17.04-.31-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.41-.41-.56-.42-.14-.01-.31-.01-.48-.01-.17 0-.44.06-.67.31-.23.24-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.78 2.71 4.3 3.8.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.45-.6 1.66-1.17.2-.57.2-1.07.14-1.17-.06-.1-.23-.17-.47-.29z" />
        </svg>

        {/* Dynamic Outgoing Broadcast Beacon Ping */}
        <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-whatsapp-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-whatsapp-500 border-2 border-white" />
        </span>
      </div>
    </div>
  )

  // Fullscreen Overlay variant
  if (variant === 'fullscreen') {
    return (
      <div
        className="fixed inset-0 z-[999] flex items-center justify-center bg-gradient-to-b from-[#f2faf6]/95 via-white/95 to-[#e9f7ef]/98 backdrop-blur-xl animate-fade-in cursor-pointer"
        role="status"
        aria-live="polite"
        onClick={onCancel}
        title={onCancel ? 'Click anywhere to close' : undefined}
      >
        {/* Ambient Glow in background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-whatsapp-400/20 blur-3xl" />
        </div>

        {/* Central Only WhatsApp Icon */}
        <div className="relative z-10">{WhatsAppIconLoader}</div>

        {/* Subtle top-right close button if onCancel is provided */}
        {onCancel && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onCancel()
            }}
            className="absolute top-6 right-6 p-2 rounded-full text-muted-light hover:text-ink hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    )
  }

  // Card or inline variant (Pure WhatsApp icon)
  return (
    <div className="flex items-center justify-center p-6 bg-transparent">
      {WhatsAppIconLoader}
    </div>
  )
}
