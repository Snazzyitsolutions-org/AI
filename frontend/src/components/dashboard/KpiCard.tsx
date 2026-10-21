import type { ReactNode } from 'react'
import { TrendUpIcon } from './DashboardIcons'

type KpiCardProps = {
  label: string
  value: string
  change: string
  note: string
  icon: ReactNode
  tone: 'mint' | 'leaf' | 'teal' | 'lime'
  points: number[]
}

function sparklinePath(points: number[], width = 88, height = 32) {
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1

  return points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * width
      const y = height - ((point - min) / range) * (height - 6) - 3
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}

export function KpiCard({ label, value, change, note, icon, tone, points }: KpiCardProps) {
  const line = sparklinePath(points)
  const area = `${line} L 88 32 L 0 32 Z`
  const gradientId = `spark-${tone}`

  return (
    <article className={`kpi-card kpi-card--${tone}`}>
      <div className="kpi-card__top">
        <span className="kpi-card__label">{label}</span>
        <span className="kpi-card__icon">{icon}</span>
      </div>
      <strong className="kpi-card__value">{value}</strong>
      <div className="kpi-card__foot">
        <span className="kpi-card__change">
          <TrendUpIcon />
          {change}
        </span>
        <span className="kpi-card__note">{note}</span>
      </div>
      <svg
        className="kpi-card__spark"
        viewBox="0 0 88 32"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gradientId})`} />
        <path d={line} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </article>
  )
}
