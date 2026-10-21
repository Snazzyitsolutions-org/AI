type IconProps = {
  className?: string
}

export function MailIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="m5.5 7.5 5.5 4.6a1.6 1.6 0 0 0 2 0l5.5-4.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function LockIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8.5 10V7.75a3.5 3.5 0 1 1 7 0V10"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path d="M12 14v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function UserIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="8.3" r="3.4" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M5 19c.5-3.2 3.3-5.2 7-5.2s6.5 2 7 5.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function EyeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M3.5 12s3.1-5 8.5-5 8.5 5 8.5 5-3.1 5-8.5 5-8.5-5-8.5-5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.36" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

export function EyeOffIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4.3 4.3 19.7 19.7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M9.8 7.5A9.9 9.9 0 0 1 12 7c5.4 0 8.5 5 8.5 5a15.6 15.6 0 0 1-2.2 2.7M14.5 16.4c-.8.4-1.6.6-2.5.6-5.4 0-8.5-5-8.5-5a16 16 0 0 1 3.2-3.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M10.7 10.7a1.83 1.83 0 0 0 2.6 2.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function AlertIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.6" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v4.6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <circle cx="12" cy="16.1" r="1" fill="currentColor" />
    </svg>
  )
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="m5.5 12.2 4.1 4.1 8.9-9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ShieldCheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3.5 19 6v5.7c0 4-2.8 7.4-7 8.8-4.2-1.4-7-4.8-7-8.8V6l7-2.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="m8.8 11.8 2.1 2.1 4.3-4.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M5 12h13.5m-5.2-5.3L18.6 12l-5.3 5.3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M8.3 4.8 6.6 4.2c-.9-.3-1.9.2-2.2 1.1L4 7.5c-.3 1 .1 2 .8 2.8 3.3 4 7.5 7.1 12.3 8.8l1.3.4c.8.2 1.6-.2 1.9-1l.8-2.3c.3-.8-.1-1.7-.9-2l-2.2-.8c-.7-.2-1.4 0-1.9.6l-.8.9a14 14 0 0 1-4.3-4.2l.9-.9c.5-.5.7-1.2.5-1.9l-.8-2.2a1.6 1.6 0 0 0-1.3-1Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function GoogleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.64 12.2c0-.68-.06-1.34-.17-1.97H12v3.76h5.4a4.62 4.62 0 0 1-2 3.03v2.44h3.17c1.86-1.7 3.07-4.23 3.07-7.26Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.66 0 4.9-.88 6.53-2.38l-3.18-2.44c-.88.59-2.01.94-3.35.94-2.58 0-4.76-1.73-5.54-4.07H3.18v2.51A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.46 14.05A6 6 0 0 1 6.15 12c0-.71.11-1.4.31-2.05V7.44H3.18A10 10 0 0 0 2 12c0 1.61.38 3.14 1.18 4.56l3.28-2.51Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.88c1.45 0 2.75.5 3.78 1.48l2.82-2.82A9.53 9.53 0 0 0 12 2a10 10 0 0 0-8.82 5.44l3.28 2.51C7.24 7.61 9.42 5.88 12 5.88Z"
      />
    </svg>
  )
}

export function LogOutIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M14.5 5.5V4.8c0-.7-.6-1.3-1.3-1.3H5.8c-.7 0-1.3.6-1.3 1.3v14.4c0 .7.6 1.3 1.3 1.3h7.4c.7 0 1.3-.6 1.3-1.3v-.7M10.5 12h10m-3.4-3.4L20.5 12l-3.4 3.4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SparkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3.5c.3 4.8 3.7 8.2 8.5 8.5-4.8.3-8.2 3.7-8.5 8.5-.3-4.8-3.7-8.2-8.5-8.5 4.8-.3 8.2-3.7 8.5-8.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}
