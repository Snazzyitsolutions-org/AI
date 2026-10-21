type IconProps = {
  className?: string
}

export function HomeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4.5 10.2 12 4l7.5 6.2v8.1a1.7 1.7 0 0 1-1.7 1.7H6.2a1.7 1.7 0 0 1-1.7-1.7v-8.1Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9.4 20v-5.4h5.2V20"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function MegaphoneIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 10.3v3.4a1.8 1.8 0 0 0 1.8 1.8h2.4l6.8 3.8c.9.5 1.9-.2 1.9-1.2V5.9c0-1-1-1.7-1.9-1.2L8.2 8.5H5.8A1.8 1.8 0 0 0 4 10.3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M8.2 15.8v2.5a1.8 1.8 0 0 0 1.8 1.8h.5a1.6 1.6 0 0 0 1.5-1.1l1-2.7M19.5 9.5v5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function ContactsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="9" cy="8.1" r="3.1" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M3.6 18.4c.4-3 2.6-4.8 5.4-4.8s5 1.8 5.4 4.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M15.5 5.4a3.1 3.1 0 0 1 0 5.7M17.6 13.9c1.6.5 2.6 1.9 2.9 4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function PipelineIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 5.2h16L14.4 12v5.2l-4.8 2.3V12L4 5.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M8 8.5h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function AnalyticsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5 19V11M12 19V5M19 19v-5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M3.5 19.5h17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".5" />
    </svg>
  )
}

export function PhoneOutlineIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="m8.2 4.6-1.6-.6c-.9-.3-1.8.1-2.2 1l-.4 1.2c-.3.9 0 1.8.6 2.5 3 3.8 6.9 6.7 11.3 8.4l1.2.4c.8.3 1.6-.1 1.9-.9l.8-2.2c.3-.8-.1-1.7-.9-2l-2.2-.8c-.7-.2-1.4 0-1.9.6l-.8.9a14.2 14.2 0 0 1-4-4l.9-.9c.5-.5.7-1.2.5-1.9l-.8-2.2a1.7 1.7 0 0 0-1.1-1.1Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="2.8" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M19.1 13.8a7.6 7.6 0 0 0 0-1.6l1.6-1.2-1.7-3-1.9.7a8 8 0 0 0-1.4-.8L15.4 6h-3.5l-.3 1.9c-.5.2-1 .5-1.4.8l-1.9-.7-1.7 3 1.6 1.2a7.6 7.6 0 0 0 0 1.6l-1.6 1.2 1.7 3 1.9-.7c.4.3.9.6 1.4.8l.3 1.9h3.5l.3-1.9c.5-.2 1-.5 1.4-.8l1.9.7 1.7-3-1.6-1.2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.3" stroke="currentColor" strokeWidth="1.8" />
      <path d="m15.6 15.6 4.1 4.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function BellIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M5.3 16.2h13.4c-1-1-1.6-2.2-1.6-4.1v-1.3a5.1 5.1 0 0 0-10.2 0v1.3c0 1.9-.6 3.1-1.6 4.1Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M10 18.7a2.2 2.2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  )
}

export function UploadIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 15.5V4.8m0 0L8.2 8.6M12 4.8l3.8 3.8M5 14.8v3.4A1.8 1.8 0 0 0 6.8 20h10.4a1.8 1.8 0 0 0 1.8-1.8v-3.4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 7h16M4 12h16M4 17h10"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="m7 9.5 5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ArrowUpRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M7 17 17 7M8.2 7H17v8.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function TrendUpIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="m4 16 5.2-5.2 3.5 3.5L20 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.8 7H20v5.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="4" y="5.8" width="16" height="14.2" rx="2.2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 3.8v4M16 3.8v4M4 9.6h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

export function MoreHorizontalIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="5.5" cy="12" r="1.4" fill="currentColor" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
      <circle cx="18.5" cy="12" r="1.4" fill="currentColor" />
    </svg>
  )
}

export function CheckCircleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.6" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="m8.2 12.1 2.5 2.5 5.1-5.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function PlayIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M8.2 5.8v12.4L18.3 12 8.2 5.8Z" fill="currentColor" />
    </svg>
  )
}

export function HeadsetIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4.5 13v-1a7.5 7.5 0 0 1 15 0v1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M4.5 12.5h1.2A1.8 1.8 0 0 1 7.5 14.3v3.1a1.8 1.8 0 0 1-1.8 1.8H5.3a1.3 1.3 0 0 1-1.3-1.3v-4.1c0-.7.2-1.1.5-1.3ZM19.5 12.5h-1.2a1.8 1.8 0 0 0-1.8 1.8v3.1a1.8 1.8 0 0 0 1.8 1.8h.4a1.3 1.3 0 0 0 1.3-1.3v-4.1c0-.7-.2-1.1-.5-1.3Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}
