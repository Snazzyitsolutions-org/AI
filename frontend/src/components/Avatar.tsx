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

  return (
    <span className={`avatar avatar--${size}`} aria-hidden="true">
      {src && !imageFailed ? (
        <img
          src={src}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span>{initials || 'CW'}</span>
      )}
    </span>
  )
}
