import { useCallback, useMemo, useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { DashboardLayout } from '../components/dashboard/DashboardLayout'
import {
  CAMPAIGNS,
  HOT_LEADS,
  LIVE_CALLS,
} from '../components/dashboard/campaignData'
import type { Campaign, LiveCall, PriorityLead } from '../components/dashboard/campaignData'
import {
  CalendarIcon,
  CheckCircleIcon,
  ContactsIcon,
  MegaphoneIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  SearchIcon,
  TrendUpIcon,
  UploadIcon,
  WhatsAppIcon,
} from '../components/dashboard/DashboardIcons'
import { ImportContactsModal } from '../components/dashboard/ImportContactsModal'
import { NewCampaignModal } from '../components/dashboard/NewCampaignModal'
import type { NewCampaignInput } from '../components/dashboard/NewCampaignModal'
import { Toast } from '../components/dashboard/Toast'
import { Avatar } from '../components/Avatar'
import { SparkIcon } from '../components/icons'
import { speakAgentLine, stopAgentSpeech } from '../lib/audioVoice'
import { usePageTitle } from '../lib/usePageTitle'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'short',
  day: 'numeric',
})

type Timeframe = 'today' | 'week' | 'month' | 'target'

type TimeframeData = {
  broadcasts: string
  broadcastsChange: string
  broadcastsSub: string
  senders: string
  sendersSub: string
  pipeline: string
  pipelineChange: string
  pipelineSub: string
  duration: string
  durationChange: string
  durationSub: string
  credits: string
  creditsSub: string
  creditsPercent: number
  funnelSent: number
  funnelDelivered: number
  funnelRead: number
  funnelReplied: number
  funnelQualified: number
}

const TIMEFRAME_STATS: Record<Timeframe, TimeframeData> = {
  today: {
    broadcasts: '1,284',
    broadcastsChange: '+8.2%',
    broadcastsSub: '1,192 delivered (92.8%)',
    senders: '32 Active',
    sendersSub: 'WhatsApp Cloud API 21.0',
    pipeline: '$38,400',
    pipelineChange: '+14.5%',
    pipelineSub: '186 qualified replies today',
    duration: '42s',
    durationChange: '-8s',
    durationSub: 'Avg read-to-reply time',
    credits: '1,600',
    creditsSub: '320 credits used today',
    creditsPercent: 68,
    funnelSent: 1284,
    funnelDelivered: 1192,
    funnelRead: 986,
    funnelReplied: 312,
    funnelQualified: 186,
  },
  week: {
    broadcasts: '12,486',
    broadcastsChange: '+18.4%',
    broadcastsSub: '11,840 delivered (94.8%)',
    senders: '32 Active',
    sendersSub: 'High-throughput broadcast pool',
    pipeline: '$248,500',
    pipelineChange: '+24.6%',
    pipelineSub: '1,428 qualified buyer replies',
    duration: '48s',
    durationChange: '-12s',
    durationSub: 'Avg customer read latency',
    credits: '1,600 / 5,000',
    creditsSub: 'Burn rate: ~140 credits/day',
    creditsPercent: 32,
    funnelSent: 12486,
    funnelDelivered: 11840,
    funnelRead: 9800,
    funnelReplied: 3071,
    funnelQualified: 1428,
  },
  month: {
    broadcasts: '48,920',
    broadcastsChange: '+22.1%',
    broadcastsSub: '46,500 delivered (95.1%)',
    senders: '32 Active',
    sendersSub: '100% Meta API health rating',
    pipeline: '$964,000',
    pipelineChange: '+31.4%',
    pipelineSub: '5,840 qualified inbound leads',
    duration: '52s',
    durationChange: '-15s',
    durationSub: 'Avg conversion velocity',
    credits: '1,600 / 5,000',
    creditsSub: 'Auto-refill at 500 threshold',
    creditsPercent: 32,
    funnelSent: 48920,
    funnelDelivered: 46500,
    funnelRead: 38400,
    funnelReplied: 11950,
    funnelQualified: 5840,
  },
  target: {
    broadcasts: '60,000',
    broadcastsChange: '81.5% of goal',
    broadcastsSub: 'Goal: 75,000 WhatsApp broadcasts',
    senders: '32 / 40',
    sendersSub: 'Scaling +8 phone numbers',
    pipeline: '$1,200,000',
    pipelineChange: '80.3% of goal',
    pipelineSub: 'Q4 WhatsApp Revenue Target',
    duration: '40s',
    durationChange: 'Optimal',
    durationSub: 'Target: <45s read response',
    credits: 'Pro Tier',
    creditsSub: 'Unlimited concurrency active',
    creditsPercent: 80,
    funnelSent: 60000,
    funnelDelivered: 57600,
    funnelRead: 49200,
    funnelReplied: 16800,
    funnelQualified: 8200,
  },
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

// Sparkline SVG helper for modern Apple/Stripe metric cards
function MetricSparkline({ points, color = '#10b981' }: { points: number[]; color?: string }) {
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const width = 96
  const height = 24

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

  const last = coords[coords.length - 1]
  const gradId = `spark-grad-${color.replace(/[^a-zA-Z0-9]/g, '')}`

  return (
    <svg className="w-24 h-6 overflow-visible" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path
        d={`${line} L ${width} ${height} L 0 ${height} Z`}
        fill={`url(#${gradId})`}
      />
      <path d={line} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r="3" fill="#ffffff" stroke={color} strokeWidth="2.4" />
    </svg>
  )
}


export function DashboardPage() {
  usePageTitle('Dashboard · CallWave WhatsApp Marketing & CRM')

  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const firstName = user?.name ? user.name.split(/\s+/)[0] : 'there'

  // Dashboard state
  const [timeframe, setTimeframe] = useState<Timeframe>('week')
  const [search, setSearch] = useState('')
  const [campaignFilter, setCampaignFilter] = useState<'All' | 'Active' | 'Paused' | 'Scheduled' | 'Draft'>('All')
  const [campaigns, setCampaigns] = useState<Campaign[]>(CAMPAIGNS)

  // Live Audio Call Simulation state
  const [activeCallId, setActiveCallId] = useState<string | null>(null)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [activeLiveCall, setActiveLiveCall] = useState<LiveCall>(LIVE_CALLS[0])

  // AI Studio interactive test state
  const [aiTone, setAiTone] = useState<'Consultative' | 'Urgent VIP' | 'Friendly' | 'Closer'>('Consultative')
  const [recipientName, setRecipientName] = useState('Sarah Jenkins')
  const [discountCode, setDiscountCode] = useState('VIP40')

  // Modals & Toast
  const [campaignModalOpen, setCampaignModalOpen] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [toast, setToast] = useState<{ id: number; message: string } | null>(() =>
    searchParams.get('welcome') === 'google'
      ? {
          id: 1,
          message: 'Signed in with Google. Welcome to your WhatsApp Marketing Dashboard.',
        }
      : null,
  )

  const notify = useCallback((message: string) => {
    setToast({ id: Date.now(), message })
  }, [])

  const closeToast = useCallback(() => setToast(null), [])
  const closeCampaignModal = useCallback(() => setCampaignModalOpen(false), [])

  // Audio speech handler
  function handleListenIn(call: LiveCall) {
    if (activeCallId === call.id && isPlayingAudio) {
      stopAgentSpeech()
      setIsPlayingAudio(false)
      setActiveCallId(null)
      return
    }

    stopAgentSpeech()
    setActiveCallId(call.id)
    setIsPlayingAudio(true)
    setActiveLiveCall(call)

    speakAgentLine(call.speechLine, {
      onEnd: () => {
        setIsPlayingAudio(false)
        setActiveCallId(null)
      },
      onError: () => {
        setIsPlayingAudio(false)
        setActiveCallId(null)
        notify(`Simulated WhatsApp voice note preview for ${call.leadName}.`)
      },
    })
  }

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      stopAgentSpeech()
    }
  }, [])

  function handleCreateCampaign(input: NewCampaignInput) {
    const campaign: Campaign = {
      id: `campaign-${Date.now()}`,
      name: input.name,
      channel: input.aiPersonalization ? 'WhatsApp Bulk + AI' : 'WhatsApp Bulk',
      meta: `${input.audience.label} · Just now`,
      status: 'Active',
      progress: 0,
      connectRate: '98.5%',
      contacts: input.audience.contacts,
      aiPersonalized: input.aiPersonalization,
    }

    setCampaigns((current) => [campaign, ...current])
    setCampaignFilter('All')
    setSearch('')
    setCampaignModalOpen(false)
    notify(`“${input.name}” broadcast launched. WhatsApp Cloud API engine started.`)
  }

  function handleToggleCampaignStatus(id: string) {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextStatus = c.status === 'Active' ? 'Paused' : 'Active'
          notify(`“${c.name}” is now ${nextStatus.toLowerCase()}.`)
          return { ...c, status: nextStatus }
        }
        return c
      }),
    )
  }

  function handleTriggerLeadDial(lead: PriorityLead) {
    navigate('/inbox')
    notify(`Opening live WhatsApp conversation with ${lead.name} (${lead.phone})…`)
  }

  function handleImportSuccess(count: number, filename: string) {
    notify(`Successfully ingested ${count.toLocaleString()} contacts from ${filename} into WhatsApp CRM.`)
  }

  const currentStats = TIMEFRAME_STATS[timeframe]

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    const query = search.toLowerCase().trim()
    return campaigns.filter((c) => {
      const matchesFilter = campaignFilter === 'All' || c.status === campaignFilter
      const matchesSearch =
        !query ||
        c.name.toLowerCase().includes(query) ||
        c.channel.toLowerCase().includes(query) ||
        c.meta.toLowerCase().includes(query)
      return matchesFilter && matchesSearch
    })
  }, [campaigns, campaignFilter, search])

  return (
    <>
      <DashboardLayout
        search={search}
        activeNav="dashboard"
        onSearchChange={setSearch}
        onNotice={notify}
        onNewCampaign={() => setCampaignModalOpen(true)}
      >
        <div className="w-full space-y-3.5 sm:space-y-4 pb-8 pt-0">
          {/* ========================================================================= */}
          {/* 1. EXECUTIVE MISSION CONTROL HEADER (Apple/Stripe Ultra Light - Compact)  */}
          {/* ========================================================================= */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-200/70 shadow-[0_10px_30px_-15px_rgba(15,80,55,0.06),0_1px_3px_rgba(0,0,0,0.02)] p-4 sm:p-5">
            {/* Soft Ambient Mesh Radial Accents */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-emerald-400/15 via-teal-300/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-teal-400/10 via-emerald-200/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-3 sm:gap-3.5">
              {/* Telemetry Status Strip */}
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                {/* Live System Pulse */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/90 border border-emerald-200/70 text-emerald-800 font-semibold shadow-2xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>32 WhatsApp Senders Live</span>
                </div>

                {/* Latency Pill */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 border border-slate-200/80 text-slate-700 font-medium shadow-2xs">
                  <span className="text-amber-500 font-bold">⚡</span>
                  <span>42ms Latency</span>
                </div>

                {/* Delivery Success Rate */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 border border-slate-200/80 text-slate-700 font-medium shadow-2xs">
                  <span className="text-emerald-500 font-bold">🎯</span>
                  <span>94.8% Read Rate</span>
                </div>

                {/* Meta Official Cloud API Status */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 font-medium">
                  <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Meta Cloud API v21.0 Active</span>
                </div>

                {/* Current Date */}
                <div className="ml-auto hidden md:flex items-center gap-1.5 text-slate-400 font-medium">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>{dateFormatter.format(new Date())}</span>
                </div>
              </div>

              {/* Title & Timeframe Selector Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <div className="inline-flex items-center gap-2 mb-0.5">
                    <span className="px-2 py-0.2 rounded-full bg-emerald-100/80 text-emerald-800 font-extrabold text-[9.5px] tracking-wider uppercase border border-emerald-200/60">
                      Executive Mission Control
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {getGreeting()}, <span className="bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">{firstName}</span>.
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5 max-w-4xl font-normal leading-normal">
                    Autonomous WhatsApp Bulk Broadcasting, AI Chatbots, Multi-Agent Inbox &amp; High-Velocity CRM Pipeline.
                  </p>
                </div>

                {/* Timeframe Filter Switcher */}
                <div className="flex items-center bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/80 shadow-inner self-start sm:self-auto">
                  {(
                    [
                      { id: 'today', label: 'Today' },
                      { id: 'week', label: '7 Days' },
                      { id: 'month', label: '30 Days' },
                      { id: 'target', label: 'Q4 Target' },
                    ] as const
                  ).map((tab) => {
                    const active = timeframe === tab.id
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setTimeframe(tab.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${
                          active
                            ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/40'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {tab.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Quick Action Buttons Strip */}
              <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-100/90">
                <button
                  type="button"
                  onClick={() => setCampaignModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-sm shadow-emerald-500/25 active:scale-[0.98] transition-all border border-emerald-400/30"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  <span>Launch WhatsApp Broadcast</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/inbox')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs hover:border-slate-300 active:scale-[0.98] transition-all"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Live WhatsApp Inbox</span>
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[9.5px] font-extrabold">
                    4
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setImportModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs hover:border-slate-300 active:scale-[0.98] transition-all"
                >
                  <UploadIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>Import Contacts (CSV/Excel)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    notify('AI Broadcast Optimizer simulated: Delivery throughput enhanced to 480 msg/sec.')
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-all ml-auto shadow-2xs"
                >
                  <SparkIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>AI Engine Turbo: Active</span>
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. FIVE ELEVATED KPI METRIC CARDS (Apple / Stripe Ultra Light - Compact)   */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* KPI 1: WhatsApp Broadcasts */}
            <div className="relative overflow-hidden rounded-2xl bg-white/95 backdrop-blur-xl p-3.5 sm:p-4 border border-slate-200/70 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-emerald-400/10 to-transparent rounded-full blur-2xl group-hover:scale-125 transition-transform pointer-events-none" />
              
              <div className="flex items-center justify-between mb-2 relative z-10">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Broadcasts Sent
                </span>
                <div className="w-7.5 h-7.5 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-2xs group-hover:scale-110 transition-transform">
                  <WhatsAppIcon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between mb-1 relative z-10">
                <span className="text-xl font-black text-slate-900 tracking-tight">
                  {currentStats.broadcasts}
                </span>
                <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50/90 border border-emerald-200/60 px-1.5 py-0.5 rounded-full shadow-2xs">
                  <TrendUpIcon className="w-2.5 h-2.5 mr-0.5" />
                  {currentStats.broadcastsChange}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2 truncate relative z-10">{currentStats.broadcastsSub}</p>
              <div className="pt-1.5 border-t border-slate-100/90 flex items-center justify-between relative z-10">
                <MetricSparkline points={[19, 22, 20, 25, 24, 29, 27, 33, 31, 36]} color="#10b981" />
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">vs prior</span>
              </div>
            </div>

            {/* KPI 2: Active Senders */}
            <div className="relative overflow-hidden rounded-2xl bg-white/95 backdrop-blur-xl p-3.5 sm:p-4 border border-slate-200/70 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-teal-400/10 to-transparent rounded-full blur-2xl group-hover:scale-125 transition-transform pointer-events-none" />

              <div className="flex items-center justify-between mb-2 relative z-10">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Active Senders
                </span>
                <div className="w-7.5 h-7.5 rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 flex items-center justify-center text-teal-600 shadow-2xs group-hover:scale-110 transition-transform">
                  <MegaphoneIcon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between mb-1 relative z-10">
                <span className="text-xl font-black text-slate-900 tracking-tight">
                  {currentStats.senders}
                </span>
                <span className="inline-flex items-center text-[11px] font-bold text-teal-700 bg-teal-50/90 border border-teal-200/60 px-1.5 py-0.5 rounded-full shadow-2xs">
                  100% Health
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2 truncate relative z-10">{currentStats.sendersSub}</p>
              <div className="pt-1.5 border-t border-slate-100/90 flex items-center justify-between relative z-10">
                <MetricSparkline points={[12, 14, 13, 16, 15, 18, 17, 20, 19, 22]} color="#0d9488" />
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">Meta Pool</span>
              </div>
            </div>

            {/* KPI 3: Pipeline Generated */}
            <div className="relative overflow-hidden rounded-2xl bg-white/95 backdrop-blur-xl p-3.5 sm:p-4 border border-slate-200/70 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-emerald-400/10 to-transparent rounded-full blur-2xl group-hover:scale-125 transition-transform pointer-events-none" />

              <div className="flex items-center justify-between mb-2 relative z-10">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Pipeline Impact
                </span>
                <div className="w-7.5 h-7.5 rounded-lg bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-2xs group-hover:scale-110 transition-transform">
                  <ContactsIcon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between mb-1 relative z-10">
                <span className="text-xl font-black text-slate-900 tracking-tight">
                  {currentStats.pipeline}
                </span>
                <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50/90 border border-emerald-200/60 px-1.5 py-0.5 rounded-full shadow-2xs">
                  <TrendUpIcon className="w-2.5 h-2.5 mr-0.5" />
                  {currentStats.pipelineChange}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2 truncate relative z-10">{currentStats.pipelineSub}</p>
              <div className="pt-1.5 border-t border-slate-100/90 flex items-center justify-between relative z-10">
                <MetricSparkline points={[14, 16, 18, 22, 21, 26, 29, 31, 35, 40]} color="#059669" />
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">Qualified</span>
              </div>
            </div>

            {/* KPI 4: Response Velocity */}
            <div className="relative overflow-hidden rounded-2xl bg-white/95 backdrop-blur-xl p-3.5 sm:p-4 border border-slate-200/70 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full blur-2xl group-hover:scale-125 transition-transform pointer-events-none" />

              <div className="flex items-center justify-between mb-2 relative z-10">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Avg Velocity
                </span>
                <div className="w-7.5 h-7.5 rounded-lg bg-gradient-to-br from-cyan-50 to-sky-50 border border-cyan-100 flex items-center justify-center text-cyan-600 shadow-2xs group-hover:scale-110 transition-transform">
                  <SparkIcon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between mb-1 relative z-10">
                <span className="text-xl font-black text-slate-900 tracking-tight">
                  {currentStats.duration}
                </span>
                <span className="inline-flex items-center text-[11px] font-bold text-cyan-700 bg-cyan-50/90 border border-cyan-200/60 px-1.5 py-0.5 rounded-full shadow-2xs">
                  {currentStats.durationChange}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2 truncate relative z-10">{currentStats.durationSub}</p>
              <div className="pt-1.5 border-t border-slate-100/90 flex items-center justify-between relative z-10">
                <MetricSparkline points={[16, 14, 18, 17, 21, 19, 24, 22, 27, 29]} color="#0891b2" />
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">Lead reply</span>
              </div>
            </div>

            {/* KPI 5: WhatsApp Credits */}
            <div className="relative overflow-hidden rounded-2xl bg-white/95 backdrop-blur-xl p-3.5 sm:p-4 border border-slate-200/70 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-amber-400/10 to-transparent rounded-full blur-2xl group-hover:scale-125 transition-transform pointer-events-none" />

              <div className="flex items-center justify-between mb-2 relative z-10">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Credits Balance
                </span>
                <div className="w-7.5 h-7.5 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-2xs group-hover:scale-110 transition-transform">
                  <CheckCircleIcon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between mb-1 relative z-10">
                <span className="text-xl font-black text-slate-900 tracking-tight">
                  {currentStats.credits}
                </span>
                <span className="inline-flex items-center text-[11px] font-bold text-emerald-800 bg-emerald-50/90 border border-emerald-200/60 px-1.5 py-0.5 rounded-full shadow-2xs">
                  Auto-Refill
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2 truncate relative z-10">{currentStats.creditsSub}</p>
              {/* Progress bar */}
              <div className="pt-1.5 border-t border-slate-100/90 relative z-10">
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden p-0.5 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${currentStats.creditsPercent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-1.5 text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>Pro Tier</span>
                  <span className="text-emerald-600">99.9% uptime</span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. INTERACTIVE BROADCAST & CONVERSION FUNNEL (Apple/Stripe - Compact)     */}
          {/* ========================================================================= */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-200/70 shadow-[0_10px_30px_-15px_rgba(15,80,55,0.06),0_1px_3px_rgba(0,0,0,0.02)] p-4 sm:p-5">
            <div className="absolute -top-28 -right-28 w-80 h-80 bg-gradient-to-br from-emerald-400/10 via-teal-300/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                    WhatsApp Broadcast &amp; Engagement Funnel
                  </h2>
                  <span className="px-2 py-0.2 rounded-full bg-emerald-100/80 text-emerald-800 text-[10px] font-bold border border-emerald-200/60 shadow-2xs">
                    Live Meta Telemetry
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-normal">
                  End-to-end delivery tracking from Meta cloud gateway down to qualified buyer opportunities.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs font-bold text-slate-700 bg-slate-100/90 px-2.5 py-1 rounded-lg border border-slate-200/70 shadow-2xs">
                  Window: <span className="text-emerald-700 uppercase">{timeframe}</span>
                </span>
              </div>
            </div>

            {/* 5-Step Funnel Grid */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-5 gap-2.5">
              {/* Step 1: Queued & Sent */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:border-slate-300 hover:bg-white hover:shadow-xs transition-all duration-200 group">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                  <span className="font-bold text-slate-700">1. Dispatched</span>
                  <span className="text-slate-400 font-semibold">100%</span>
                </div>
                <div className="text-xl font-black text-slate-900 mb-1.5 tracking-tight">
                  {currentStats.funnelSent.toLocaleString()}
                </div>
                <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden mb-2">
                  <div className="bg-slate-700 h-full w-full rounded-full" />
                </div>
                <span className="text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                  <span className="text-emerald-600 font-bold">✓</span> Meta API Queue
                </span>
              </div>

              {/* Step 2: Delivered */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-200/60 hover:border-emerald-300 hover:bg-white hover:shadow-xs transition-all duration-200 group">
                <div className="flex items-center justify-between text-[11px] text-emerald-900 mb-1.5">
                  <span className="font-bold text-emerald-900">2. Delivered</span>
                  <span className="font-extrabold text-emerald-700">
                    {((currentStats.funnelDelivered / currentStats.funnelSent) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-xl font-black text-slate-900 mb-1.5 tracking-tight">
                  {currentStats.funnelDelivered.toLocaleString()}
                </div>
                <div className="w-full bg-emerald-100/70 h-1.5 rounded-full overflow-hidden mb-2">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(currentStats.funnelDelivered / currentStats.funnelSent) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-emerald-800 flex items-center gap-1">
                  <span className="text-slate-400 font-bold">✓✓</span> Double Ticks
                </span>
              </div>

              {/* Step 3: Read */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-teal-50/40 border border-teal-200/60 hover:border-teal-300 hover:bg-white hover:shadow-xs transition-all duration-200 group">
                <div className="flex items-center justify-between text-[11px] text-teal-900 mb-1.5">
                  <span className="font-bold text-teal-900">3. Read by Lead</span>
                  <span className="font-extrabold text-teal-700">
                    {((currentStats.funnelRead / currentStats.funnelSent) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-xl font-black text-slate-900 mb-1.5 tracking-tight">
                  {currentStats.funnelRead.toLocaleString()}
                </div>
                <div className="w-full bg-teal-100/70 h-1.5 rounded-full overflow-hidden mb-2">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(currentStats.funnelRead / currentStats.funnelSent) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-teal-800 flex items-center gap-1">
                  <span className="text-sky-500 font-bold">✓✓</span> Blue Receipts
                </span>
              </div>

              {/* Step 4: Inbound Reply */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-cyan-50/40 border border-cyan-200/60 hover:border-cyan-300 hover:bg-white hover:shadow-xs transition-all duration-200 group">
                <div className="flex items-center justify-between text-[11px] text-cyan-900 mb-1.5">
                  <span className="font-bold text-cyan-900">4. Replied</span>
                  <span className="font-extrabold text-cyan-700">
                    {((currentStats.funnelReplied / currentStats.funnelSent) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-xl font-black text-slate-900 mb-1.5 tracking-tight">
                  {currentStats.funnelReplied.toLocaleString()}
                </div>
                <div className="w-full bg-cyan-100/70 h-1.5 rounded-full overflow-hidden mb-2">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(currentStats.funnelReplied / currentStats.funnelSent) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-cyan-800 flex items-center gap-1">
                  <span>💬</span> 2-Way Reply
                </span>
              </div>

              {/* Step 5: Qualified Lead */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-amber-50/40 border border-amber-200/60 hover:border-amber-300 hover:bg-white hover:shadow-xs transition-all duration-200 group">
                <div className="flex items-center justify-between text-[11px] text-amber-900 mb-1.5">
                  <span className="font-bold text-amber-900">5. Qualified</span>
                  <span className="font-extrabold text-amber-700">
                    {((currentStats.funnelQualified / currentStats.funnelSent) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-xl font-black text-slate-900 mb-1.5 tracking-tight">
                  {currentStats.funnelQualified.toLocaleString()}
                </div>
                <div className="w-full bg-amber-100/70 h-1.5 rounded-full overflow-hidden mb-2">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(currentStats.funnelQualified / currentStats.funnelSent) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-amber-800 flex items-center gap-1">
                  <span>🎯</span> Deals
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4. REAL-TIME AI BROADCAST FEED & SMART TEMPLATE STUDIO (Grid)             */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4">
            {/* Left Column (7 cols): Live Stream of WhatsApp Conversations */}
            <div className="lg:col-span-7 relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-200/70 shadow-[0_10px_30px_-15px_rgba(15,80,55,0.06),0_1px_3px_rgba(0,0,0,0.02)] p-4 sm:p-5 flex flex-col justify-between">
              <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                      Live Broadcast Stream &amp; Voice Synthesis
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/inbox')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
                  >
                    <span>View Inbox ({LIVE_CALLS.length})</span>
                    <span>→</span>
                  </button>
                </div>
                <p className="text-xs text-slate-600 mb-3 font-normal">
                  Synthesized voice notes and live inbound replies from top prospective buyers.
                </p>

                {/* Call Cards List */}
                <div className="space-y-2">
                  {LIVE_CALLS.slice(0, 3).map((call) => {
                    const isSelected = activeLiveCall.id === call.id
                    const isSpeakingThis = activeCallId === call.id && isPlayingAudio

                    return (
                      <div
                        key={call.id}
                        className={`p-3 rounded-xl border transition-all duration-200 ${
                          isSelected
                            ? 'bg-gradient-to-r from-emerald-50/60 to-white border-emerald-300 shadow-xs'
                            : 'bg-white/80 border-slate-200/80 hover:border-slate-300 hover:shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex items-center gap-2.5">
                            <span className="inline-block ring-2 ring-emerald-200/80 rounded-full overflow-hidden shadow-2xs">
                              <Avatar name={call.leadName} />
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h3 className="text-xs font-bold text-slate-900">{call.leadName}</h3>
                                <span className="text-[9.5px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/60">
                                  {call.sentiment}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {call.leadRole} · <span className="font-semibold text-slate-700">{call.company}</span> ({call.location})
                              </p>
                            </div>
                          </div>

                          {/* Audio Player Action */}
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleListenIn(call)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                isSpeakingThis
                                  ? 'bg-rose-600 text-white shadow-xs animate-pulse'
                                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-2xs'
                              }`}
                            >
                              {isSpeakingThis ? (
                                <>
                                  <PauseIcon className="w-3 h-3" />
                                  <span>Stop</span>
                                  <span className="flex items-center gap-0.5 ml-0.5">
                                    <span className="w-0.5 h-2 bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-0.5 h-3 bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-0.5 h-1.5 bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
                                  </span>
                                </>
                              ) : (
                                <>
                                  <PlayIcon className="w-3 h-3" />
                                  <span>Voice Note</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                navigate('/inbox')
                                notify(`Opening WhatsApp chat thread with ${call.leadName}…`)
                              }}
                              className="p-1 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 text-slate-600 hover:text-emerald-700 transition-colors shadow-2xs"
                              title="Open in WhatsApp Inbox"
                            >
                              <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
                            </button>
                          </div>
                        </div>

                        {/* Speech snippet */}
                        <div className="mt-2 p-2 rounded-lg bg-slate-50/80 border border-slate-200/60 text-xs text-slate-700 font-normal leading-relaxed flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold shrink-0">AI:</span>
                          <p className="italic">“{call.speechLine}”</p>
                        </div>

                        {/* Telemetry metadata */}
                        <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                          <div className="flex items-center gap-2">
                            <span>Topic: <strong className="text-slate-700">{call.topic}</strong></span>
                            <span>•</span>
                            <span>Model: <strong className="text-slate-700">{call.agentModel}</strong></span>
                          </div>
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                            Intent: {call.intentScore}%
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Bottom Quick Broadcast Tip */}
              <div className="relative z-10 mt-3 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70 flex items-center justify-between text-xs text-emerald-950">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-emerald-600 font-bold">ℹ️</span>
                  <span>WhatsApp rate limiter allows up to <strong>1,000 msg/min</strong> per pool.</span>
                </span>
                <span
                  className="text-emerald-800 font-bold hover:underline cursor-pointer bg-emerald-100/80 px-2 py-0.5 rounded text-[10px]"
                  onClick={() => notify('Fleet configuration is healthy: 0 errors reported in last 24h.')}
                >
                  Fleet 100% Healthy
                </span>
              </div>
            </div>

            {/* Right Column (5 cols): WhatsApp Interactive Preview & AI Studio */}
            <div className="lg:col-span-5 relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-200/70 shadow-[0_10px_30px_-15px_rgba(15,80,55,0.06),0_1px_3px_rgba(0,0,0,0.02)] p-4 sm:p-5 flex flex-col justify-between">
              <div className="absolute -top-24 -right-24 w-72 h-72 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-xs shadow-2xs">
                      AI
                    </div>
                    <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                      Template &amp; Personalizer
                    </h2>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.2 rounded-full border border-emerald-200/60">
                    99.4% Match
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-2.5 font-normal">
                  Live preview of dynamic WhatsApp variables and persuasive tones.
                </p>

                {/* Tone Selector Pills */}
                <div className="mb-2.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    AI Persuasion Persona
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['Consultative', 'Urgent VIP', 'Friendly', 'Closer'] as const).map((tone) => (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => {
                          setAiTone(tone)
                          notify(`Template persona switched to ${tone}.`)
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all text-left flex items-center justify-between ${
                          aiTone === tone
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs shadow-emerald-500/20'
                            : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/70 border border-slate-200/50'
                        }`}
                      >
                        <span>{tone}</span>
                        {aiTone === tone && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Simulated Apple-style WhatsApp Phone Frame */}
                <div className="rounded-2xl overflow-hidden border-2 border-slate-800 bg-[#0b141a] text-slate-100 shadow-md relative">
                  {/* WhatsApp Topbar */}
                  <div className="bg-[#1f2c34] px-3 py-2 flex items-center gap-2.5 border-b border-slate-700/80">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs ring-1 ring-white/20">
                      CW
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-white">CallWave Verified AI</span>
                        <span className="text-[10px] text-emerald-400">✓</span>
                      </div>
                      <span className="text-[9.5px] text-emerald-400 font-medium">Business Account · online</span>
                    </div>
                  </div>

                  {/* Chat Area */}
                  <div
                    className="p-3 space-y-2 min-h-[170px] bg-repeat"
                    style={{
                      backgroundColor: '#0b141a',
                      backgroundImage: `radial-gradient(#1f2c34 1px, transparent 1px)`,
                      backgroundSize: '16px 16px',
                    }}
                  >
                    {/* Timestamp */}
                    <div className="flex justify-center">
                      <span className="text-[9px] bg-[#182229] text-slate-400 px-2 py-0.2 rounded font-medium">
                        Today
                      </span>
                    </div>

                    {/* WhatsApp Outbound Message Bubble */}
                    <div className="flex justify-end">
                      <div className="max-w-[90%] rounded-xl rounded-tr-xs bg-[#005c4b] text-white p-2.5 shadow-xs text-xs space-y-1.5">
                        <p className="font-normal leading-snug">
                          Hello <span className="bg-emerald-800/80 px-1 py-0.2 rounded font-bold text-emerald-200">{recipientName}</span>! 👋
                        </p>
                        <p className="leading-snug">
                          {aiTone === 'Urgent VIP'
                            ? `Only 2 priority slots remain for Q4 onboarding. We have reserved special discount code `
                            : `We reviewed your company's high WhatsApp messaging volume and reserved special discount code `}
                          <span className="bg-emerald-800/90 px-1 py-0.2 rounded font-bold text-amber-300">{discountCode}</span>.
                        </p>
                        <p className="leading-snug">
                          Would you like to lock this in before Friday?
                        </p>
                        <div className="flex items-center justify-end gap-1 text-[9.5px] text-emerald-300 pt-0.5">
                          <span>11:42 AM</span>
                          <span className="text-sky-400 font-bold">✓✓</span>
                        </div>
                      </div>
                    </div>

                    {/* Interactive WhatsApp Quick Reply Action Pills */}
                    <div className="flex flex-col gap-1 pt-0.5 max-w-[90%] ml-auto">
                      <button
                        type="button"
                        onClick={() => notify('Simulated response: Client clicked "Confirm VIP Slot"!')}
                        className="w-full text-center py-1.5 px-2.5 rounded-lg bg-[#202c33] hover:bg-[#2a3942] text-emerald-400 text-xs font-bold border border-slate-700/80 transition-colors shadow-2xs"
                      >
                        🚀 Yes, Confirm VIP Slot
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic inputs */}
              <div className="relative z-10 mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">
                    Sample Name
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200/80 text-slate-900 bg-white shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">
                    Promo Code
                  </label>
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200/80 text-slate-900 bg-white shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-xs uppercase font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 5. ACTIVE CAMPAIGNS HUB & TABLE (Apple/Stripe Ultra Light - Compact)       */}
          {/* ========================================================================= */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-200/70 shadow-[0_10px_30px_-15px_rgba(15,80,55,0.06),0_1px_3px_rgba(0,0,0,0.02)] p-4 sm:p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                    WhatsApp Marketing Campaigns
                  </h2>
                  <span className="px-2 py-0.2 rounded-full bg-emerald-100/80 text-emerald-800 text-[10px] font-bold border border-emerald-200/60 shadow-2xs">
                    {campaigns.length} Total
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 font-normal">
                  Manage broadcast delivery queues, review conversion rates, and toggle live sending status.
                </p>
              </div>

              {/* Campaign Filter Tabs */}
              <div className="flex flex-wrap items-center bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/80 shadow-inner">
                {(['All', 'Active', 'Paused', 'Scheduled', 'Draft'] as const).map((status) => {
                  const count = status === 'All' ? campaigns.length : campaigns.filter((c) => c.status === status).length
                  const active = campaignFilter === status

                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setCampaignFilter(status)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        active
                          ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/40'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>{status}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[9.5px] font-extrabold ${active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Search Input Bar for Campaigns */}
            <div className="relative mb-3.5">
              <SearchIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search campaigns by name, audience, or channel…"
                className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-200/80 text-xs text-slate-900 placeholder-slate-400 bg-white/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Tailwind Table Container */}
            <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th scope="col" className="px-3.5 py-2.5">
                      Campaign &amp; Audience
                    </th>
                    <th scope="col" className="px-3 py-2.5">
                      Channel Type
                    </th>
                    <th scope="col" className="px-3 py-2.5">
                      Delivery Progress
                    </th>
                    <th scope="col" className="px-3 py-2.5">
                      Connect Rate
                    </th>
                    <th scope="col" className="px-3 py-2.5">
                      Status
                    </th>
                    <th scope="col" className="px-3.5 py-2.5 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredCampaigns.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <MegaphoneIcon className="w-6 h-6 text-slate-300" />
                          <p className="font-semibold text-slate-700 text-xs">No campaigns match your search.</p>
                          <button
                            type="button"
                            onClick={() => {
                              setSearch('')
                              setCampaignFilter('All')
                            }}
                            className="text-xs font-bold text-emerald-600 hover:underline"
                          >
                            Reset filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCampaigns.map((campaign) => {
                      const isPaused = campaign.status === 'Paused'
                      const isCompleted = campaign.status === 'Completed'
                      const isScheduled = campaign.status === 'Scheduled'

                      return (
                        <tr key={campaign.id} className="hover:bg-emerald-50/30 transition-colors">
                          {/* Name & Audience */}
                          <td className="px-3.5 py-2.5">
                            <div className="font-bold text-slate-900 hover:text-emerald-700 cursor-pointer" onClick={() => navigate('/campaigns')}>
                              {campaign.name}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {campaign.meta} · <strong className="text-slate-700">{campaign.contacts.toLocaleString()} contacts</strong>
                            </div>
                          </td>

                          {/* Channel */}
                          <td className="px-3 py-2.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/60 shadow-2xs">
                              <WhatsAppIcon className="w-3 h-3 text-emerald-600" />
                              <span>{campaign.channel}</span>
                            </span>
                          </td>

                          {/* Progress */}
                          <td className="px-3 py-2.5 min-w-[140px]">
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="font-bold text-slate-800">{campaign.progress}%</span>
                              <span className="text-slate-400 font-medium text-[10px]">
                                {Math.round((campaign.contacts * campaign.progress) / 100).toLocaleString()} / {campaign.contacts.toLocaleString()}
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden p-0.5">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  isCompleted
                                    ? 'bg-slate-500'
                                    : isPaused
                                      ? 'bg-amber-400'
                                      : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                }`}
                                style={{ width: `${campaign.progress}%` }}
                              />
                            </div>
                          </td>

                          {/* Connect Rate */}
                          <td className="px-3 py-2.5">
                            <span className="inline-flex items-center gap-1 font-bold text-xs text-slate-800">
                              <TrendUpIcon className="w-3 h-3 text-emerald-600" />
                              <span>{campaign.connectRate}</span>
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="px-3 py-2.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border shadow-2xs ${
                                campaign.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200/70'
                                  : isPaused
                                    ? 'bg-amber-50 text-amber-800 border-amber-200/70'
                                    : isScheduled
                                      ? 'bg-teal-50 text-teal-800 border-teal-200/70'
                                      : 'bg-slate-100 text-slate-700 border-slate-200/70'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  campaign.status === 'Active'
                                    ? 'bg-emerald-500'
                                    : isPaused
                                      ? 'bg-amber-500'
                                      : 'bg-slate-400'
                                }`}
                              />
                              <span>{campaign.status}</span>
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-3.5 py-2.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {!isCompleted && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleCampaignStatus(campaign.id)}
                                  className={`p-1 rounded-lg border text-xs font-bold transition-all shadow-2xs ${
                                    isPaused
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                  }`}
                                  title={isPaused ? 'Resume Campaign' : 'Pause Campaign'}
                                >
                                  {isPaused ? <PlayIcon className="w-3 h-3" /> : <PauseIcon className="w-3 h-3" />}
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => navigate('/campaigns')}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors shadow-2xs"
                              >
                                Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom link to Campaigns page */}
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Showing {filteredCampaigns.length} of {campaigns.length} campaigns</span>
              <button
                type="button"
                onClick={() => navigate('/campaigns')}
                className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <span>View Full Campaign Manager</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 6. HIGH-INTENT CRM HOT LEADS & DEALS (Apple/Stripe Ultra Light - Compact) */}
          {/* ========================================================================= */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-200/70 shadow-[0_10px_30px_-15px_rgba(15,80,55,0.06),0_1px_3px_rgba(0,0,0,0.02)] p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                    Priority CRM Leads (High Inbound Intent)
                  </h2>
                  <span className="px-2 py-0.2 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-200/60 shadow-2xs">
                    Hot Pipeline
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 font-normal">
                  Leads with high intent scores that recently replied to your WhatsApp broadcasts.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/inbox')}
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Open All in WhatsApp CRM</span>
                <span>→</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {HOT_LEADS.map((lead) => (
                <div
                  key={lead.id}
                  className="rounded-2xl p-3.5 bg-white border border-slate-200/80 hover:border-emerald-300 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-block ring-2 ring-emerald-200/70 rounded-full overflow-hidden shadow-2xs">
                          <Avatar name={lead.name} />
                        </span>
                        <div>
                          <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{lead.name}</h3>
                          <p className="text-[10px] text-slate-500 truncate max-w-[120px] font-medium">
                            {lead.company}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-extrabold border border-emerald-200/70 shadow-2xs">
                        {lead.dealValue}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-50/80 p-2 rounded-xl border border-slate-100 mb-2 italic leading-relaxed">
                      “{lead.note}”
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-3 font-medium">
                      <span>Score: <strong className="text-emerald-700 font-bold">{lead.score}/100</strong></span>
                      <span>{lead.lastActivity}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTriggerLeadDial(lead)}
                    className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.98] transition-all"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                    <span>Chat on WhatsApp</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 7. SYSTEM STATUS & META INFRASTRUCTURE FOOTER (Apple/Stripe Ultra Light)  */}
          {/* ========================================================================= */}
          <footer className="rounded-xl bg-slate-900 text-slate-300 p-3.5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs shadow-md border border-slate-800">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 text-white font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Meta Cloud API v21.0 Connected
              </span>
              <span className="text-slate-400">Webhook Latency: <strong className="text-white">42ms</strong></span>
              <span className="text-slate-400">PostgreSQL Cloud: <strong className="text-white">Active</strong></span>
              <span className="text-slate-400">End-to-End Encrypted</span>
            </div>
            <div className="text-slate-400 text-center md:text-right font-medium text-[11px]">
              CallWave WhatsApp AI Platform · 99.99% SLA
            </div>
          </footer>
        </div>
      </DashboardLayout>

      {/* New Campaign Creation Modal */}
      {campaignModalOpen && (
        <NewCampaignModal onClose={closeCampaignModal} onCreate={handleCreateCampaign} />
      )}

      {/* CSV Contact Import Modal */}
      {importModalOpen && (
        <ImportContactsModal
          onClose={() => setImportModalOpen(false)}
          onImportSuccess={handleImportSuccess}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast key={toast.id} message={toast.message} onClose={closeToast} />
      )}
    </>
  )
}
