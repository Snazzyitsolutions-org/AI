import { useState } from 'react'

type AvatarProps = {
  name: string
  src?: string | null
  size?: 'small' | 'large'
}

export function Avatar({ name, src, size = 'small' }: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  const sizeClasses =
    size === 'large'
      ? 'w-10 h-10 text-sm'
      : 'w-8 h-8 text-xs'

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200/80 shrink-0 select-none overflow-hidden ${sizeClasses}`}
      aria-hidden="true"
    >
      {src && !imageFailed ? (
        <img
          src={src}
          alt=""
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span>{initials || 'CW'}</span>
      )}
    </span>
  )
}
