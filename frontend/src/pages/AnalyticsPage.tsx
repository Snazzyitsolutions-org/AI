import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../components/dashboard/DashboardLayout'
import { Toast } from '../components/dashboard/Toast'
import {
  AnalyticsIcon,
  CalendarIcon,
  CheckCircleIcon,
  DownloadIcon,
  HeadsetIcon,
  MegaphoneIcon,
  RefreshIcon,
  SearchIcon,
  TrendUpIcon,
  WhatsAppIcon,
} from '../components/dashboard/DashboardIcons'
import { ArrowRightIcon, CheckIcon, SparkIcon } from '../components/icons'
import { usePageTitle } from '../lib/usePageTitle'

/* -------------------------------------------------------------------------- */
/*  Types & Interfaces                                                        */
/* -------------------------------------------------------------------------- */

type TimeRange = '24h' | '7d' | '30d' | '90d' | '12m'
type MetricType = 'messages' | 'reads' | 'replies' | 'revenue'
type ChartType = 'spline' | 'bars' | 'dual'
type ChannelFilter = 'All' | 'WhatsApp' | 'AI Voice'
type StatusFilter = 'All' | 'Active' | 'Completed'
type SortField = 'name' | 'sent' | 'deliveredRate' | 'readRate' | 'replies' | 'qualified' | 'revenue'

interface MetricSeries {
  current: number[]
  previous: number[]
  total: number
  delta: number
}

interface TimeRangeData {
  rangeLabel: string
  subLabel: string
  previousLabel: string
  labels: string[]
  metrics: {
    messages: MetricSeries
    reads: MetricSeries
    replies: MetricSeries
    revenue: MetricSeries
  }
  kpiStats: {
    deliveredRate: number
    readRate: number
    replyRate: number
    qualifiedLeads: number
    wonDeals: number
    avgLatencyMs: number
    tps: number
  }
  geoData: { country: string; code: string; flag: string; share: number; volume: number; readRate: number }[]
  channelMix: { name: string; share: number; count: string; color: string; bg: string; border: string }[]
}

interface CampaignRow {
  id: string
  name: string
  channel: 'WhatsApp' | 'AI Voice'
  senderPool: string
  sent: number
  deliveredRate: number
  readRate: number
  replies: number
  qualified: number
  revenue: number
  status: 'Active' | 'Completed' | 'Scheduled'
  metaSpeedMs: number
  roas: number
}

interface SenderPoolInfo {
  id: string
  name: string
  channel: 'WhatsApp' | 'AI Voice'
  numbersCount: number
  deliveryRate: number
  latencyMs: number
  dailyCap: string
  status: 'Healthy' | 'Active' | 'Optimizing'
  spamFlags: number
}

/* -------------------------------------------------------------------------- */
/*  Mock Data Matrices                                                        */
/* -------------------------------------------------------------------------- */

const TIMEFRAME_DATA: Record<TimeRange, TimeRangeData> = {
  '24h': {
    rangeLabel: 'Last 24 Hours',
    subLabel: 'Live Telemetry · Oct 23, 2026',
    previousLabel: 'vs yesterday',
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'],
    metrics: {
      messages: {
        current: [1420, 890, 4850, 8420, 7150, 5640, 3210],
        previous: [1200, 750, 3950, 7120, 6200, 4890, 2750],
        total: 31580,
        delta: 17.5,
      },
      reads: {
        current: [1150, 710, 3980, 7050, 5920, 4610, 2610],
        previous: [960, 590, 3210, 5890, 5080, 3980, 2210],
        total: 26030,
        delta: 18.8,
      },
      replies: {
        current: [210, 110, 780, 1420, 1190, 890, 480],
        previous: [170, 85, 610, 1140, 960, 730, 380],
        total: 5080,
        delta: 24.6,
      },
      revenue: {
        current: [940, 450, 3200, 6800, 5400, 4100, 2150],
        previous: [720, 340, 2450, 5200, 4150, 3200, 1680],
        total: 23040,
        delta: 30.2,
      },
    },
    kpiStats: {
      deliveredRate: 98.9,
      readRate: 82.4,
      replyRate: 16.1,
      qualifiedLeads: 680,
      wonDeals: 198,
      avgLatencyMs: 34,
      tps: 428,
    },
    geoData: [
      { country: 'India', code: 'IN', flag: '🇮🇳', share: 44, volume: 13890, readRate: 85 },
      { country: 'United States', code: 'US', flag: '🇺🇸', share: 24, volume: 7580, readRate: 81 },
      { country: 'United Arab Emirates', code: 'AE', flag: '🇦🇪', share: 15, volume: 4740, readRate: 88 },
      { country: 'United Kingdom', code: 'GB', flag: '🇬🇧', share: 10, volume: 3160, readRate: 79 },
      { country: 'Singapore & SEA', code: 'SG', flag: '🇸🇬', share: 7, volume: 2210, readRate: 84 },
    ],
    channelMix: [
      { name: 'WhatsApp Broadcast', share: 59, count: '18.6k msgs', color: '#10b981', bg: 'bg-emerald-500', border: 'border-emerald-500' },
      { name: 'AI Voice Closer', share: 23, count: '7.3k calls', color: '#6366f1', bg: 'bg-indigo-500', border: 'border-indigo-500' },
      { name: '2-Way Inbox Chat', share: 12, count: '3.8k msgs', color: '#06b6d4', bg: 'bg-cyan-500', border: 'border-cyan-500' },
      { name: 'Auto Sequences', share: 6, count: '1.9k msgs', color: '#f59e0b', bg: 'bg-amber-500', border: 'border-amber-500' },
    ],
  },
  '7d': {
    rangeLabel: 'Last 7 Days',
    subLabel: 'Oct 17 – Oct 23, 2026',
    previousLabel: 'vs prior 7 days',
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    metrics: {
      messages: {
        current: [28400, 31200, 34500, 42100, 39800, 26400, 29800],
        previous: [24200, 27500, 29800, 35400, 33200, 21800, 24500],
        total: 232200,
        delta: 18.2,
      },
      reads: {
        current: [22150, 24650, 27600, 33680, 31440, 20590, 23540],
        previous: [18630, 21450, 23540, 27960, 25890, 16780, 19110],
        total: 183650,
        delta: 20.1,
      },
      replies: {
        current: [4260, 4830, 5520, 6940, 6360, 3960, 4760],
        previous: [3500, 3980, 4470, 5480, 5140, 3160, 3670],
        total: 36630,
        delta: 24.5,
      },
      revenue: {
        current: [18400, 21200, 24800, 32400, 29600, 16800, 21500],
        previous: [14500, 17200, 19800, 25400, 23100, 12900, 16700],
        total: 164700,
        delta: 27.2,
      },
    },
    kpiStats: {
      deliveredRate: 98.4,
      readRate: 79.1,
      replyRate: 15.8,
      qualifiedLeads: 4820,
      wonDeals: 1420,
      avgLatencyMs: 38,
      tps: 412,
    },
    geoData: [
      { country: 'India', code: 'IN', flag: '🇮🇳', share: 42, volume: 97520, readRate: 83 },
      { country: 'United States', code: 'US', flag: '🇺🇸', share: 25, volume: 58050, readRate: 79 },
      { country: 'United Arab Emirates', code: 'AE', flag: '🇦🇪', share: 14, volume: 32500, readRate: 86 },
      { country: 'United Kingdom', code: 'GB', flag: '🇬🇧', share: 11, volume: 25540, readRate: 78 },
      { country: 'Singapore & SEA', code: 'SG', flag: '🇸🇬', share: 8, volume: 18590, readRate: 82 },
    ],
    channelMix: [
      { name: 'WhatsApp Broadcast', share: 58, count: '134.7k msgs', color: '#10b981', bg: 'bg-emerald-500', border: 'border-emerald-500' },
      { name: 'AI Voice Closer', share: 24, count: '55.7k calls', color: '#6366f1', bg: 'bg-indigo-500', border: 'border-indigo-500' },
      { name: '2-Way Inbox Chat', share: 12, count: '27.8k msgs', color: '#06b6d4', bg: 'bg-cyan-500', border: 'border-cyan-500' },
      { name: 'Auto Sequences', share: 6, count: '14.0k msgs', color: '#f59e0b', bg: 'bg-amber-500', border: 'border-amber-500' },
    ],
  },
  '30d': {
    rangeLabel: 'Last 30 Days',
    subLabel: 'Sep 24 – Oct 23, 2026',
    previousLabel: 'vs prior 30 days',
    labels: ['Sep 24', 'Sep 27', 'Sep 30', 'Oct 3', 'Oct 6', 'Oct 9', 'Oct 12', 'Oct 15', 'Oct 18', 'Oct 21'],
    metrics: {
      messages: {
        current: [82400, 89100, 94600, 102400, 98200, 114500, 108300, 96400, 112100, 105800],
        previous: [68500, 74200, 79400, 84600, 81200, 92400, 89500, 78600, 91200, 87400],
        total: 1003800,
        delta: 21.4,
      },
      reads: {
        current: [64270, 69850, 74260, 80890, 77380, 90450, 85340, 75670, 88220, 83160],
        previous: [52740, 57430, 61450, 65980, 62930, 71600, 69360, 60910, 70680, 67730],
        total: 789490,
        delta: 22.8,
      },
      replies: {
        current: [12360, 13800, 14940, 16890, 15900, 18890, 17540, 15220, 18170, 16930],
        previous: [9860, 10980, 11910, 13110, 12420, 14500, 13870, 11940, 14130, 13480],
        total: 160640,
        delta: 27.3,
      },
      revenue: {
        current: [54200, 61800, 68400, 79200, 74500, 91400, 84200, 71500, 88600, 81200],
        previous: [41200, 47500, 52400, 60800, 56900, 69400, 64800, 54200, 67100, 61500],
        total: 755000,
        delta: 31.1,
      },
    },
    kpiStats: {
      deliveredRate: 97.9,
      readRate: 78.6,
      replyRate: 16.0,
      qualifiedLeads: 18450,
      wonDeals: 5280,
      avgLatencyMs: 41,
      tps: 395,
    },
    geoData: [
      { country: 'India', code: 'IN', flag: '🇮🇳', share: 41, volume: 411550, readRate: 82 },
      { country: 'United States', code: 'US', flag: '🇺🇸', share: 26, volume: 260980, readRate: 78 },
      { country: 'United Arab Emirates', code: 'AE', flag: '🇦🇪', share: 15, volume: 150570, readRate: 87 },
      { country: 'United Kingdom', code: 'GB', flag: '🇬🇧', share: 11, volume: 110410, readRate: 77 },
      { country: 'Singapore & SEA', code: 'SG', flag: '🇸🇬', share: 7, volume: 70290, readRate: 83 },
    ],
    channelMix: [
      { name: 'WhatsApp Broadcast', share: 58, count: '582k msgs', color: '#10b981', bg: 'bg-emerald-500', border: 'border-emerald-500' },
      { name: 'AI Voice Closer', share: 24, count: '240k calls', color: '#6366f1', bg: 'bg-indigo-500', border: 'border-indigo-500' },
      { name: '2-Way Inbox Chat', share: 12, count: '120k msgs', color: '#06b6d4', bg: 'bg-cyan-500', border: 'border-cyan-500' },
      { name: 'Auto Sequences', share: 6, count: '61k msgs', color: '#f59e0b', bg: 'bg-amber-500', border: 'border-amber-500' },
    ],
  },
  '90d': {
    rangeLabel: 'Last 90 Days',
    subLabel: 'Jul 26 – Oct 23, 2026',
    previousLabel: 'vs prior 90 days',
    labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'],
    metrics: {
      messages: {
        current: [210000, 224000, 238000, 252000, 245000, 268000, 275000, 261000, 282000, 294000, 287000, 276000],
        previous: [175000, 186000, 198000, 210000, 202000, 221000, 228000, 215000, 232000, 241000, 235000, 226000],
        total: 3112000,
        delta: 21.1,
      },
      reads: {
        current: [163800, 175100, 186600, 197800, 192300, 210600, 216400, 205100, 221900, 231400, 225900, 217200],
        previous: [134700, 143200, 152400, 161700, 155500, 170100, 175500, 165500, 178600, 185500, 180900, 174000],
        total: 2444100,
        delta: 23.6,
      },
      replies: {
        current: [31500, 34200, 36900, 39800, 38200, 42800, 44100, 41200, 45600, 47900, 46500, 44200],
        previous: [24800, 26900, 28900, 31200, 29800, 33500, 34600, 32400, 35900, 37500, 36400, 34800],
        total: 492900,
        delta: 27.5,
      },
      revenue: {
        current: [142000, 156000, 168000, 182000, 175000, 198000, 204000, 189000, 212000, 224000, 217000, 205000],
        previous: [108000, 118000, 127000, 138000, 131000, 149000, 154000, 142000, 159000, 168000, 162000, 153000],
        total: 2272000,
        delta: 32.9,
      },
    },
    kpiStats: {
      deliveredRate: 97.4,
      readRate: 78.5,
      replyRate: 15.8,
      qualifiedLeads: 54200,
      wonDeals: 16100,
      avgLatencyMs: 44,
      tps: 375,
    },
    geoData: [
      { country: 'India', code: 'IN', flag: '🇮🇳', share: 40, volume: 1244800, readRate: 81 },
      { country: 'United States', code: 'US', flag: '🇺🇸', share: 27, volume: 840240, readRate: 77 },
      { country: 'United Arab Emirates', code: 'AE', flag: '🇦🇪', share: 14, volume: 435680, readRate: 86 },
      { country: 'United Kingdom', code: 'GB', flag: '🇬🇧', share: 11, volume: 342320, readRate: 76 },
      { country: 'Singapore & SEA', code: 'SG', flag: '🇸🇬', share: 8, volume: 248960, readRate: 81 },
    ],
    channelMix: [
      { name: 'WhatsApp Broadcast', share: 57, count: '1.77M msgs', color: '#10b981', bg: 'bg-emerald-500', border: 'border-emerald-500' },
      { name: 'AI Voice Closer', share: 25, count: '778k calls', color: '#6366f1', bg: 'bg-indigo-500', border: 'border-indigo-500' },
      { name: '2-Way Inbox Chat', share: 12, count: '373k msgs', color: '#06b6d4', bg: 'bg-cyan-500', border: 'border-cyan-500' },
      { name: 'Auto Sequences', share: 6, count: '187k msgs', color: '#f59e0b', bg: 'bg-amber-500', border: 'border-amber-500' },
    ],
  },
  '12m': {
    rangeLabel: 'Past 12 Months',
    subLabel: 'Nov 2025 – Oct 2026',
    previousLabel: 'vs prior year',
    labels: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    metrics: {
      messages: {
        current: [620000, 710000, 680000, 740000, 820000, 890000, 940000, 980000, 1040000, 1120000, 1180000, 1240000],
        previous: [420000, 480000, 460000, 490000, 540000, 590000, 630000, 660000, 710000, 760000, 810000, 860000],
        total: 10960000,
        delta: 47.9,
      },
      reads: {
        current: [483600, 557300, 531800, 578600, 642800, 698600, 741600, 774200, 823600, 889200, 936900, 987100],
        previous: [323400, 369600, 354200, 377300, 415800, 454300, 485100, 508200, 546700, 585200, 623700, 662200],
        total: 8645900,
        delta: 50.8,
      },
      replies: {
        current: [93000, 108000, 101000, 112000, 126000, 138000, 147000, 154000, 165000, 179000, 191000, 203000],
        previous: [58000, 67000, 63000, 68000, 76000, 84000, 89000, 94000, 102000, 110000, 118000, 126000],
        total: 1717000,
        delta: 62.7,
      },
      revenue: {
        current: [420000, 490000, 460000, 520000, 590000, 660000, 710000, 760000, 820000, 890000, 960000, 1040000],
        previous: [250000, 290000, 270000, 310000, 350000, 390000, 430000, 460000, 510000, 560000, 610000, 660000],
        total: 8320000,
        delta: 63.5,
      },
    },
    kpiStats: {
      deliveredRate: 98.2,
      readRate: 78.9,
      replyRate: 15.7,
      qualifiedLeads: 215000,
      wonDeals: 64200,
      avgLatencyMs: 42,
      tps: 450,
    },
    geoData: [
      { country: 'India', code: 'IN', flag: '🇮🇳', share: 39, volume: 4274400, readRate: 80 },
      { country: 'United States', code: 'US', flag: '🇺🇸', share: 28, volume: 3068800, readRate: 77 },
      { country: 'United Arab Emirates', code: 'AE', flag: '🇦🇪', share: 15, volume: 1644000, readRate: 85 },
      { country: 'United Kingdom', code: 'GB', flag: '🇬🇧', share: 11, volume: 1205600, readRate: 76 },
      { country: 'Singapore & SEA', code: 'SG', flag: '🇸🇬', share: 7, volume: 767200, readRate: 82 },
    ],
    channelMix: [
      { name: 'WhatsApp Broadcast', share: 56, count: '6.14M msgs', color: '#10b981', bg: 'bg-emerald-500', border: 'border-emerald-500' },
      { name: 'AI Voice Closer', share: 25, count: '2.74M calls', color: '#6366f1', bg: 'bg-indigo-500', border: 'border-indigo-500' },
      { name: '2-Way Inbox Chat', share: 13, count: '1.42M msgs', color: '#06b6d4', bg: 'bg-cyan-500', border: 'border-cyan-500' },
      { name: 'Auto Sequences', share: 6, count: '657k msgs', color: '#f59e0b', bg: 'bg-amber-500', border: 'border-amber-500' },
    ],
  },
}

const CAMPAIGNS_DATA: CampaignRow[] = [
  {
    id: 'cmp-1',
    name: 'Diwali Flash VIP Unlock 40%',
    channel: 'WhatsApp',
    senderPool: 'Pool #1 (High-Priority Tier)',
    sent: 48500,
    deliveredRate: 99.2,
    readRate: 84.6,
    replies: 8420,
    qualified: 1240,
    revenue: 46800,
    status: 'Active',
    metaSpeedMs: 32,
    roas: 7.8,
  },
  {
    id: 'cmp-2',
    name: 'Cart Recovery AI Voice Closer',
    channel: 'AI Voice',
    senderPool: 'Voice Trunk US-East',
    sent: 16400,
    deliveredRate: 97.4,
    readRate: 78.1,
    replies: 3890,
    qualified: 840,
    revenue: 38200,
    status: 'Active',
    metaSpeedMs: 28,
    roas: 9.4,
  },
  {
    id: 'cmp-3',
    name: 'Q4 Enterprise SaaS Demo Sprint',
    channel: 'WhatsApp',
    senderPool: 'APAC Dedicated Broadcast',
    sent: 34200,
    deliveredRate: 98.6,
    readRate: 76.4,
    replies: 5120,
    qualified: 980,
    revenue: 34500,
    status: 'Active',
    metaSpeedMs: 36,
    roas: 6.2,
  },
  {
    id: 'cmp-4',
    name: 'Prestige Realty VIP Showroom Invite',
    channel: 'AI Voice',
    senderPool: 'Voice Trunk Mumbai-01',
    sent: 8900,
    deliveredRate: 99.4,
    readRate: 89.2,
    replies: 2840,
    qualified: 620,
    revenue: 29400,
    status: 'Completed',
    metaSpeedMs: 24,
    roas: 11.2,
  },
  {
    id: 'cmp-5',
    name: 'Automated 14-Day Re-engagement',
    channel: 'WhatsApp',
    senderPool: 'Global Inbound Router',
    sent: 22100,
    deliveredRate: 97.1,
    readRate: 71.8,
    replies: 2940,
    qualified: 420,
    revenue: 15800,
    status: 'Completed',
    metaSpeedMs: 40,
    roas: 4.8,
  },
]

const SENDER_POOLS_DATA: SenderPoolInfo[] = [
  {
    id: 'pool-1',
    name: 'Pool #1 (High-Priority VIP)',
    channel: 'WhatsApp',
    numbersCount: 12,
    deliveryRate: 99.2,
    latencyMs: 32,
    dailyCap: 'Tier Unlimited (100k+/day)',
    status: 'Healthy',
    spamFlags: 0,
  },
  {
    id: 'pool-2',
    name: 'Pool #2 (E-Commerce Warmup)',
    channel: 'WhatsApp',
    numbersCount: 10,
    deliveryRate: 98.4,
    latencyMs: 36,
    dailyCap: 'Tier 2 (50k/day)',
    status: 'Healthy',
    spamFlags: 0,
  },
  {
    id: 'pool-3',
    name: 'Voice SIP Trunk US-East',
    channel: 'AI Voice',
    numbersCount: 6,
    deliveryRate: 97.8,
    latencyMs: 28,
    dailyCap: '1,200 concurrent ports',
    status: 'Active',
    spamFlags: 0,
  },
  {
    id: 'pool-4',
    name: 'APAC Dedicated Broadcast',
    channel: 'WhatsApp',
    numbersCount: 4,
    deliveryRate: 98.6,
    latencyMs: 35,
    dailyCap: 'Tier 3 (100k/day)',
    status: 'Optimizing',
    spamFlags: 0,
  },
]

const HEATMAP_DATA = [
  { day: 'Mon', slots: [18, 42, 64, 82, 74, 38] },
  { day: 'Tue', slots: [22, 54, 78, 89, 78, 44] },
  { day: 'Wed', slots: [24, 61, 84, 94, 84, 51] },
  { day: 'Thu', slots: [28, 68, 92, 98, 88, 56] }, // Peak Golden Slot
  { day: 'Fri', slots: [25, 64, 86, 91, 79, 48] },
  { day: 'Sat', slots: [14, 32, 54, 62, 58, 31] },
  { day: 'Sun', slots: [12, 28, 46, 58, 64, 36] },
]

const TIME_SLOTS = ['8-10 AM', '10-12 PM', '12-2 PM', '2-5 PM', '5-8 PM', '8-10 PM']

/* -------------------------------------------------------------------------- */
/*  Formatters & Math Utilities                                               */
/* -------------------------------------------------------------------------- */

const numberFormat = new Intl.NumberFormat('en-US')
const compactFormat = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
const currencyFormat = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

function formatMetricVal(metric: MetricType, val: number): string {
  if (metric === 'revenue') return currencyFormat.format(val)
  return val >= 1000 ? compactFormat.format(val) : numberFormat.format(val)
}

function buildSmoothSvgPath(points: { x: number; y: number }[]): string {
  if (points.length <= 1) return ''
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1]
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }
  return d
}

/* -------------------------------------------------------------------------- */
/*  GRAPH 1: Animated Micro Sparkline for KPI Cards                           */
/* -------------------------------------------------------------------------- */

function MiniSparkline({
  data,
  color = '#10b981',
}: {
  data: number[]
  color?: string
}) {
  const width = 84
  const height = 30
  const pad = 3
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1

  const points = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * (width - pad * 2),
    y: height - pad - ((v - min) / range) * (height - pad * 2),
  }))

  const path = buildSmoothSvgPath(points)

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="analytics-draw-line"
      />
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r="3"
        fill={color}
        stroke="#ffffff"
        strokeWidth="1.5"
      />
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/*  GRAPH 2: Live Real-time Throughput Waveform Monitor                        */
/* -------------------------------------------------------------------------- */

function LiveThroughputWaveform({ tps }: { tps: number }) {
  const [pulse, setPulse] = useState(tps)

  useEffect(() => {
    const timer = setInterval(() => {
      setPulse(tps + Math.floor((Math.random() - 0.5) * 18))
    }, 1800)
    return () => clearInterval(timer)
  }, [tps])

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 p-4 text-white border border-slate-800 shadow-md relative overflow-hidden flex flex-col justify-between">
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Live Engine Waveform</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
          32 Lines Active
        </span>
      </div>

      <div className="py-3 z-10">
        <svg viewBox="0 0 320 46" className="w-full h-11 overflow-visible">
          <defs>
            <linearGradient id="liveWaveGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#34d399" stopOpacity="1" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <path
            d="M 0 23 Q 40 4 80 23 T 160 23 T 240 41 T 320 23"
            fill="none"
            stroke="url(#liveWaveGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="animate-pulse"
          />
          <path
            d="M 120 23 L 132 23 L 138 6 L 146 40 L 152 14 L 158 23 L 180 23"
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="flex items-center justify-between z-10 border-t border-slate-800/80 pt-2.5 text-xs">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-extrabold font-mono text-emerald-400">{pulse}</span>
          <span className="text-[10px] text-slate-400">msg/sec</span>
        </div>
        <span className="text-[11px] text-slate-300 font-medium">Meta Cloud API v21 · 0.01% err</span>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  GRAPH 3: Master Interactive Performance Graph                              */
/* -------------------------------------------------------------------------- */

function MasterInteractiveChart({
  labels,
  current,
  previous,
  metric,
  chartType,
  showCompare,
}: {
  labels: string[]
  current: number[]
  previous: number[]
  metric: MetricType
  chartType: ChartType
  showCompare: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(800)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setWidth(Math.max(300, el.clientWidth))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const height = 300
  const pad = { top: 25, bottom: 35, left: 60, right: 25 }
  const plotW = width - pad.left - pad.right
  const plotH = height - pad.top - pad.bottom

  const allVals = showCompare ? [...current, ...previous] : current
  const maxVal = Math.max(...allVals, 10) * 1.12

  const pointsCurrent = current.map((val, idx) => ({
    x: pad.left + (idx / Math.max(labels.length - 1, 1)) * plotW,
    y: pad.top + plotH - (val / maxVal) * plotH,
  }))

  const pointsPrev = previous.map((val, idx) => ({
    x: pad.left + (idx / Math.max(labels.length - 1, 1)) * plotW,
    y: pad.top + plotH - (val / maxVal) * plotH,
  }))

  const linePath = buildSmoothSvgPath(pointsCurrent)
  const prevLinePath = buildSmoothSvgPath(pointsPrev)
  const areaPath = `${linePath} L ${pad.left + plotW} ${pad.top + plotH} L ${pad.left} ${pad.top + plotH} Z`

  const handlePointer = (e: ReactPointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    if (!rect.width) return
    const xRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const idx = Math.round(xRatio * (labels.length - 1))
    setHoverIndex(idx)
  }

  const activeIdx = hoverIndex !== null && hoverIndex >= 0 && hoverIndex < labels.length ? hoverIndex : null

  return (
    <div ref={containerRef} className="relative w-full select-none">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
        <defs>
          <linearGradient id="masterAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
            <stop offset="45%" stopColor="#10b981" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="barGradCurrent" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          <linearGradient id="barGradPrev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>

          <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines & Y-Axis */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const y = pad.top + plotH - pct * plotH
          const tickVal = maxVal * pct
          return (
            <g key={i}>
              <line
                x1={pad.left}
                y1={y}
                x2={pad.left + plotW}
                y2={y}
                stroke={i === 0 ? '#cbd5e1' : '#f1f5f9'}
                strokeWidth={i === 0 ? 1.5 : 1}
                strokeDasharray={i === 0 ? undefined : '3 4'}
              />
              <text x={pad.left - 12} y={y + 3.5} textAnchor="end" fontSize="10" fill="#94a3b8" fontWeight="600">
                {compactFormat.format(tickVal)}
              </text>
            </g>
          )
        })}

        {/* MODE 1: Spline Area */}
        {chartType === 'spline' && (
          <g>
            <path d={areaPath} fill="url(#masterAreaGrad)" />
            {showCompare && (
              <path
                d={prevLinePath}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
                strokeDasharray="4 4"
                strokeLinecap="round"
                opacity="0.8"
              />
            )}
            <path
              d={linePath}
              fill="none"
              stroke="#10b981"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glowFilter)"
            />
            {pointsCurrent.length > 0 && (
              <g>
                <circle
                  cx={pointsCurrent[pointsCurrent.length - 1].x}
                  cy={pointsCurrent[pointsCurrent.length - 1].y}
                  r="8"
                  fill="#10b981"
                  opacity="0.25"
                  className="animate-ping"
                />
                <circle
                  cx={pointsCurrent[pointsCurrent.length - 1].x}
                  cy={pointsCurrent[pointsCurrent.length - 1].y}
                  r="5"
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                />
              </g>
            )}
          </g>
        )}

        {/* MODE 2: Pillar Bars */}
        {chartType === 'bars' && (
          <g>
            {current.map((val, idx) => {
              const xCenter = pad.left + (idx / Math.max(labels.length - 1, 1)) * plotW
              const barW = Math.max(8, Math.min(28, (plotW / labels.length) * 0.45))
              const barH = (val / maxVal) * plotH
              const yTop = pad.top + plotH - barH

              const prevVal = previous[idx] || 0
              const prevBarH = (prevVal / maxVal) * plotH
              const prevYTop = pad.top + plotH - prevBarH

              const isHovered = activeIdx === idx

              return (
                <g key={idx} className="transition-all duration-300">
                  {showCompare && (
                    <rect
                      x={xCenter - barW - 1.5}
                      y={prevYTop}
                      width={barW}
                      height={Math.max(2, prevBarH)}
                      rx="4"
                      fill="url(#barGradPrev)"
                      opacity="0.65"
                    />
                  )}
                  <rect
                    x={showCompare ? xCenter + 1.5 : xCenter - barW / 2}
                    y={yTop}
                    width={barW}
                    height={Math.max(2, barH)}
                    rx="4"
                    fill="url(#barGradCurrent)"
                    className={isHovered ? 'filter drop-shadow-md brightness-110' : ''}
                  />
                  <rect
                    x={showCompare ? xCenter + 1.5 : xCenter - barW / 2}
                    y={yTop}
                    width={barW}
                    height="3"
                    rx="1.5"
                    fill="#a7f3d0"
                  />
                </g>
              )
            })}
          </g>
        )}

        {/* MODE 3: Dual Trendline with Ribbon */}
        {chartType === 'dual' && (
          <g>
            {showCompare && (
              <path
                d={`${linePath} L ${pointsPrev[pointsPrev.length - 1].x} ${pointsPrev[pointsPrev.length - 1].y} ${buildSmoothSvgPath([...pointsPrev].reverse()).replace('M', 'L')} Z`}
                fill="#10b981"
                opacity="0.12"
              />
            )}
            {showCompare && (
              <path
                d={prevLinePath}
                fill="none"
                stroke="#64748b"
                strokeWidth="2.2"
                strokeDasharray="4 4"
                strokeLinecap="round"
              />
            )}
            <path
              d={linePath}
              fill="none"
              stroke="#059669"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {pointsCurrent.map((pt, i) => (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r={activeIdx === i ? 6 : 3.5}
                fill="#ffffff"
                stroke="#059669"
                strokeWidth="2.5"
                className="transition-all"
              />
            ))}
          </g>
        )}

        {/* X-Axis labels */}
        {labels.map((lbl, idx) => (
          <text
            key={idx}
            x={pad.left + (idx / Math.max(labels.length - 1, 1)) * plotW}
            y={height - 10}
            textAnchor="middle"
            fontSize="10"
            fill={activeIdx === idx ? '#0f172a' : '#94a3b8'}
            fontWeight={activeIdx === idx ? '800' : '600'}
          >
            {lbl}
          </text>
        ))}

        {/* Crosshair */}
        {activeIdx !== null && (
          <g pointerEvents="none">
            <line
              x1={pointsCurrent[activeIdx].x}
              y1={pad.top}
              x2={pointsCurrent[activeIdx].x}
              y2={pad.top + plotH}
              stroke="#0f172a"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.4"
            />
            {showCompare && (
              <circle
                cx={pointsPrev[activeIdx].x}
                cy={pointsPrev[activeIdx].y}
                r="4.5"
                fill="#ffffff"
                stroke="#64748b"
                strokeWidth="2"
              />
            )}
            <circle
              cx={pointsCurrent[activeIdx].x}
              cy={pointsCurrent[activeIdx].y}
              r="6.5"
              fill="#10b981"
              stroke="#ffffff"
              strokeWidth="2.5"
              className="drop-shadow-sm"
            />
          </g>
        )}

        {/* Pointer Target */}
        <rect
          x={pad.left}
          y={pad.top}
          width={plotW}
          height={plotH}
          fill="transparent"
          className="cursor-crosshair"
          onPointerMove={handlePointer}
          onPointerDown={handlePointer}
          onPointerLeave={() => setHoverIndex(null)}
        />
      </svg>

      {/* Floating Tooltip */}
      {activeIdx !== null && (
        <div
          className="pointer-events-none absolute top-3 z-30 -translate-x-1/2 rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 shadow-2xl backdrop-blur-md text-xs space-y-1.5 transition-all duration-150"
          style={{
            left: `${Math.max(12, Math.min(88, (pointsCurrent[activeIdx].x / width) * 100))}%`,
          }}
        >
          <div className="flex items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>{labels[activeIdx]}</span>
            <span className="text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              +{(((current[activeIdx] - previous[activeIdx]) / Math.max(previous[activeIdx], 1)) * 100).toFixed(1)}%
            </span>
          </div>

          <div className="text-base font-extrabold text-slate-900">
            {formatMetricVal(metric, current[activeIdx])}
          </div>

          {showCompare && (
            <div className="flex items-center justify-between gap-4 text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
              <span>Benchmark (prior):</span>
              <span className="font-semibold text-slate-700 font-mono">
                {formatMetricVal(metric, previous[activeIdx])}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  GRAPH 4: Interactive Channel Donut Chart                                  */
/* -------------------------------------------------------------------------- */

function ChannelDonutChart({
  channelMix,
}: {
  channelMix: { name: string; share: number; count: string; color: string; bg: string; border: string }[]
}) {
  const [activeSlice, setActiveSlice] = useState<number>(0)
  const size = 180
  const strokeWidth = 24
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  let accumulatedPercent = 0
  const slices = channelMix.map((ch, idx) => {
    const dashLength = (ch.share / 100) * circumference
    const dashOffset = circumference - (accumulatedPercent / 100) * circumference
    accumulatedPercent += ch.share
    return {
      ...ch,
      idx,
      dashLength,
      dashOffset,
    }
  })

  const currentSelection = channelMix[activeSlice] || channelMix[0]

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="relative flex items-center justify-center shrink-0">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {slices.map((s) => (
            <circle
              key={s.name}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={s.color}
              strokeWidth={activeSlice === s.idx ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={`${s.dashLength} ${circumference}`}
              strokeDashoffset={-((circumference - s.dashOffset))}
              strokeLinecap="round"
              className="cursor-pointer transition-all duration-300 hover:opacity-90"
              onMouseEnter={() => setActiveSlice(s.idx)}
            />
          ))}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {currentSelection.share}%
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 max-w-[85px] leading-tight truncate">
            {currentSelection.name.split(' ')[0]}
          </span>
        </div>
      </div>

      <div className="space-y-2.5 w-full">
        {channelMix.map((ch, idx) => (
          <div
            key={ch.name}
            onMouseEnter={() => setActiveSlice(idx)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
              activeSlice === idx
                ? 'bg-slate-50 border-slate-300 shadow-2xs translate-x-1'
                : 'border-slate-100 hover:bg-slate-50/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: ch.color }} />
              <div>
                <div className="text-xs font-bold text-slate-800">{ch.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">{ch.count}</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-extrabold text-slate-900 font-mono">{ch.share}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  GRAPH 5: Semi-Circle Delivery Quality Speedometer                         */
/* -------------------------------------------------------------------------- */

function DeliveryHealthGauge({
  rate,
  latency,
}: {
  rate: number
  latency: number
}) {
  const size = 190
  const strokeWidth = 18
  const radius = (size - strokeWidth) / 2
  const arcLength = Math.PI * radius
  const filledArc = (rate / 100) * arcLength

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative">
        <svg width={size} height={size / 2 + 15} viewBox={`0 0 ${size} ${size / 2 + 15}`} className="overflow-visible">
          <defs>
            <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="60%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${filledArc} ${arcLength}`}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>

        <div className="absolute inset-x-0 bottom-1 flex flex-col items-center">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
            {rate}%
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Meta Tier: Unlimited
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full mt-4 pt-3 border-t border-slate-100 text-xs">
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Latency</span>
          <span className="font-extrabold text-slate-800 font-mono">{latency} ms</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Spam Flag</span>
          <span className="font-extrabold text-emerald-700 font-mono">0.00% Zero</span>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  GRAPH 6: Geographic Regional Distribution                                 */
/* -------------------------------------------------------------------------- */

function GeoDistributionBars({
  geoData,
}: {
  geoData: { country: string; code: string; flag: string; share: number; volume: number; readRate: number }[]
}) {
  return (
    <div className="space-y-3">
      {geoData.map((item) => (
        <div key={item.code} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-sm">{item.flag}</span>
              <span className="font-bold text-slate-800">{item.country}</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="text-slate-400">{compactFormat.format(item.volume)} msgs</span>
              <span className="font-bold text-emerald-700">{item.readRate}% Read</span>
              <span className="font-extrabold text-slate-900 w-8 text-right">{item.share}%</span>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${item.share * 2.2}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Campaign Drill-down Modal                                                 */
/* -------------------------------------------------------------------------- */

function CampaignDetailModal({
  campaign,
  onClose,
  onRerun,
}: {
  campaign: CampaignRow
  onClose: () => void
  onRerun: (name: string) => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200/90 space-y-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                campaign.channel === 'WhatsApp'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
              }`}
            >
              {campaign.channel} Broadcast
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-emerald-700 font-semibold">{campaign.status}</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">{campaign.name}</h2>
          <p className="text-xs text-slate-500">Sender: {campaign.senderPool}</p>
        </div>

        {/* 4 Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Sent Volume</span>
            <div className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">
              {numberFormat.format(campaign.sent)}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Delivery %</span>
            <div className="text-lg font-extrabold text-emerald-700 font-mono mt-0.5">
              {campaign.deliveredRate}%
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Read %</span>
            <div className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">
              {campaign.readRate}%
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Revenue</span>
            <div className="text-lg font-extrabold text-emerald-700 font-mono mt-0.5">
              {currencyFormat.format(campaign.revenue)}
            </div>
          </div>
        </div>

        {/* Meta Latency & ROAS Breakdown */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Telecommunication Diagnostics</span>
            <span className="text-emerald-700 font-mono">{campaign.metaSpeedMs}ms webhook latency</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-white rounded-xl border border-slate-200/60">
              <span className="text-[10px] text-slate-400 block">ROAS Multiplier</span>
              <span className="font-extrabold text-slate-900 font-mono">{campaign.roas}x</span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-slate-200/60">
              <span className="text-[10px] text-slate-400 block">Customer Replies</span>
              <span className="font-extrabold text-sky-700 font-mono">{numberFormat.format(campaign.replies)}</span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-slate-200/60">
              <span className="text-[10px] text-slate-400 block">Qualified Leads</span>
              <span className="font-extrabold text-purple-700 font-mono">{numberFormat.format(campaign.qualified)}</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => onRerun(campaign.name)}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <SparkIcon className="w-3.5 h-3.5" />
            <span>Re-run Campaign</span>
          </button>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Main AnalyticsPage Component                                              */
/* -------------------------------------------------------------------------- */

export function AnalyticsPage() {
  usePageTitle('Analytics & Intelligence · CallWave')
  const navigate = useNavigate()

  // State
  const [selectedRange, setSelectedRange] = useState<TimeRange>('30d')
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('messages')
  const [chartType, setChartType] = useState<ChartType>('spline')
  const [showComparison, setShowComparison] = useState<boolean>(true)
  const [campaignSearch, setCampaignSearch] = useState<string>('')
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('All')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [sortField, setSortField] = useState<SortField>('sent')
  const [sortAsc, setSortAsc] = useState<boolean>(false)
  const [activeDrilldownCampaign, setActiveDrilldownCampaign] = useState<CampaignRow | null>(null)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date())

  // Toast
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null)
  const notify = useCallback((message: string) => {
    setToast({ id: Date.now(), message })
  }, [])
  const closeToast = useCallback(() => setToast(null), [])

  const currentData = useMemo(() => TIMEFRAME_DATA[selectedRange], [selectedRange])
  const activeMetricData = currentData.metrics[selectedMetric]

  // Filtered and Sorted Campaigns
  const filteredAndSortedCampaigns = useMemo(() => {
    return [...CAMPAIGNS_DATA]
      .filter((cmp) => {
        const matchSearch =
          !campaignSearch.trim() ||
          cmp.name.toLowerCase().includes(campaignSearch.toLowerCase()) ||
          cmp.senderPool.toLowerCase().includes(campaignSearch.toLowerCase())
        const matchChannel = channelFilter === 'All' || cmp.channel === channelFilter
        const matchStatus = statusFilter === 'All' || cmp.status === statusFilter
        return matchSearch && matchChannel && matchStatus
      })
      .sort((a, b) => {
        const valA = a[sortField]
        const valB = b[sortField]
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA)
        }
        return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number)
      })
  }, [campaignSearch, channelFilter, statusFilter, sortField, sortAsc])

  // Sorting helper
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(false)
    }
  }

  // Refresh Telemetry Handler
  const handleRefreshData = () => {
    setIsRefreshing(true)
    notify('Syncing live telemetry from Meta Cloud API & SIP Trunks...')
    setTimeout(() => {
      setIsRefreshing(false)
      setLastSyncTime(new Date())
      notify('Analytics synchronized! All 32 WhatsApp senders reporting live.')
    }, 750)
  }

  // Export CSV Handler
  const handleExportCsv = () => {
    const headers = 'Campaign Name,Channel,Sender Pool,Messages Sent,Delivery %,Read %,Replies,Qualified,Revenue,Status,ROAS\n'
    const rows = filteredAndSortedCampaigns
      .map(
        (c) =>
          `"${c.name}","${c.channel}","${c.senderPool}",${c.sent},${c.deliveredRate}%,${c.readRate}%,${c.replies},${c.qualified},$${c.revenue},"${c.status}",${c.roas}x`,
      )
      .join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `callwave-analytics-${selectedRange}.csv`
    link.click()
    notify(`Exported ${filteredAndSortedCampaigns.length} campaign records to CSV.`)
  }

  return (
    <DashboardLayout
      search=""
      activeNav="analytics"
      searchPlaceholder="Search analytics, campaigns, pools…"
      onSearchChange={() => {}}
      onNotice={notify}
      onNewCampaign={() => navigate('/campaigns')}
    >
      <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6 text-slate-900">
        {/* 1. Mission Control Executive Header */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-stripe flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Live Telemetry Active
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs text-slate-500 font-medium">Meta Cloud API v21.0</span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs text-slate-400 font-mono">
                Updated {lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Growth &amp; Revenue Analytics</span>
              <AnalyticsIcon className="w-6 h-6 text-emerald-600" />
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Real-time multi-channel intelligence: WhatsApp broadcast delivery metrics, AI closing conversions, customer reply behaviors, and attributed pipeline revenue.
            </p>
          </div>

          {/* Timeframe Selector & Actions */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Timeframe Pills */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
              {(
                [
                  { id: '24h', label: '24H' },
                  { id: '7d', label: '7D' },
                  { id: '30d', label: '30D' },
                  { id: '90d', label: '90D' },
                  { id: '12m', label: '1Y' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedRange(tab.id)}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    selectedRange === tab.id
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer border border-slate-200 disabled:opacity-60"
              title="Refresh telemetry"
            >
              <RefreshIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {/* Export CSV */}
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <DownloadIcon className="w-4 h-4 text-slate-300" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 2. AI Intelligence & Anomaly Detection Feed */}
        <div className="rounded-3xl bg-gradient-to-r from-purple-50/80 via-white to-emerald-50/80 border border-purple-200/70 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-600 text-white shadow-xs shrink-0 mt-0.5">
              <SparkIcon className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-purple-900">
                  AI Copilot Intelligence &amp; Anomaly Signals
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                  3 Real-Time Insights
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                💡 <strong className="text-slate-900">Thursday Peak Window:</strong> Broadcasts sent between 12-2 PM convert at +38.4% higher reply rates. • 🚀 <strong className="text-slate-900">Voice Closer:</strong> Abandoned cart sprint closed 840 orders ($38,200) with an average latency of 28ms.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => notify('AI Copilot optimization model applied: Auto-throttling active across all 32 sender lines.')}
            className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition shrink-0 cursor-pointer shadow-xs"
          >
            Apply Auto-Optimization
          </button>
        </div>

        {/* 3. Top High-Impact 5 KPI Cards with Inline Micro Sparklines */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Card 1: Messages Sent */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                <span>Broadcasted</span>
                <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {numberFormat.format(currentData.metrics.messages.total)}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                <TrendUpIcon className="w-3.5 h-3.5" />
                <span>+{currentData.metrics.messages.delta}%</span>
              </div>
              <MiniSparkline data={currentData.metrics.messages.current} color="#10b981" />
            </div>
          </div>

          {/* Card 2: Delivery & Read Quality */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                <span>Delivery Quality</span>
                <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {currentData.kpiStats.deliveredRate}%
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs font-bold text-slate-600">
                <span className="text-emerald-700">● {currentData.kpiStats.readRate}% Read</span>
              </div>
              <MiniSparkline data={currentData.metrics.reads.current} color="#059669" />
            </div>
          </div>

          {/* Card 3: Inbound Customer Replies */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                <span>Customer Replies</span>
                <MegaphoneIcon className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {numberFormat.format(currentData.metrics.replies.total)}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs font-bold text-sky-700">
                <TrendUpIcon className="w-3.5 h-3.5" />
                <span>{currentData.kpiStats.replyRate}% rate</span>
              </div>
              <MiniSparkline data={currentData.metrics.replies.current} color="#0284c7" />
            </div>
          </div>

          {/* Card 4: AI Qualified Leads */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                <span>AI Qualified Leads</span>
                <SparkIcon className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {numberFormat.format(currentData.kpiStats.qualifiedLeads)}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs font-bold text-purple-700">
                <span>{numberFormat.format(currentData.kpiStats.wonDeals)} deals</span>
              </div>
              <MiniSparkline data={[120, 180, 240, 310, 420, 390, 480]} color="#9333ea" />
            </div>
          </div>

          {/* Card 5: Pipeline Revenue */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                <span>Attributed Revenue</span>
                <span className="text-emerald-700 font-bold">$</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight text-emerald-700">
                {currencyFormat.format(currentData.metrics.revenue.total)}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                <TrendUpIcon className="w-3.5 h-3.5" />
                <span>+{currentData.metrics.revenue.delta}%</span>
              </div>
              <MiniSparkline data={currentData.metrics.revenue.current} color="#059669" />
            </div>
          </div>
        </div>

        {/* 4. Hero Chart Card: Multi-Mode Master Graph with Controls */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-7 shadow-stripe space-y-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  Growth &amp; Engagement Trajectory
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                  {currentData.rangeLabel}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Switch between Spline Wave, Animated Pillar Bars, and Dual Trendlines to inspect conversion benchmarks.
              </p>
            </div>

            {/* Metric Switcher & Chart View Toggle */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Metric Type Pills */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                {[
                  { id: 'messages', label: 'Broadcasts' },
                  { id: 'reads', label: 'Reads' },
                  { id: 'replies', label: 'Replies' },
                  { id: 'revenue', label: 'Revenue ($)' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMetric(m.id as MetricType)}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      selectedMetric === m.id
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Chart Mode Switcher: Spline / Bars / Dual */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                {[
                  { id: 'spline', label: 'Spline Wave' },
                  { id: 'bars', label: 'Pillar Bars' },
                  { id: 'dual', label: 'Dual Trend' },
                ].map((ct) => (
                  <button
                    key={ct.id}
                    type="button"
                    onClick={() => setChartType(ct.id as ChartType)}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      chartType === ct.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {ct.label}
                  </button>
                ))}
              </div>

              {/* Compare toggle */}
              <button
                type="button"
                onClick={() => setShowComparison(!showComparison)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                  showComparison
                    ? 'bg-white border-slate-300 text-slate-800 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${showComparison ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span>Compare Prior</span>
              </button>
            </div>
          </div>

          <MasterInteractiveChart
            labels={currentData.labels}
            current={activeMetricData.current}
            previous={activeMetricData.previous}
            metric={selectedMetric}
            chartType={chartType}
            showCompare={showComparison}
          />
        </div>

        {/* 5. Deep Intelligence Row: Donut Chart, Speedometer Gauge, and Live Waveform */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          {/* Channel Mix Donut Chart (5 Columns) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-stripe space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Channel Share Donut
                </h3>
                <p className="text-xs text-slate-500">Interactive volume distribution by channel</p>
              </div>
              <span className="text-[11px] font-bold text-slate-400">Hover slice</span>
            </div>

            <ChannelDonutChart channelMix={currentData.channelMix} />
          </div>

          {/* Meta API Quality & Latency Gauge (4 Columns) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-stripe space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Meta Quality Gauge
                </h3>
                <p className="text-xs text-slate-500">Delivery reliability &amp; latency</p>
              </div>
              <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
            </div>

            <DeliveryHealthGauge
              rate={currentData.kpiStats.deliveredRate}
              latency={currentData.kpiStats.avgLatencyMs}
            />
          </div>

          {/* Live Waveform Monitor (3 Columns) */}
          <div className="lg:col-span-3 flex flex-col">
            <LiveThroughputWaveform tps={currentData.kpiStats.tps} />
            <div className="mt-4 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-700 font-extrabold">
                <SparkIcon className="w-3.5 h-3.5 text-purple-600" />
                <span>AI Dispatch Optimizer</span>
              </div>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                Smart dispatch is throttling send speeds to stay under Meta rate limits with 100% green sender reputation.
              </p>
            </div>
          </div>
        </div>

        {/* 6. WhatsApp Sender Number Pools Health Matrix (NEW Section) */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-stripe space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  WhatsApp &amp; Voice Sender Pool Infrastructure
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                  4 Active Trunks
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time delivery health, daily throughput limits, and zero-spam safety across all connected lines.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/settings')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Sender Numbers</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SENDER_POOLS_DATA.map((pool) => (
              <div
                key={pool.id}
                className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 truncate">{pool.name}</h4>
                    <span className="text-[10px] text-slate-400 font-medium">{pool.channel} · {pool.numbersCount} lines</span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    <CheckIcon className="w-2.5 h-2.5" />
                    <span>{pool.status}</span>
                  </span>
                </div>

                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Delivery Quality</span>
                    <span className="font-extrabold text-emerald-700 font-mono">{pool.deliveryRate}%</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Average Latency</span>
                    <span className="font-mono text-slate-800">{pool.latencyMs} ms</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Daily Capacity</span>
                    <span className="font-mono text-slate-800 text-[10px] truncate max-w-[120px]">{pool.dailyCap}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Funnel, Heatmap, and Geo Reach Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* WhatsApp Conversion Funnel (5 Columns) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-stripe space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Conversion Step Funnel
                </h3>
                <p className="text-xs text-slate-500">From broadcast to closed sale</p>
              </div>
              <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Close Rate: {((currentData.kpiStats.wonDeals / currentData.metrics.messages.total) * 100).toFixed(2)}%
              </span>
            </div>

            <div className="space-y-3.5 pt-1">
              {[
                { label: 'Messages Broadcasted', val: currentData.metrics.messages.total, pct: '100%', color: 'from-slate-700 to-slate-900' },
                { label: 'Delivered to Phones', val: Math.round(currentData.metrics.messages.total * (currentData.kpiStats.deliveredRate / 100)), pct: `${currentData.kpiStats.deliveredRate}%`, color: 'from-emerald-600 to-teal-600' },
                { label: 'Opened & Read', val: Math.round(currentData.metrics.messages.total * (currentData.kpiStats.readRate / 100)), pct: `${currentData.kpiStats.readRate}%`, color: 'from-teal-500 to-cyan-600' },
                { label: 'Customer Replied', val: currentData.metrics.replies.total, pct: `${currentData.kpiStats.replyRate}%`, color: 'from-sky-500 to-blue-600' },
                { label: 'AI Qualified Lead', val: currentData.kpiStats.qualifiedLeads, pct: '4.2%', color: 'from-purple-500 to-indigo-600' },
                { label: 'Won Deals / Sales', val: currentData.kpiStats.wonDeals, pct: '1.4%', color: 'from-amber-500 to-orange-500' },
              ].map((step, idx) => (
                <div key={step.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-700">{step.label}</span>
                    <span className="font-mono font-extrabold text-slate-900">
                      {numberFormat.format(step.val)} ({step.pct})
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${step.color} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(8, 100 - idx * 17)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Peak Engagement Heatmap (4 Columns) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-stripe space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Peak Engagement Heatmap
                </h3>
                <p className="text-xs text-slate-500">Best reply hours across 7 days</p>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                Thu 12-2 PM
              </span>
            </div>

            <div className="overflow-x-auto pb-1">
              <div className="min-w-[320px] space-y-1 text-xs">
                <div className="grid grid-cols-7 gap-1 text-[10px] font-bold text-slate-400 text-center pb-1">
                  <span className="text-left font-semibold">Day</span>
                  {TIME_SLOTS.map((s) => (
                    <span key={s}>{s.split(' ')[0]}</span>
                  ))}
                </div>

                {HEATMAP_DATA.map((row) => (
                  <div key={row.day} className="grid grid-cols-7 gap-1 items-center">
                    <span className="font-bold text-slate-700 text-xs">{row.day}</span>
                    {row.slots.map((val, idx) => {
                      let bg = 'bg-slate-100 text-slate-500'
                      if (val >= 85) bg = 'bg-emerald-600 text-white font-bold'
                      else if (val >= 65) bg = 'bg-emerald-400 text-slate-900 font-semibold'
                      else if (val >= 40) bg = 'bg-emerald-200 text-slate-800'
                      return (
                        <div
                          key={idx}
                          title={`${row.day} ${TIME_SLOTS[idx]}: ${val}% engagement`}
                          className={`h-6 rounded-md flex items-center justify-center text-[10px] transition cursor-pointer hover:ring-2 hover:ring-emerald-500 ${bg}`}
                        >
                          {val}%
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Recommended campaign launch: Thursday afternoon slot.</span>
            </div>
          </div>

          {/* Regional Reach Distribution (3 Columns) */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-stripe space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Top Markets
              </h3>
              <span className="text-xs font-bold text-slate-400">Geo Reach</span>
            </div>

            <GeoDistributionBars geoData={currentData.geoData} />
          </div>
        </div>

        {/* 8. Campaign Performance Attribution Table with Sorting & Filters */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-stripe space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Campaign Breakdown &amp; Attribution Table
              </h3>
              <p className="text-xs text-slate-500">
                Click column headers to sort, or click &ldquo;Details&rdquo; to open full campaign telemetry &amp; ROAS audit.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              {/* Channel Filter */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
                {(['All', 'WhatsApp', 'AI Voice'] as ChannelFilter[]).map((cf) => (
                  <button
                    key={cf}
                    type="button"
                    onClick={() => setChannelFilter(cf)}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                      channelFilter === cf ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cf}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
                {(['All', 'Active', 'Completed'] as StatusFilter[]).map((sf) => (
                  <button
                    key={sf}
                    type="button"
                    onClick={() => setStatusFilter(sf)}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                      statusFilter === sf ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {sf}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative">
                <SearchIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={campaignSearch}
                  onChange={(e) => setCampaignSearch(e.target.value)}
                  placeholder="Search campaigns..."
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-emerald-500 w-44"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th
                    onClick={() => handleSort('name')}
                    className="px-4 py-3.5 cursor-pointer hover:text-slate-700 select-none"
                  >
                    Campaign Name {sortField === 'name' ? (sortAsc ? '↑' : '↓') : ''}
                  </th>
                  <th className="px-3 py-3.5">Channel</th>
                  <th className="px-3 py-3.5">Sender Pool</th>
                  <th
                    onClick={() => handleSort('sent')}
                    className="px-3 py-3.5 text-right cursor-pointer hover:text-slate-700 select-none"
                  >
                    Messages {sortField === 'sent' ? (sortAsc ? '↑' : '↓') : ''}
                  </th>
                  <th
                    onClick={() => handleSort('deliveredRate')}
                    className="px-3 py-3.5 text-right cursor-pointer hover:text-slate-700 select-none"
                  >
                    Delivery {sortField === 'deliveredRate' ? (sortAsc ? '↑' : '↓') : ''}
                  </th>
                  <th
                    onClick={() => handleSort('readRate')}
                    className="px-3 py-3.5 text-right cursor-pointer hover:text-slate-700 select-none"
                  >
                    Read % {sortField === 'readRate' ? (sortAsc ? '↑' : '↓') : ''}
                  </th>
                  <th
                    onClick={() => handleSort('replies')}
                    className="px-3 py-3.5 text-right cursor-pointer hover:text-slate-700 select-none"
                  >
                    Replies {sortField === 'replies' ? (sortAsc ? '↑' : '↓') : ''}
                  </th>
                  <th
                    onClick={() => handleSort('qualified')}
                    className="px-3 py-3.5 text-right cursor-pointer hover:text-slate-700 select-none"
                  >
                    Qualified {sortField === 'qualified' ? (sortAsc ? '↑' : '↓') : ''}
                  </th>
                  <th
                    onClick={() => handleSort('revenue')}
                    className="px-4 py-3.5 text-right cursor-pointer hover:text-slate-700 select-none"
                  >
                    Revenue {sortField === 'revenue' ? (sortAsc ? '↑' : '↓') : ''}
                  </th>
                  <th className="px-3 py-3.5 text-center">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredAndSortedCampaigns.map((cmp) => (
                  <tr key={cmp.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-extrabold text-slate-900">{cmp.name}</div>
                      <span className="text-[10px] text-slate-400">{cmp.status}</span>
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          cmp.channel === 'WhatsApp'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                            : 'bg-teal-50 text-teal-800 border border-teal-200/60'
                        }`}
                      >
                        {cmp.channel === 'WhatsApp' ? (
                          <WhatsAppIcon className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <HeadsetIcon className="w-3 h-3 text-teal-600" />
                        )}
                        <span>{cmp.channel}</span>
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-slate-500 font-mono text-[11px]">{cmp.senderPool}</td>
                    <td className="px-3 py-3.5 text-right font-mono font-bold text-slate-800">
                      {numberFormat.format(cmp.sent)}
                    </td>
                    <td className="px-3 py-3.5 text-right font-mono font-bold text-emerald-700">
                      {cmp.deliveredRate}%
                    </td>
                    <td className="px-3 py-3.5 text-right font-mono text-slate-700">{cmp.readRate}%</td>
                    <td className="px-3 py-3.5 text-right font-mono font-bold text-sky-700">
                      {numberFormat.format(cmp.replies)}
                    </td>
                    <td className="px-3 py-3.5 text-right font-mono text-purple-700 font-bold">
                      {numberFormat.format(cmp.qualified)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-extrabold text-emerald-700">
                      {currencyFormat.format(cmp.revenue)}
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => setActiveDrilldownCampaign(cmp)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-[11px] font-bold transition cursor-pointer"
                      >
                        <span>Audit</span>
                        <ArrowRightIcon className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Campaign Drilldown Slide-Over Modal */}
      {activeDrilldownCampaign && (
        <CampaignDetailModal
          campaign={activeDrilldownCampaign}
          onClose={() => setActiveDrilldownCampaign(null)}
          onRerun={(name) => {
            setActiveDrilldownCampaign(null)
            notify(`Triggered broadcast replay for: "${name}" across all sender pools.`)
          }}
        />
      )}

      {/* Toast Alert */}
      {toast && <Toast message={toast.message} onClose={closeToast} />}
    </DashboardLayout>
  )
}
