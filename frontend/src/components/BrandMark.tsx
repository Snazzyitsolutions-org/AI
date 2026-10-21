import { Link } from 'react-router-dom'

type BrandMarkProps = {
  to?: string
  compact?: boolean
}

export function BrandMark({ to = '/', compact = false }: BrandMarkProps) {
  return (
    <Link className="brand-mark" to={to} aria-label="CallWave home">
      <span className="brand-mark__icon">
        <img src="/logo.png" alt="" width="34" height="34" />
      </span>
      {!compact && <span className="brand-mark__text">CallWave</span>}
    </Link>
  )
}
