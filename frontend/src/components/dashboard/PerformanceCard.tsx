import { useState } from 'react'
import { ArrowUpRightIcon, TrendUpIcon } from './DashboardIcons'
import { SparkIcon } from '../icons'

type MetricKey = 'calls' | 'connected' | 'conversions' | 'heatmap'

type PerformanceMetric = {
  label: string
  total: string
  change: string
  peak: string
  values: number[]
  previous: number[]
  dayValues: { day: string; calls: number; connectRate: string; date: string }[]
}

const METRICS: Record<MetricKey, PerformanceMetric> = {
  calls: {
    label: 'Broadcast Volume',
    total: '12,486',
    change: '18.4%',
    peak: '1,842 delivered (Saturday)',
    values: [0.42, 0.56, 0.49, 0.67, 0.61, 0.84, 0.96],
    previous: [0.35, 0.45, 0.41, 0.52, 0.58, 0.63, 0.72],
    dayValues: [
      { day: 'Mon', calls: 1420, connectRate: '94.2%', date: 'Oct 12' },
      { day: 'Tue', calls: 1680, connectRate: '95.0%', date: 'Oct 13' },
      { day: 'Wed', calls: 1540, connectRate: '93.5%', date: 'Oct 14' },
      { day: 'Thu', calls: 1890, connectRate: '96.4%', date: 'Oct 15' },
      { day: 'Fri', calls: 1780, connectRate: '95.1%', date: 'Oct 16' },
      { day: 'Sat', calls: 2140, connectRate: '98.5%', date: 'Oct 17' },
      { day: 'Sun', calls: 2036, connectRate: '97.8%', date: 'Oct 18' },
    ],
  },
  connected: {
    label: 'Delivered & Read',
    total: '11,840',
    change: '14.2%',
    peak: '1,304 read (Saturday)',
    values: [0.38, 0.44, 0.52, 0.48, 0.65, 0.73, 0.88],
    previous: [0.31, 0.36, 0.42, 0.45, 0.51, 0.58, 0.69],
    dayValues: [
      { day: 'Mon', calls: 968, connectRate: '94.2%', date: 'Oct 12' },
      { day: 'Tue', calls: 1192, connectRate: '95.0%', date: 'Oct 13' },
      { day: 'Wed', calls: 1070, connectRate: '93.5%', date: 'Oct 14' },
      { day: 'Thu', calls: 1387, connectRate: '96.4%', date: 'Oct 15' },
      { day: 'Fri', calls: 1283, connectRate: '95.1%', date: 'Oct 16' },
      { day: 'Sat', calls: 1680, connectRate: '98.5%', date: 'Oct 17' },
      { day: 'Sun', calls: 1564, connectRate: '97.8%', date: 'Oct 18' },
    ],
  },
  conversions: {
    label: 'AI Conversions',
    total: '1,428',
    change: '24.8%',
    peak: '242 leads booked',
    values: [0.28, 0.39, 0.33, 0.55, 0.62, 0.71, 0.9],
    previous: [0.22, 0.27, 0.3, 0.41, 0.48, 0.55, 0.62],
    dayValues: [
      { day: 'Mon', calls: 142, connectRate: '14.7%', date: 'Oct 12' },
      { day: 'Tue', calls: 185, connectRate: '15.5%', date: 'Oct 13' },
      { day: 'Wed', calls: 160, connectRate: '14.9%', date: 'Oct 14' },
      { day: 'Thu', calls: 215, connectRate: '15.5%', date: 'Oct 15' },
      { day: 'Fri', calls: 204, connectRate: '15.9%', date: 'Oct 16' },
      { day: 'Sat', calls: 272, connectRate: '16.2%', date: 'Oct 17' },
      { day: 'Sun', calls: 250, connectRate: '16.0%', date: 'Oct 18' },
    ],
  },
  heatmap: {
    label: 'Peak Windows',
    total: '2:30 PM - 5:00 PM',
    change: '+42% open rate',
    peak: 'Best broadcast window',
    values: [0.35, 0.58, 0.72, 0.92, 0.88, 0.65, 0.48],
    previous: [0.28, 0.45, 0.59, 0.75, 0.72, 0.52, 0.39],
    dayValues: [
      { day: '10 AM', calls: 1840, connectRate: '72.4%', date: 'Morning Peak' },
      { day: '12 PM', calls: 1420, connectRate: '64.1%', date: 'Midday' },
      { day: '2 PM', calls: 2190, connectRate: '81.2%', date: 'Afternoon Surge' },
      { day: '4 PM', calls: 2450, connectRate: '84.8%', date: 'Golden Window' },
      { day: '6 PM', calls: 1890, connectRate: '73.2%', date: 'Evening Drive' },
      { day: '8 PM', calls: 980, connectRate: '58.4%', date: 'Late Evening' },
      { day: '10 PM', calls: 320, connectRate: '42.0%', date: 'Night Cap' },
    ],
  },
}

function buildCurvedPath(values: number[], width = 720, height = 210, top = 18, bottom = 16) {
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
    points,
  }
}

type PerformanceCardProps = {
  onNotice: (message: string) => void
}

export function PerformanceCard({ onNotice }: PerformanceCardProps) {
  const [metric, setMetric] = useState<MetricKey>('calls')
  const [hoveredIdx, setHoveredIdx] = useState<number>(5) // default to Saturday peak

  const activeMetric = METRICS[metric]
  const currentPath = buildCurvedPath(activeMetric.values)
  const previousPath = buildCurvedPath(activeMetric.previous)
  const activeDay = activeMetric.dayValues[hoveredIdx] || activeMetric.dayValues[5]

  return (
    <article className="dashboard-panel performance-panel">
      <div className="panel-heading panel-heading--wrap">
        <div>
          <div className="analytics-kicker">
            <SparkIcon />
            <span>Telemetry &amp; WhatsApp Intelligence</span>
          </div>
          <h2>WhatsApp Performance &amp; Conversion Analytics</h2>
          <p>Real-time broadcast pacing, delivery rates &amp; AI response velocity</p>
        </div>

        <div className="metric-tabs" role="tablist" aria-label="Performance metric views">
          {(Object.keys(METRICS) as MetricKey[]).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={metric === key}
              className={`metric-tab-btn ${metric === key ? 'is-active' : ''}`}
              onClick={() => {
                setMetric(key)
                setHoveredIdx(key === 'heatmap' ? 3 : 5)
              }}
            >
              {METRICS[key].label}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-highlight-bar">
        <div className="chart-stat-primary">
          <span className="stat-label">
            {metric === 'heatmap' ? 'Optimal Calling Window' : `Total ${activeMetric.label}`}
          </span>
          <div className="stat-row">
            <strong>{activeMetric.total}</strong>
            <span className="chart-summary__change">
              <TrendUpIcon />
              {activeMetric.change}
            </span>
            <span className="stat-comparison">vs previous cycle</span>
          </div>
        </div>

        <div className="chart-stat-secondary">
          <div className="active-scrub-card">
            <span className="scrub-date">{activeDay.date} ({activeDay.day})</span>
            <div className="scrub-values">
              <span>Volume: <strong>{activeDay.calls.toLocaleString()}</strong></span>
              <span className="scrub-divider">·</span>
              <span>Pickup Rate: <strong>{activeDay.connectRate}</strong></span>
            </div>
          </div>
        </div>
      </div>

      <div className="chart-wrap">
        <div
          className="chart-scrubber-pill"
          style={{
            left: `${((hoveredIdx) / (activeMetric.values.length - 1)) * 96 + 2}%`,
          }}
          aria-hidden="true"
        >
          <span className="scrubber-dot" />
          <span>{activeDay.day}: {activeDay.calls.toLocaleString()}</span>
        </div>

        <svg
          className="performance-chart"
          viewBox="0 0 720 210"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="performance-curved-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
              <stop offset="50%" stopColor="#059669" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glow-line" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#10b981" floodOpacity="0.35" />
            </filter>
          </defs>

          {[20, 68, 116, 164].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="720"
              y2={y}
              stroke="rgba(16, 185, 129, 0.12)"
              strokeDasharray="4 6"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          <path d={currentPath.area} fill="url(#performance-curved-fill)" />

          <path
            d={previousPath.line}
            stroke="#94a3b8"
            strokeWidth="1.8"
            strokeDasharray="5 6"
            strokeLinecap="round"
            opacity="0.6"
            vectorEffect="non-scaling-stroke"
          />

          <path
            d={currentPath.line}
            stroke="#059669"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow-line)"
            vectorEffect="non-scaling-stroke"
          />

          {currentPath.points.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r={hoveredIdx === idx ? 6 : 4}
              className={`chart-data-point ${hoveredIdx === idx ? 'is-active' : ''}`}
              fill={hoveredIdx === idx ? '#10b981' : '#ffffff'}
              stroke="#059669"
              strokeWidth={hoveredIdx === idx ? 3 : 2}
            />
          ))}
        </svg>

        <div className="chart-interactive-axis" aria-label="Timeline days">
          {activeMetric.dayValues.map((item, index) => (
            <button
              key={item.day}
              type="button"
              className={`axis-scrub-btn ${index === hoveredIdx ? 'is-active' : ''}`}
              onClick={() => setHoveredIdx(index)}
              onMouseEnter={() => setHoveredIdx(index)}
            >
              <span>{item.day}</span>
              <small>{item.calls.toLocaleString()}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="call-breakdown-bar-section">
        <div className="breakdown-header">
          <span>Call Outcome Distribution:</span>
          <strong>71.5% Connected · 15.2% Voicemail · 9.3% Callback · 4.0% Busy</strong>
        </div>
        <div className="segmented-progress-track">
          <span className="segment-bar segment-connected" style={{ width: '71.5%' }} title="71.5% Live Connected" />
          <span className="segment-bar segment-voicemail" style={{ width: '15.2%' }} title="15.2% Voicemail Handled" />
          <span className="segment-bar segment-callback" style={{ width: '9.3%' }} title="9.3% Callback Scheduled" />
          <span className="segment-bar segment-busy" style={{ width: '4.0%' }} title="4.0% Busy/No Answer" />
        </div>
      </div>

      <div className="chart-footer">
        <div className="chart-legend">
          <span>
            <i className="chart-legend__current" />
            Current cycle (71.5% connect)
          </span>
          <span>
            <i className="chart-legend__previous" />
            Previous week
          </span>
        </div>

        <button
          type="button"
          className="panel-link"
          onClick={() => onNotice('Comprehensive campaign analytics exported to CSV.')}
        >
          <span>Deep Analytics Report</span>
          <ArrowUpRightIcon />
        </button>
      </div>
    </article>
  )
}
