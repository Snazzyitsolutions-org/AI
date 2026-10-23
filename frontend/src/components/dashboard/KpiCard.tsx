import type { ReactNode } from 'react'
import { TrendUpIcon } from './DashboardIcons'

export type KpiTone = 'mint' | 'leaf' | 'teal' | 'lime' | 'emerald' | 'cyan' | 'amber'

type KpiCardProps = {
  label: string
  value: string
  change: string
  note: string
  subtext?: string
  icon: ReactNode
  tone: KpiTone
  points: number[]
}

function smoothCurvedPath(points: number[], width = 96, height = 36) {
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1

  const coords = points.map((p, i) => ({
    x: (i / (points.length - 1)) * width,
    y: height - ((p - min) / range) * (height - 8) - 4,
  }))

  const line = coords.reduce((acc, curr, idx) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`
    const prev = coords[idx - 1]
    const midX = (prev.x + curr.x) / 2
    return `${acc} C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`
  }, '')

  const area = `${line} L ${width} ${height} L 0 ${height} Z`
  return { line, area }
}

export function KpiCard({ label, value, change, note, subtext, icon, tone, points }: KpiCardProps) {
  const { line, area } = smoothCurvedPath(points)
  const gradientId = `kpi-grad-${tone}`

  return (
    <article className={`kpi-card kpi-card--${tone}`}>
      <div className="kpi-card__top">
        <span className="kpi-card__label">{label}</span>
        <span className="kpi-card__icon">{icon}</span>
      </div>

      <div className="kpi-card__body">
        <strong className="kpi-card__value">{value}</strong>
        {subtext && <span className="kpi-card__subtext">{subtext}</span>}
      </div>

      <div className="kpi-card__foot">
        <span className="kpi-card__change">
          <TrendUpIcon />
          {change}
        </span>
        <span className="kpi-card__note">{note}</span>
      </div>

      <svg
        className="kpi-card__spark"
        viewBox="0 0 96 36"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gradientId})`} />
        <path d={line} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </article>
  )
}

