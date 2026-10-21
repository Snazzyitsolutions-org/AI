import { useState } from 'react'
import { ArrowUpRightIcon, TrendUpIcon } from './DashboardIcons'

type MetricKey = 'calls' | 'connected' | 'messages'

type PerformanceMetric = {
  label: string
  total: string
  change: string
  peak: string
  values: number[]
  previous: number[]
}

const METRICS: Record<MetricKey, PerformanceMetric> = {
  calls: {
    label: 'Calls',
    total: '12,486',
    change: '18.4%',
    peak: '1,842 calls',
    values: [0.42, 0.56, 0.49, 0.67, 0.61, 0.84, 0.96],
    previous: [0.35, 0.45, 0.41, 0.52, 0.58, 0.63, 0.72],
  },
  connected: {
    label: 'Connected',
    total: '8,932',
    change: '12.1%',
    peak: '1,304 answered',
    values: [0.38, 0.44, 0.52, 0.48, 0.65, 0.73, 0.88],
    previous: [0.31, 0.36, 0.42, 0.45, 0.51, 0.58, 0.69],
  },
  messages: {
    label: 'AI messages',
    total: '5,420',
    change: '24.8%',
    peak: '942 messages',
    values: [0.28, 0.39, 0.33, 0.55, 0.62, 0.71, 0.9],
    previous: [0.22, 0.27, 0.3, 0.41, 0.48, 0.55, 0.62],
  },
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function buildPath(values: number[], width = 700, height = 218, top = 16, bottom = 12) {
  const points = values.map((value, index) => ({
    x: (index / (values.length - 1)) * width,
    y: top + (1 - value) * (height - top - bottom),
  }))

  const line = points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`
    const previous = points[index - 1]
    const midX = (previous.x + point.x) / 2
    return `${path} C ${midX} ${previous.y}, ${midX} ${point.y}, ${point.x} ${point.y}`
  }, '')

  return {
    line,
    area: `${line} L ${width} ${height} L 0 ${height} Z`,
  }
}

type PerformanceCardProps = {
  onNotice: (message: string) => void
}

export function PerformanceCard({ onNotice }: PerformanceCardProps) {
  const [metric, setMetric] = useState<MetricKey>('calls')
  const activeMetric = METRICS[metric]
  const currentPath = buildPath(activeMetric.values)
  const previousPath = buildPath(activeMetric.previous)

  return (
    <article className="dashboard-panel performance-panel">
      <div className="panel-heading panel-heading--wrap">
        <div>
          <h2>Call performance</h2>
          <p>Daily outbound activity across your workspace</p>
        </div>
        <div className="metric-tabs" role="tablist" aria-label="Call performance metric">
          {(Object.keys(METRICS) as MetricKey[]).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={metric === key}
              className={metric === key ? 'is-active' : ''}
              onClick={() => setMetric(key)}
            >
              {METRICS[key].label}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-summary">
        <strong>{activeMetric.total}</strong>
        <span className="chart-summary__change">
          <TrendUpIcon />
          {activeMetric.change}
        </span>
        <span className="chart-summary__note">vs last week</span>
      </div>

      <div className="chart-wrap">
        <div className="chart-tooltip" aria-hidden="true">
          <span>Saturday, Oct 17</span>
          <strong>{activeMetric.peak}</strong>
        </div>
        <svg
          className="performance-chart"
          viewBox="0 0 700 218"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="performance-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2ba878" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#2ba878" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[16, 70, 124, 178].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="700"
              y2={y}
              stroke="#e7f2ec"
              strokeDasharray="4 7"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          <path d={currentPath.area} fill="url(#performance-fill)" />
          <path
            d={previousPath.line}
            stroke="#b9d7c8"
            strokeWidth="1.7"
            strokeDasharray="5 6"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={currentPath.line}
            stroke="#16845c"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <div className="chart-axis" aria-hidden="true">
          {DAYS.map((day) => (
            <span key={day} className={day === 'Sat' ? 'is-active' : ''}>
              {day}
            </span>
          ))}
        </div>
      </div>

      <div className="chart-footer">
        <div className="chart-legend">
          <span>
            <i className="chart-legend__current" />
            This week
          </span>
          <span>
            <i className="chart-legend__previous" />
            Last week
          </span>
        </div>
        <button
          type="button"
          className="panel-link"
          onClick={() => onNotice('Detailed analytics is coming in the next build.')}
        >
          View report
          <ArrowUpRightIcon />
        </button>
      </div>
    </article>
  )
}
