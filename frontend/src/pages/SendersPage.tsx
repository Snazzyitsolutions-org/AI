import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ComponentType } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../components/dashboard/DashboardLayout'
import { Toast } from '../components/dashboard/Toast'
import {
  ArrowUpRightIcon,
  BellIcon,
  CheckCircleIcon,
  ClockIcon,
  CloseIcon,
  CopyIcon,
  DownloadIcon,
  GlobeIcon,
  HeadsetIcon,
  MegaphoneIcon,
  PauseIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  SendIcon,
  SlidersIcon,
  TrendUpIcon,
  WhatsAppIcon,
} from '../components/dashboard/DashboardIcons'
import { RechargeCreditsModal } from '../components/dashboard/RechargeCreditsModal'
import { ShieldCheckIcon, SparkIcon } from '../components/icons'
import { usePageTitle } from '../lib/usePageTitle'

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type SenderStatus = 'online' | 'pending' | 'restricted' | 'offline'
type QualityRating = 'high' | 'medium' | 'low'
type Tier = 'High-Priority' | 'Standard' | 'Bulk'
type FilterTab = 'all' | 'online' | 'pending' | 'attention'
type SortKey = 'health' | 'messages' | 'name'

export interface Sender {
  id: string
  name: string
  number: string
  country: string
  flag: string
  category: string
  status: SenderStatus
  quality: QualityRating
  tier: Tier
  messagingLimit: string
  sent24h: number
  deliveryRate: number
  readRate: number
  replies: number
  latencyMs: number
  health: number
  creditsPct: number
  assignedCampaigns: number
  webhook: string
  lastSync: string
}

/* -------------------------------------------------------------------------- */
/*  Static data                                                               */
/* -------------------------------------------------------------------------- */

const SENDERS: Sender[] = [
  {
    id: 'snd-01',
    name: 'Sales India · Primary',
    number: '+91 98200 11223',
    country: 'India',
    flag: '🇮🇳',
    category: 'MARKETING',
    status: 'online',
    quality: 'high',
    tier: 'High-Priority',
    messagingLimit: 'Unlimited',
    sent24h: 12480,
    deliveryRate: 99.4,
    readRate: 81.2,
    replies: 940,
    latencyMs: 38,
    health: 98,
    creditsPct: 64,
    assignedCampaigns: 6,
    webhook: 'https://api.callwave.io/hooks/snd-01',
    lastSync: '12 sec ago',
  },
  {
    id: 'snd-02',
    name: 'Support Helpdesk',
    number: '+91 98200 33445',
    country: 'India',
    flag: '🇮🇳',
    category: 'UTILITY',
    status: 'online',
    quality: 'high',
    tier: 'High-Priority',
    messagingLimit: 'Unlimited',
    sent24h: 8210,
    deliveryRate: 99.1,
    readRate: 88.7,
    replies: 1620,
    latencyMs: 41,
    health: 97,
    creditsPct: 71,
    assignedCampaigns: 3,
    webhook: 'https://api.callwave.io/hooks/snd-02',
    lastSync: '18 sec ago',
  },
  {
    id: 'snd-03',
    name: 'Dubai Growth Line',
    number: '+971 50 447 8890',
    country: 'UAE',
    flag: '🇦🇪',
    category: 'MARKETING',
    status: 'online',
    quality: 'high',
    tier: 'Standard',
    messagingLimit: '100K / 24h',
    sent24h: 6240,
    deliveryRate: 98.6,
    readRate: 76.4,
    replies: 410,
    latencyMs: 52,
    health: 94,
    creditsPct: 58,
    assignedCampaigns: 4,
    webhook: 'https://api.callwave.io/hooks/snd-03',
    lastSync: '26 sec ago',
  },
  {
    id: 'snd-04',
    name: 'US Enterprise Desk',
    number: '+1 (415) 555-0182',
    country: 'United States',
    flag: '🇺🇸',
    category: 'UTILITY',
    status: 'online',
    quality: 'high',
    tier: 'High-Priority',
    messagingLimit: 'Unlimited',
    sent24h: 5120,
    deliveryRate: 99.6,
    readRate: 84.1,
    replies: 720,
    latencyMs: 46,
    health: 96,
    creditsPct: 62,
    assignedCampaigns: 5,
    webhook: 'https://api.callwave.io/hooks/snd-04',
    lastSync: '9 sec ago',
  },
  {
    id: 'snd-05',
    name: 'Singapore APAC Broadcast',
    number: '+65 8123 4567',
    country: 'Singapore',
    flag: '🇸🇬',
    category: 'MARKETING',
    status: 'online',
    quality: 'medium',
    tier: 'Bulk',
    messagingLimit: '100K / 24h',
    sent24h: 9480,
    deliveryRate: 96.2,
    readRate: 68.9,
    replies: 290,
    latencyMs: 88,
    health: 79,
    creditsPct: 23,
    assignedCampaigns: 2,
    webhook: 'https://api.callwave.io/hooks/snd-05',
    lastSync: '1 min ago',
  },
  {
    id: 'snd-06',
    name: 'UK Compliance Alerts',
    number: '+44 7700 900123',
    country: 'United Kingdom',
    flag: '🇬🇧',
    category: 'AUTHENTICATION',
    status: 'online',
    quality: 'high',
    tier: 'Standard',
    messagingLimit: '100K / 24h',
    sent24h: 3110,
    deliveryRate: 99.8,
    readRate: 92.3,
    replies: 40,
    latencyMs: 35,
    health: 99,
    creditsPct: 77,
    assignedCampaigns: 1,
    webhook: 'https://api.callwave.io/hooks/snd-06',
    lastSync: '14 sec ago',
  },
  {
    id: 'snd-07',
    name: 'Brazil Retail Pilot',
    number: '+55 11 91234-5678',
    country: 'Brazil',
    flag: '🇧🇷',
    category: 'MARKETING',
    status: 'restricted',
    quality: 'low',
    tier: 'Bulk',
    messagingLimit: '10K / 24h',
    sent24h: 2760,
    deliveryRate: 88.4,
    readRate: 51.2,
    replies: 96,
    latencyMs: 142,
    health: 54,
    creditsPct: 18,
    assignedCampaigns: 2,
    webhook: 'https://api.callwave.io/hooks/snd-07',
    lastSync: '3 min ago',
  },
  {
    id: 'snd-08',
    name: 'Mumbai Renewals',
    number: '+91 90040 77881',
    country: 'India',
    flag: '🇮🇳',
    category: 'UTILITY',
    status: 'online',
    quality: 'medium',
    tier: 'Standard',
    messagingLimit: '100K / 24h',
    sent24h: 4380,
    deliveryRate: 97.1,
    readRate: 73.8,
    replies: 310,
    latencyMs: 64,
    health: 86,
    creditsPct: 41,
    assignedCampaigns: 3,
    webhook: 'https://api.callwave.io/hooks/snd-08',
    lastSync: '31 sec ago',
  },
  {
    id: 'snd-09',
    name: 'Berlin DACH Outreach',
    number: '+49 151 23456789',
    country: 'Germany',
    flag: '🇩🇪',
    category: 'MARKETING',
    status: 'pending',
    quality: 'medium',
    tier: 'Standard',
    messagingLimit: '1K / 24h',
    sent24h: 0,
    deliveryRate: 0,
    readRate: 0,
    replies: 0,
    latencyMs: 0,
    health: 62,
    creditsPct: 88,
    assignedCampaigns: 0,
    webhook: 'Not configured',
    lastSync: 'Awaiting verification',
  },
  {
    id: 'snd-10',
    name: 'Canada BFSI Retargeting',
    number: '+1 (647) 555-0149',
    country: 'Canada',
    flag: '🇨🇦',
    category: 'MARKETING',
    status: 'pending',
    quality: 'medium',
    tier: 'Standard',
    messagingLimit: '1K / 24h',
    sent24h: 0,
    deliveryRate: 0,
    readRate: 0,
    replies: 0,
    latencyMs: 0,
    health: 58,
    creditsPct: 92,
    assignedCampaigns: 0,
    webhook: 'Not configured',
    lastSync: 'Awaiting verification',
  },
  {
    id: 'snd-11',
    name: 'Sydney Onboarding',
    number: '+61 412 345 678',
    country: 'Australia',
    flag: '🇦🇺',
    category: 'UTILITY',
    status: 'online',
    quality: 'high',
    tier: 'Standard',
    messagingLimit: '100K / 24h',
    sent24h: 1980,
    deliveryRate: 98.9,
    readRate: 79.6,
    replies: 150,
    latencyMs: 71,
    health: 93,
    creditsPct: 55,
    assignedCampaigns: 2,
    webhook: 'https://api.callwave.io/hooks/snd-11',
    lastSync: '44 sec ago',
  },
  {
    id: 'snd-12',
    name: 'Nairobi Field Sales',
    number: '+254 712 345678',
    country: 'Kenya',
    flag: '🇰🇪',
    category: 'MARKETING',
    status: 'offline',
    quality: 'medium',
    tier: 'Bulk',
    messagingLimit: '10K / 24h',
    sent24h: 1240,
    deliveryRate: 94.3,
    readRate: 61.5,
    replies: 84,
    latencyMs: 168,
    health: 68,
    creditsPct: 12,
    assignedCampaigns: 1,
    webhook: 'https://api.callwave.io/hooks/snd-12',
    lastSync: '2 hours ago',
  },
]

const STATUS_META: Record<
  SenderStatus,
  { label: string; dot: string; pill: string; ring: string }
> = {
  online: {
    label: 'Online',
    dot: 'bg-emerald-500',
    pill: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    ring: 'ring-emerald-500/25',
  },
  pending: {
    label: 'Pending verification',
    dot: 'bg-amber-500',
    pill: 'bg-amber-50 text-amber-700 border-amber-200/80',
    ring: 'ring-amber-500/25',
  },
  restricted: {
    label: 'Quality flag',
    dot: 'bg-rose-500',
    pill: 'bg-rose-50 text-rose-700 border-rose-200/80',
    ring: 'ring-rose-500/25',
  },
  offline: {
    label: 'Offline',
    dot: 'bg-slate-400',
    pill: 'bg-slate-100 text-slate-600 border-slate-200/80',
    ring: 'ring-slate-400/25',
  },
}

const QUALITY_META: Record<QualityRating, { label: string; bar: string; text: string; bg: string }> = {
  high: { label: 'High', bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200/70' },
  medium: { label: 'Medium', bar: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200/70' },
  low: { label: 'Low', bar: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50 border-rose-200/70' },
}

const TIER_META: Record<Tier, string> = {
  'High-Priority': 'bg-emerald-600/10 text-emerald-800 border-emerald-200',
  Standard: 'bg-sky-50 text-sky-700 border-sky-200',
  Bulk: 'bg-slate-100 text-slate-600 border-slate-200',
}

const KPI_TONES = {
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  teal: 'bg-teal-50 text-teal-600 border-teal-100',
  sky: 'bg-sky-50 text-sky-600 border-sky-100',
  amber: 'bg-amber-50 text-amber-600 border-amber-100',
} as const

function formatCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`
  return String(value)
}

/* -------------------------------------------------------------------------- */
/*  Small building blocks                                                     */
/* -------------------------------------------------------------------------- */

function StatusBadge({ status }: { status: SenderStatus }) {
  const meta = STATUS_META[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10.5px] font-bold whitespace-nowrap ${meta.pill}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {status === 'online' && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${meta.dot} opacity-70`} />
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${meta.dot}`} />
      </span>
      {meta.label}
    </span>
  )
}

function HealthRing({ health, size = 44 }: { health: number; size?: number }) {
  const color = health >= 90 ? '#10b981' : health >= 75 ? '#f59e0b' : '#f43f5e'
  return (
    <div
      className="relative flex items-center justify-center rounded-full shrink-0 shadow-2xs"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${color} 0% ${health}%, #e2e8f0 ${health}% 100%)`,
      }}
    >
      <div className="absolute inset-[3px] rounded-full bg-white flex items-center justify-center">
        <span className="text-[10px] font-extrabold text-slate-800 tabular-nums">{Math.round(health)}</span>
      </div>
    </div>
  )
}

function MicroBar({ value, className }: { value: number; className: string }) {
  return (
    <div className="w-full h-1 rounded-full bg-slate-100 overflow-hidden">
      <div
        className={`h-full rounded-full ${className}`}
        style={{ width: `${Math.max(2, Math.min(100, value))}%` }}
      />
    </div>
  )
}

const KPI_BARS = {
  emerald: 'from-emerald-500 to-teal-500',
  teal: 'from-teal-500 to-cyan-500',
  sky: 'from-sky-500 to-indigo-500',
  amber: 'from-amber-400 to-orange-500',
} as const

function KpiCard({
  title,
  value,
  unit,
  footer,
  trend,
  icon: Icon,
  tone,
  progress,
}: {
  title: string
  value: string
  unit: string
  footer: string
  trend: string
  icon: ComponentType<{ className?: string }>
  tone: keyof typeof KPI_TONES
  progress: number
}) {
  const negative = trend.startsWith('-')
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/95 border border-slate-200/80 hover:border-emerald-300/80 p-4 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
      <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${KPI_BARS[tone]} opacity-70`} />
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600">{title}</span>
        <span
          className={`w-8 h-8 rounded-xl border flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform ${KPI_TONES[tone]}`}
        >
          <Icon className="w-4 h-4" />
        </span>
      </div>
      <div className="mt-2.5 flex items-baseline gap-1.5 flex-wrap">
        <strong className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
          {value}
        </strong>
        <span className="text-xs font-medium text-slate-500">{unit}</span>
      </div>
      <div className="mt-2.5 w-full h-1 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${KPI_BARS[tone]} transition-all duration-700`}
          style={{ width: `${Math.max(4, Math.min(100, progress))}%` }}
        />
      </div>
      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px]">
        <span className="text-slate-500 truncate">{footer}</span>
        <span
          className={`inline-flex items-center gap-1 font-bold px-1.5 py-0.5 rounded-md shrink-0 ${negative ? 'text-emerald-700 bg-emerald-50' : 'text-emerald-700 bg-emerald-50'
            }`}
        >
          <TrendUpIcon className={`w-3 h-3 ${negative ? 'rotate-180' : ''}`} />
          {trend.replace('-', '')}
        </span>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Fleet infographic card                                                    */
/* -------------------------------------------------------------------------- */

const PHONE_LAYOUT = [
  { top: 6, right: 2, status: 'online' as SenderStatus },
  { top: 30, right: 8, status: 'online' as SenderStatus },
  { top: 54, right: 2, status: 'online' as SenderStatus },
  { top: 78, right: 8, status: 'pending' as SenderStatus },
  { top: 18, left: 0, status: 'online' as SenderStatus },
  { top: 42, left: 6, status: 'online' as SenderStatus },
  { top: 66, left: 0, status: 'restricted' as SenderStatus },
  { top: 2, left: 8, status: 'online' as SenderStatus },
]

function FleetCard({ senders }: { senders: Sender[] }) {
  const online = senders.filter((s) => s.status === 'online').length
  const pending = senders.filter((s) => s.status === 'pending').length
  const attention = senders.filter((s) => s.status === 'restricted' || s.status === 'offline').length
  const segments = [
    { label: 'Healthy', count: online, bar: 'bg-emerald-500', text: 'text-emerald-700' },
    { label: 'Pending', count: pending, bar: 'bg-amber-500', text: 'text-amber-700' },
    { label: 'Needs attention', count: attention, bar: 'bg-rose-500', text: 'text-rose-700' },
  ]
  const fleetHealth = Math.round(
    senders.reduce((sum, s) => sum + s.health, 0) / Math.max(1, senders.length),
  )
  const healthLabel = fleetHealth >= 90 ? 'Excellent' : fleetHealth >= 75 ? 'Stable' : 'At risk'

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#07281f] text-white p-5 sm:p-6 shadow-stripe border border-emerald-900/40 h-full">
      <div className="absolute -top-24 -right-16 w-64 h-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-28 -left-16 w-64 h-64 rounded-full bg-teal-400/15 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col gap-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-400/15 border border-emerald-400/30 text-emerald-200 text-[10px] font-bold uppercase tracking-wider">
              <ShieldCheckIcon className="w-3 h-3" />
              Meta Cloud API · v21.0
            </div>
            <h2 className="mt-2 text-lg sm:text-xl font-extrabold tracking-tight">
              {senders.length} senders connected
            </h2>
          </div>

          <div className="shrink-0 rounded-2xl bg-white/[0.06] border border-white/10 px-3 py-2 text-right">
            <span className="block text-[8.5px] font-bold uppercase tracking-widest text-emerald-200/60">
              Fleet health
            </span>
            <span className="block text-xl font-extrabold tabular-nums leading-tight">
              {fleetHealth}
              <span className="text-[10px] text-emerald-200/50 font-bold">/100</span>
            </span>
            <span className="text-[9.5px] font-bold text-emerald-300">{healthLabel}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          {/* Phone cluster graphic */}
          <div className="relative w-[200px] h-[140px] sm:w-[220px] sm:h-[150px] shrink-0 mx-auto sm:mx-0">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-emerald-400/30 animate-radar-spin" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full border border-dashed border-emerald-400/15" />

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[76px] h-[112px] rounded-[16px] bg-gradient-to-br from-emerald-400 to-teal-600 p-[2px] shadow-lg shadow-emerald-500/30">
              <div className="w-full h-full rounded-[14px] bg-[#07281f] flex flex-col items-center justify-center gap-1.5 border border-emerald-300/20">
                <WhatsAppIcon className="w-6 h-6 text-emerald-300" />
                <span className="text-[15px] font-extrabold leading-none">{online}</span>
                <span className="text-[7.5px] font-bold uppercase tracking-widest text-emerald-200/70">
                  Online
                </span>
              </div>
            </div>

            {PHONE_LAYOUT.map((pos, index) => {
              const meta = STATUS_META[pos.status]
              return (
                <div
                  key={index}
                  className={`absolute w-6 h-8 rounded-[5px] bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center animate-float-slow`}
                  style={{
                    top: `${pos.top}%`,
                    ...(pos.right !== undefined ? { right: `${pos.right}%` } : {}),
                    ...(pos.left !== undefined ? { left: `${pos.left}%` } : {}),
                    animationDelay: `${index * 0.35}s`,
                  }}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                </div>
              )
            })}
          </div>

          {/* Copy + segmented distribution */}
          <div className="flex-1 min-w-0 w-full">
            <p className="text-[11.5px] text-emerald-100/70 leading-relaxed max-w-md">
              Every number is routed through the Cloud API with automatic reputation monitoring,
              smart throttling and failover across your sender pools.
            </p>

            <div className="mt-4 flex h-2 w-full overflow-hidden rounded-full bg-white/10">
              {segments.map((segment) => (
                <div
                  key={segment.label}
                  className={`${segment.bar} h-full border-r border-[#07281f]/40 last:border-r-0`}
                  style={{ width: `${(segment.count / Math.max(1, senders.length)) * 100}%` }}
                />
              ))}
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1">
              {segments.map((segment) => (
                <span key={segment.label} className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-emerald-100/80">
                  <span className={`w-1.5 h-1.5 rounded-full ${segment.bar}`} />
                  {segment.label}
                  <strong className="text-white font-extrabold">{segment.count}</strong>
                </span>
              ))}
              <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-emerald-100/80 ml-auto">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                </span>
                42ms avg latency
              </span>
            </div>
          </div>
        </div>

        {/* Footer metrics strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: 'Messages 24h', value: senders.reduce((sum, s) => sum + s.sent24h, 0).toLocaleString('en-US') },
            { label: 'Fleet health', value: `${fleetHealth}%` },
            { label: 'Online now', value: `${online}/${senders.length}` },
            { label: 'Peak capacity', value: `${Math.round((online / Math.max(1, senders.length)) * 100)}%` },
          ].map((metric) => (
            <div
              key={metric.label}
              className="rounded-xl bg-white/[0.06] border border-white/10 px-2.5 py-2 min-w-0"
            >
              <span className="block text-[8.5px] font-bold uppercase tracking-widest text-emerald-200/60 truncate">
                {metric.label}
              </span>
              <strong className="block text-sm font-extrabold tabular-nums text-white truncate">
                {metric.value}
              </strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Sender row detail drawer                                                  */
/* -------------------------------------------------------------------------- */

function SenderDrawer({
  sender,
  onClose,
  onNotify,
  onToggleStatus,
}: {
  sender: Sender
  onClose: () => void
  onNotify: (message: string) => void
  onToggleStatus: (id: string) => void
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const connected = sender.status === 'online' || sender.status === 'restricted'

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close sender details"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-default border-none"
      />

      <aside
        className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sender-drawer-title"
      >
        <header className="relative bg-[#07281f] text-white px-5 py-5 shrink-0 overflow-hidden">
          <div className="absolute -top-16 -right-10 w-48 h-48 rounded-full bg-emerald-500/25 blur-3xl" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-11 h-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                <WhatsAppIcon className="w-6 h-6 text-emerald-300" />
              </span>
              <div className="min-w-0">
                <span className="block text-[9.5px] uppercase tracking-widest font-bold text-emerald-200/70">
                  {sender.category} · {sender.tier}
                </span>
                <h2 id="sender-drawer-title" className="text-lg font-extrabold tracking-tight truncate">
                  {sender.name}
                </h2>
                <p className="text-xs text-emerald-100/80 font-mono">
                  {sender.flag} {sender.number}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close panel"
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="relative mt-4 grid grid-cols-3 gap-2">
            {[
              { label: 'Messages 24h', value: formatCompact(sender.sent24h) },
              { label: 'Delivery', value: `${sender.deliveryRate}%` },
              { label: 'Read rate', value: `${sender.readRate}%` },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-white/10 border border-white/10 px-2.5 py-2">
                <span className="block text-[9px] uppercase tracking-wider font-bold text-emerald-200/70">
                  {stat.label}
                </span>
                <strong className="text-sm font-extrabold tabular-nums">{stat.value}</strong>
              </div>
            ))}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800">Reputation health</span>
              <StatusBadge status={sender.status} />
            </div>
            <div className="flex items-center gap-4">
              <HealthRing health={sender.health} size={56} />
              <div className="flex-1 space-y-2">
                <div>
                  <div className="flex items-center justify-between text-[10.5px] font-semibold text-slate-500 mb-1">
                    <span>Quality rating</span>
                    <span className={QUALITY_META[sender.quality].text}>
                      {QUALITY_META[sender.quality].label}
                    </span>
                  </div>
                  <MicroBar value={sender.quality === 'high' ? 96 : sender.quality === 'medium' ? 68 : 32} className={QUALITY_META[sender.quality].bar} />
                </div>
                <div>
                  <div className="flex items-center justify-between text-[10.5px] font-semibold text-slate-500 mb-1">
                    <span>Template credits</span>
                    <span className="text-slate-700">{sender.creditsPct}%</span>
                  </div>
                  <MicroBar
                    value={sender.creditsPct}
                    className={sender.creditsPct < 30 ? 'bg-rose-500' : sender.creditsPct < 60 ? 'bg-amber-500' : 'bg-emerald-500'}
                  />
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">
              Configuration
            </h3>
            <dl className="rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
              {[
                ['Display number', `${sender.flag} ${sender.number}`],
                ['Country', sender.country],
                ['Messaging limit', sender.messagingLimit],
                ['Tier', sender.tier],
                ['Assigned campaigns', String(sender.assignedCampaigns)],
                ['Avg. latency', sender.latencyMs ? `${sender.latencyMs} ms` : '—'],
                ['Replies (24h)', formatCompact(sender.replies)],
                ['Last sync', sender.lastSync],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs">
                  <dt className="text-slate-500 font-medium">{label}</dt>
                  <dd className="font-semibold text-slate-900 text-right truncate">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section>
            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">
              Webhook endpoint
            </h3>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
              <GlobeIcon className="w-4 h-4 text-slate-400 shrink-0" />
              <code className="flex-1 text-[11px] text-slate-700 font-mono truncate">{sender.webhook}</code>
              <button
                type="button"
                onClick={() => {
                  if (sender.webhook.startsWith('http')) {
                    navigator.clipboard?.writeText(sender.webhook).catch(() => { })
                  }
                  onNotify('Webhook URL copied to clipboard')
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                aria-label="Copy webhook URL"
              >
                <CopyIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>
        </div>

        <footer className="shrink-0 border-t border-slate-200 bg-white p-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleStatus(sender.id)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all"
          >
            {connected ? 'Pause sender' : 'Reconnect sender'}
          </button>
          <button
            type="button"
            onClick={() => onNotify(`Renaming ${sender.name} — coming next.`)}
            className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            Rename
          </button>
          <button
            type="button"
            onClick={() => onNotify('Sender configuration is coming next.')}
            className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            Settings
          </button>
        </footer>
      </aside>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Connect sender modal                                                      */
/* -------------------------------------------------------------------------- */

function ConnectSenderModal({
  onClose,
  onConnect,
}: {
  onClose: () => void
  onConnect: (name: string, number: string) => void
}) {
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [category, setCategory] = useState('MARKETING')
  const [tier, setTier] = useState<Tier>('Standard')

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim() || !number.trim()) return
    onConnect(name.trim(), number.trim())
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 p-5 sm:p-6 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="connect-sender-title"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
              <WhatsAppIcon className="w-5 h-5" />
            </span>
            <div>
              <h2 id="connect-sender-title" className="text-base font-extrabold text-slate-900 tracking-tight">
                Connect a WhatsApp sender
              </h2>
              <p className="text-[11px] text-slate-500">
                Verified numbers get approved by Meta in ~2 minutes.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5 space-y-3.5">
          <label className="block">
            <span className="block text-[11px] font-bold text-slate-600 mb-1">Sender name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sales India · Primary"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-slate-900 transition-all placeholder:text-slate-400"
            />
          </label>

          <label className="block">
            <span className="block text-[11px] font-bold text-slate-600 mb-1">WhatsApp number</span>
            <input
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="+91 98200 11223"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-slate-900 font-mono transition-all placeholder:text-slate-400"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-[11px] font-bold text-slate-600 mb-1">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:border-emerald-500 outline-none cursor-pointer"
              >
                <option>MARKETING</option>
                <option>UTILITY</option>
                <option>AUTHENTICATION</option>
              </select>
            </label>
            <label className="block">
              <span className="block text-[11px] font-bold text-slate-600 mb-1">Tier</span>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as Tier)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:border-emerald-500 outline-none cursor-pointer"
              >
                <option>Standard</option>
                <option>High-Priority</option>
                <option>Bulk</option>
              </select>
            </label>
          </div>

          <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/60 px-3.5 py-2.5 flex items-start gap-2">
            <ShieldCheckIcon className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-900/80 leading-relaxed">
              We'll trigger a Meta verification code to this number. Keep the SIM handy — senders
              stay in <strong className="font-bold">Pending</strong> until it's confirmed.
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim() || !number.trim()}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Send verification code
          </button>
        </div>
      </form>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export function SendersPage() {
  usePageTitle('WhatsApp Senders · CallWave')
  const navigate = useNavigate()

  const [senders, setSenders] = useState<Sender[]>(SENDERS)
  const [globalSearch, setGlobalSearch] = useState('')
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [qualityFilter, setQualityFilter] = useState<'all' | QualityRating>('all')
  const [sortKey, setSortKey] = useState<SortKey>('health')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [connectOpen, setConnectOpen] = useState(false)
  const [rechargeOpen, setRechargeOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [lastSync, setLastSync] = useState(() => new Date())

  const notify = useCallback((message: string) => setToast(message), [])
  const closeToast = useCallback(() => setToast(null), [])

  const stats = useMemo(() => {
    const online = senders.filter((s) => s.status === 'online').length
    const pending = senders.filter((s) => s.status === 'pending').length
    const totalSent = senders.reduce((sum, s) => sum + s.sent24h, 0)
    const latencies = senders.filter((s) => s.latencyMs > 0).map((s) => s.latencyMs)
    const avgLatency = latencies.length
      ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
      : 0
    const avgDelivery = senders.filter((s) => s.sent24h > 0)
    const delivery = avgDelivery.length
      ? avgDelivery.reduce((sum, s) => sum + s.deliveryRate, 0) / avgDelivery.length
      : 0
    const replies = senders.reduce((sum, s) => sum + s.replies, 0)
    const creditsLeft = senders.reduce((sum, s) => sum + s.creditsPct, 0) / Math.max(1, senders.length)
    return { online, pending, totalSent, avgLatency, delivery, replies, creditsLeft }
  }, [senders])

  const counts = useMemo(
    () => ({
      all: senders.length,
      online: senders.filter((s) => s.status === 'online').length,
      pending: senders.filter((s) => s.status === 'pending').length,
      attention: senders.filter((s) => s.status === 'restricted' || s.status === 'offline').length,
    }),
    [senders],
  )

  const visibleSenders = useMemo(() => {
    const query = search.trim().toLowerCase()

    const filtered = senders.filter((sender) => {
      if (activeTab === 'online' && sender.status !== 'online') return false
      if (activeTab === 'pending' && sender.status !== 'pending') return false
      if (activeTab === 'attention' && sender.status !== 'restricted' && sender.status !== 'offline')
        return false
      if (qualityFilter !== 'all' && sender.quality !== qualityFilter) return false

      if (!query) return true
      return (
        sender.name.toLowerCase().includes(query) ||
        sender.number.toLowerCase().includes(query) ||
        sender.country.toLowerCase().includes(query) ||
        sender.category.toLowerCase().includes(query)
      )
    })

    return [...filtered].sort((a, b) => {
      if (sortKey === 'messages') return b.sent24h - a.sent24h
      if (sortKey === 'name') return a.name.localeCompare(b.name)
      return b.health - a.health
    })
  }, [senders, activeTab, qualityFilter, search, sortKey])

  const selectedSender = senders.find((s) => s.id === selectedId) ?? null

  const topSenders = useMemo(
    () =>
      [...senders]
        .filter((s) => s.sent24h > 0)
        .sort((a, b) => b.health - a.health || b.sent24h - a.sent24h)
        .slice(0, 5),
    [senders],
  )

  function handleToggleStatus(id: string) {
    setSenders((prev) =>
      prev.map((sender) => {
        if (sender.id !== id) return sender
        const paused = sender.status === 'online' || sender.status === 'restricted'
        notify(paused ? `${sender.name} paused.` : `${sender.name} reconnected.`)
        return {
          ...sender,
          status: paused ? 'offline' : 'online',
          health: paused ? Math.max(45, sender.health - 10) : Math.min(99, sender.health + 8),
        }
      }),
    )
  }

  function handleConnect(name: string, number: string) {
    const newSender: Sender = {
      id: `snd-${Date.now()}`,
      name,
      number,
      country: 'Pending lookup',
      flag: '🌐',
      category: 'MARKETING',
      status: 'pending',
      quality: 'medium',
      tier: 'Standard',
      messagingLimit: '1K / 24h',
      sent24h: 0,
      deliveryRate: 0,
      readRate: 0,
      replies: 0,
      latencyMs: 0,
      health: 60,
      creditsPct: 100,
      assignedCampaigns: 0,
      webhook: 'Not configured',
      lastSync: 'Awaiting verification',
    }
    setSenders((prev) => [newSender, ...prev])
    setConnectOpen(false)
    notify(`Verification code sent to ${number}`)
  }

  function handleSync() {
    setLastSync(new Date())
    notify(`Synced ${senders.length} senders with Meta Cloud API.`)
  }

  function handleExport() {
    const header =
      'Sender Name,Number,Country,Category,Status,Quality,Tier,Sent 24h,Delivery %,Read %,Replies,Latency (ms),Health\n'
    const rows = visibleSenders
      .map(
        (s) =>
          `"${s.name}","${s.number}","${s.country}","${s.category}","${s.status}","${s.quality}","${s.tier}",${s.sent24h},${s.deliveryRate},${s.readRate},${s.replies},${s.latencyMs},${s.health}`,
      )
      .join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'callwave-senders.csv'
    link.click()
    URL.revokeObjectURL(url)
    notify('Sender report exported as CSV')
  }

  const tabs: { id: FilterTab; label: string; count: number; tone?: string }[] = [
    { id: 'all', label: 'All senders', count: counts.all },
    { id: 'online', label: 'Online', count: counts.online },
    { id: 'pending', label: 'Pending', count: counts.pending },
    { id: 'attention', label: 'Needs attention', count: counts.attention },
  ]

  return (
    <DashboardLayout
      search={globalSearch}
      activeNav="numbers"
      searchPlaceholder="Search senders, numbers, countries…"
      onSearchChange={setGlobalSearch}
      onNotice={notify}
      onNewCampaign={() => navigate('/campaigns')}
    >
      <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6 text-slate-900">
        {/* 1. Header */}
        <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-200/70 p-4 sm:p-5 shadow-[0_10px_30px_-15px_rgba(15,80,55,0.06),0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="absolute -top-32 -right-28 w-80 h-80 bg-gradient-to-br from-emerald-400/20 via-teal-300/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-36 -left-24 w-80 h-80 bg-gradient-to-tr from-teal-400/10 via-emerald-200/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/90 border border-emerald-200/70 text-emerald-800 font-semibold shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                {stats.online} of {senders.length} live
              </span>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 border border-slate-200/80 text-slate-700 font-medium shadow-2xs">
                <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                Meta Cloud API v21.0
              </span>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 border border-slate-200/80 text-slate-700 font-medium shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="tabular-nums">{stats.avgLatency} ms avg latency</span>
              </span>

              {counts.attention > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('attention')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 font-semibold shadow-2xs hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  {counts.attention} need attention
                </button>
              )}

              <span className="hidden md:inline-flex items-center gap-1 ml-auto text-slate-400 font-medium whitespace-nowrap">
                Synced
                <span className="text-slate-600 font-semibold font-mono">
                  {lastSync.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">
                  WhatsApp{' '}
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
                    Senders
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5 max-w-2xl leading-relaxed">
                  Manage every business number, monitor reputation quality, and route campaigns
                  across your sender pools — all from one console.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
                <button
                  type="button"
                  onClick={handleSync}
                  className="group px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs hover:border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshIcon className="w-4 h-4 text-slate-500 group-hover:text-emerald-600 group-hover:rotate-90 transition-all duration-300" />
                  Sync
                </button>
                <button
                  type="button"
                  onClick={handleExport}
                  className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs hover:border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <DownloadIcon className="w-4 h-4 text-slate-500" />
                  Export
                </button>
                <button
                  type="button"
                  onClick={() => setConnectOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusIcon className="w-4 h-4" />
                  Connect sender
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 2. KPI strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
          <KpiCard
            title="Active senders"
            value={String(stats.online)}
            unit={`of ${senders.length} online`}
            footer={`${counts.pending} awaiting Meta verification`}
            trend="+2 this week"
            icon={WhatsAppIcon}
            tone="emerald"
            progress={(stats.online / Math.max(1, senders.length)) * 100}
          />
          <KpiCard
            title="Messages sent (24h)"
            value={formatCompact(stats.totalSent)}
            unit="msgs"
            footer={`${formatCompact(stats.replies)} replies received`}
            trend="+12.4%"
            icon={SendIcon}
            tone="sky"
            progress={88}
          />
          <KpiCard
            title="Avg. delivery rate"
            value={`${stats.delivery.toFixed(1)}%`}
            unit="delivered"
            footer="Weighted across active senders"
            trend="+0.8%"
            icon={CheckCircleIcon}
            tone="teal"
            progress={stats.delivery}
          />
          <KpiCard
            title="Avg. webhook latency"
            value={String(stats.avgLatency)}
            unit="ms"
            footer="p95 under 120 ms"
            trend="-6ms"
            icon={ClockIcon}
            tone="amber"
            progress={Math.min(100, (stats.avgLatency / 120) * 100)}
          />
        </div>

        {/* 3. Fleet overview + credit guardrails */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            <FleetCard senders={senders} />
          </div>

          <div className="rounded-3xl bg-white border border-slate-200/90 p-5 shadow-stripe flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                    <SparkIcon className="w-3.5 h-3.5" />
                  </span>
                  Template credits
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                  <span className="w-1 h-1 rounded-full bg-emerald-500" />
                  Pro pool
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                Shared pool for marketing templates across all senders. Low-credit numbers pause
                automatically.
              </p>

              <div className="mt-4 flex items-end justify-between gap-2">
                <div className="flex items-baseline gap-1">
                  <strong className="text-3xl font-extrabold tracking-tight tabular-nums">3,400</strong>
                  <span className="text-xs text-slate-400 font-semibold">/ 5,000</span>
                </div>
                <span className="text-[10.5px] font-bold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                  68% used
                </span>
              </div>
              <div className="mt-2 w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                  style={{ width: '68%' }}
                />
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[10px] font-semibold text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Used 3,400
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  Left 1,600
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-slate-400">
                  Low credit alerts
                </span>
                <span className="text-[10px] font-bold text-rose-700">
                  {senders.filter((s) => s.creditsPct < 30).length} senders
                </span>
              </div>

              <ul className="mt-2 space-y-1.5">
                {senders
                  .filter((s) => s.creditsPct < 30)
                  .sort((a, b) => a.creditsPct - b.creditsPct)
                  .map((s) => (
                    <li
                      key={s.id}
                      className="group rounded-xl border border-rose-200/70 bg-rose-50/60 hover:bg-rose-50 px-2.5 py-2 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedId(s.id)}
                          className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-900 truncate text-left hover:underline cursor-pointer"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                          <span aria-hidden>{s.flag}</span>
                          {s.name}
                        </button>
                        <span className="text-[10px] font-extrabold text-rose-700 shrink-0 tabular-nums">
                          {s.creditsPct}%
                        </span>
                      </div>
                      <div className="mt-1 w-full h-1 rounded-full bg-rose-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-400"
                          style={{ width: `${s.creditsPct}%` }}
                        />
                      </div>
                    </li>
                  ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setRechargeOpen(true)}
              className="group w-full h-9 rounded-xl bg-[#07281f] hover:bg-[#0c3529] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-[0.99]"
            >
              <PlusIcon className="w-3.5 h-3.5 transition-transform group-hover:rotate-90" />
              Recharge credits
            </button>
          </div>
        </div>

        {/* 4. Top performing senders */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-stripe">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                <TrendUpIcon className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                  Top performing senders
                </h3>
                <p className="text-[11px] text-slate-500">
                  Ranked by reputation health in the last 24 hours
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSortKey('messages')
                setActiveTab('all')
              }}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
            >
              View full report
              <ArrowUpRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2.5">
            {topSenders.map((sender, index) => (
              <button
                key={sender.id}
                type="button"
                onClick={() => setSelectedId(sender.id)}
                className="group relative text-left rounded-2xl border border-slate-200/80 hover:border-emerald-300 bg-slate-50/40 hover:bg-white p-3 transition-all hover:shadow-sm cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-base leading-none" aria-hidden>
                    {sender.flag}
                  </span>
                  <span
                    className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border ${index === 0
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-white text-slate-500 border-slate-200'
                      }`}
                  >
                    #{index + 1}
                  </span>
                </div>
                <strong className="mt-2 block text-[11.5px] font-bold text-slate-900 truncate group-hover:text-emerald-800 transition-colors">
                  {sender.name}
                </strong>
                <span className="block text-[10px] text-slate-500 font-mono truncate">
                  {sender.number}
                </span>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full bg-slate-200/70 overflow-hidden">
                    <div
                      className={
                        sender.health >= 90
                          ? 'bg-emerald-500'
                          : sender.health >= 75
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                      }
                      style={{ width: `${sender.health}%`, height: '100%' }}
                    />
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-700 tabular-nums">
                    {sender.health}
                  </span>
                </div>
                <span className="mt-1 block text-[9.5px] text-slate-400 font-medium">
                  {formatCompact(sender.sent24h)} msgs · {sender.deliveryRate}% delivery
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 5. Senders table */}
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-stripe overflow-hidden">
          {/* Section header */}
          <div className="px-4 sm:px-5 pt-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                <HeadsetIcon className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">Sender directory</h3>
                <p className="text-[11px] text-slate-500">
                  Click any row to open sender details, webhook, and controls
                </p>
              </div>
            </div>
            {(search || qualityFilter !== 'all' || activeTab !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setQualityFilter('all')
                  setActiveTab('all')
                }}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 px-2 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <CloseIcon className="w-3 h-3" />
                Clear filters
              </button>
            )}
          </div>

          {/* Toolbar */}
          <div className="p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-100/70 p-1 w-full xl:w-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 xl:flex-none px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-[11.5px] font-bold whitespace-nowrap transition-all cursor-pointer ${activeTab === tab.id
                    ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent'
                    }`}
                >
                  {tab.id === 'attention' && tab.count > 0 && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 align-middle" />
                  )}
                  {tab.label}
                  <span
                    className={`ml-1.5 text-[10px] tabular-nums px-1.5 py-px rounded-md ${activeTab === tab.id ? 'bg-emerald-50 text-emerald-700' : 'bg-white/70 text-slate-400'
                      }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[170px]">
                <SearchIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search number, name, country…"
                  aria-label="Search senders"
                  className="w-full pl-8 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-slate-900 transition-all placeholder:text-slate-400"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <CloseIcon className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <select
                value={qualityFilter}
                onChange={(e) => setQualityFilter(e.target.value as 'all' | QualityRating)}
                aria-label="Filter by quality rating"
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:border-emerald-500 outline-none cursor-pointer"
              >
                <option value="all">All quality</option>
                <option value="high">High quality</option>
                <option value="medium">Medium quality</option>
                <option value="low">Low quality</option>
              </select>

              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                aria-label="Sort senders"
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:border-emerald-500 outline-none cursor-pointer"
              >
                <option value="health">Sort: Health</option>
                <option value="messages">Sort: Messages 24h</option>
                <option value="name">Sort: Name A–Z</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {visibleSenders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <HeadsetIcon className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">No senders match your filters</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try a different search, quality rating, or connect a new WhatsApp sender.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setActiveTab('all')
                  setQualityFilter('all')
                }}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-left" aria-label="WhatsApp senders">
                <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 font-bold w-10" />
                    <th className="px-3 py-3 font-bold whitespace-nowrap">Sender</th>
                    <th className="px-3 py-3 font-bold whitespace-nowrap">Status</th>
                    <th className="px-3 py-3 font-bold whitespace-nowrap">Quality</th>
                    <th className="px-3 py-3 font-bold text-right whitespace-nowrap">Sent 24h</th>
                    <th className="px-3 py-3 font-bold text-right whitespace-nowrap">Delivery</th>
                    <th className="px-3 py-3 font-bold text-right whitespace-nowrap">Credits</th>
                    <th className="px-3 py-3 font-bold text-right whitespace-nowrap">Latency</th>
                    <th className="px-3 py-3 font-bold text-center whitespace-nowrap">Health</th>
                    <th className="px-3 py-3 font-bold whitespace-nowrap">Limits</th>
                    <th className="px-3 py-3 font-bold w-16" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleSenders.map((sender) => {
                    const quality = QUALITY_META[sender.quality]
                    const lowCredit = sender.creditsPct < 30
                    return (
                      <tr
                        key={sender.id}
                        onClick={() => setSelectedId(sender.id)}
                        className={`transition-colors cursor-pointer group border-l-2 ${lowCredit
                          ? 'border-l-rose-400/90 bg-rose-50/20 hover:bg-rose-50/40'
                          : 'border-l-transparent hover:bg-emerald-50/30'
                          }`}
                      >
                        <td className="px-4 py-3">
                          <div
                            className={`relative w-9 h-9 rounded-xl flex items-center justify-center shadow-2xs border border-emerald-100 bg-emerald-50 text-emerald-600 ring-4 ${STATUS_META[sender.status].ring}`}
                          >
                            <WhatsAppIcon className="w-4.5 h-4.5" />
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          <div className="min-w-0">
                            <strong className="flex items-center gap-1.5 text-slate-900 font-bold group-hover:text-emerald-800 transition-colors">
                              <span className="truncate max-w-[210px]">{sender.name}</span>
                              {lowCredit && (
                                <span
                                  title="Low template credits — auto-pause risk"
                                  className="shrink-0 text-[9px] font-extrabold uppercase tracking-wide text-rose-700 bg-rose-50 border border-rose-200 px-1 py-px rounded"
                                >
                                  Low
                                </span>
                              )}
                            </strong>
                            <span className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono whitespace-nowrap">
                              <span aria-hidden>{sender.flag}</span>
                              {sender.number}
                              <span className="text-slate-300">·</span>
                              <span className="font-sans font-medium text-slate-400 truncate max-w-[120px]">
                                {sender.country}
                              </span>
                            </span>
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          <StatusBadge status={sender.status} />
                        </td>

                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${quality.bg} ${quality.text}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${quality.bar}`} />
                            {quality.label}
                          </span>
                        </td>

                        <td className="px-3 py-3 text-right font-mono font-bold text-slate-800 tabular-nums">
                          {sender.sent24h ? formatCompact(sender.sent24h) : '—'}
                        </td>

                        <td className="px-3 py-3 text-right">
                          <span className="block font-mono font-bold text-slate-800 tabular-nums">
                            {sender.sent24h ? `${sender.deliveryRate}%` : '—'}
                          </span>
                          <span className="block text-[10px] text-slate-400 font-medium">
                            {sender.sent24h ? `${sender.readRate}% read` : 'no traffic'}
                          </span>
                        </td>

                        <td className="px-3 py-3">
                          <div className="w-14 ml-auto text-right">
                            <span
                              className={`block font-mono font-bold tabular-nums text-[11px] whitespace-nowrap ${lowCredit ? 'text-rose-600' : 'text-slate-700'
                                }`}
                            >
                              {sender.creditsPct}%
                            </span>
                            <div className="mt-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${sender.creditsPct < 30
                                  ? 'bg-rose-500'
                                  : sender.creditsPct < 60
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                  }`}
                                style={{ width: `${Math.max(4, sender.creditsPct)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-3 text-right">
                          <span
                            className={`font-mono font-bold tabular-nums ${sender.latencyMs === 0
                              ? 'text-slate-400'
                              : sender.latencyMs > 100
                                ? 'text-rose-600'
                                : 'text-slate-800'
                              }`}
                          >
                            {sender.latencyMs ? `${sender.latencyMs}ms` : '—'}
                          </span>
                        </td>

                        <td className="px-3 py-3">
                          <div className="flex justify-center">
                            <HealthRing health={sender.health} size={38} />
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded-md border text-[9.5px] font-bold uppercase tracking-wide mb-1 ${TIER_META[sender.tier]}`}
                          >
                            {sender.tier}
                          </span>
                          <span className="block text-[10.5px] text-slate-500 font-medium">
                            {sender.messagingLimit}
                          </span>
                        </td>

                        <td className="px-3 py-3">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              title={sender.status === 'online' ? 'Pause sender' : 'Reconnect sender'}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleStatus(sender.id)
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            >
                              {sender.status === 'online' ? (
                                <PauseIcon className="w-3.5 h-3.5" />
                              ) : (
                                <CheckCircleIcon className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              type="button"
                              title="Copy number"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigator.clipboard?.writeText(sender.number).catch(() => { })
                                notify(`${sender.number} copied`)
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                              <CopyIcon className="w-3.5 h-3.5" />
                            </button>
                            <span className="p-1.5 text-slate-300 group-hover:text-emerald-600 transition-colors">
                              <ArrowUpRightIcon className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer summary */}
          <div className="px-4 py-2.5 bg-slate-50/60 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <span className="text-slate-500">
              Showing <strong className="text-slate-800">{visibleSenders.length}</strong> of{' '}
              <strong className="text-slate-800">{senders.length}</strong> senders
              {counts.attention > 0 && (
                <span className="ml-2 text-rose-600 font-semibold">· {counts.attention} need attention</span>
              )}
            </span>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-500">
              <span className="inline-flex items-center gap-1">
                <BellIcon className="w-3 h-3" />
                <span className="hidden sm:inline">Alerts on quality drop</span>
                <span className="sm:hidden">Quality alerts</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <MegaphoneIcon className="w-3 h-3" />
                Auto-routing enabled
              </span>
              <span className="inline-flex items-center gap-1">
                <SlidersIcon className="w-3 h-3" />
                Smart throttling
              </span>
            </div>
          </div>
        </div>
      </div>

      {selectedSender && (
        <SenderDrawer
          sender={selectedSender}
          onClose={() => setSelectedId(null)}
          onNotify={notify}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {connectOpen && (
        <ConnectSenderModal onClose={() => setConnectOpen(false)} onConnect={handleConnect} />
      )}

      {rechargeOpen && (
        <RechargeCreditsModal onClose={() => setRechargeOpen(false)} onComplete={notify} />
      )}

      {toast && <Toast message={toast} onClose={closeToast} />}
    </DashboardLayout>
  )
}
