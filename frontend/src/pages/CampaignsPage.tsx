import { useCallback, useMemo, useState } from 'react'
import { DashboardLayout } from '../components/dashboard/DashboardLayout'
import { CAMPAIGNS } from '../components/dashboard/campaignData'
import type { Campaign, CampaignStatus } from '../components/dashboard/campaignData'
import {
  CalendarIcon,
  CheckCircleIcon,
  CloseIcon,
  CopyIcon,
  DownloadIcon,
  GridIcon,
  HeadsetIcon,
  ListIcon,
  MegaphoneIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  SearchIcon,
  SlidersIcon,
  TrashIcon,
  TrendUpIcon,
  UploadIcon,
  WhatsAppIcon,
} from '../components/dashboard/DashboardIcons'
import { ImportContactsModal } from '../components/dashboard/ImportContactsModal'
import { NewCampaignModal } from '../components/dashboard/NewCampaignModal'
import type { NewCampaignInput } from '../components/dashboard/NewCampaignModal'
import { Toast } from '../components/dashboard/Toast'
import { SparkIcon } from '../components/icons'
import { speakAgentLine, stopAgentSpeech } from '../lib/audioVoice'
import { usePageTitle } from '../lib/usePageTitle'
import { WhatsAppBulkingLoader } from '../components/common/WhatsAppBulkingLoader'

type FilterStatus = 'All' | CampaignStatus
type ViewMode = 'grid' | 'table'
type SortOption = 'newest' | 'connect-rate' | 'progress' | 'contacts' | 'booked'

const STATUS_FILTERS: FilterStatus[] = ['All', 'Active', 'Paused', 'Scheduled', 'Completed', 'Draft']

const numberFormatter = new Intl.NumberFormat('en-US')

function StatusBadge({ status }: { status: CampaignStatus }) {
  switch (status) {
    case 'Active':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          Active
        </span>
      )
    case 'Paused':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Paused
        </span>
      )
    case 'Scheduled':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200/80 text-sky-800 text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
          Scheduled
        </span>
      )
    case 'Completed':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold">
          <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />
          Completed
        </span>
      )
    case 'Draft':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-slate-500 text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          Draft
        </span>
      )
  }
}

export function CampaignsPage() {
  usePageTitle('WhatsApp Campaigns & Broadcasts · CallWave')

  const [campaigns, setCampaigns] = useState<Campaign[]>(CAMPAIGNS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('All')
  const [channelFilter, setChannelFilter] = useState('All')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  const [selectedCampaignForDetail, setSelectedCampaignForDetail] = useState<Campaign | null>(null)
  const [detailPacing, setDetailPacing] = useState<number>(24)
  const [isPlayingAudioPreview, setIsPlayingAudioPreview] = useState(false)

  const [campaignModalOpen, setCampaignModalOpen] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [bulkingLoaderOpen, setBulkingLoaderOpen] = useState(false)

  const [toast, setToast] = useState<{ id: number; message: string } | null>(null)

  const notify = useCallback((message: string) => {
    setToast({ id: Date.now(), message })
  }, [])

  const closeToast = useCallback(() => setToast(null), [])

  // Dynamic status counts
  const statusCounts = useMemo(() => {
    const counts: Record<FilterStatus, number> = {
      All: campaigns.length,
      Active: 0,
      Paused: 0,
      Scheduled: 0,
      Completed: 0,
      Draft: 0,
    }

    campaigns.forEach((c) => {
      if (counts[c.status] !== undefined) {
        counts[c.status] += 1
      }
    })

    return counts
  }, [campaigns])

  // Aggregated KPI Stats
  const kpiStats = useMemo(() => {
    const activeCount = campaigns.filter((c) => c.status === 'Active').length
    const totalContacts = campaigns.reduce((acc, c) => acc + (c.contacts || 0), 0)
    const dialedContacts = campaigns.reduce((acc, c) => acc + (c.dialedContacts || 0), 0)
    const totalBooked = campaigns.reduce((acc, c) => acc + (c.bookedCount || 0), 0)

    const connectedContacts = campaigns.reduce((acc, c) => acc + (c.connectedContacts || 0), 0)
    const avgConnect =
      dialedContacts > 0 ? ((connectedContacts / dialedContacts) * 100).toFixed(1) : '72.4'

    return {
      activeCount,
      totalCount: campaigns.length,
      totalContacts,
      dialedContacts,
      totalBooked,
      avgConnect,
    }
  }, [campaigns])

  // Filtered and Sorted Campaigns
  const filteredCampaigns = useMemo(() => {
    const normalized = search.trim().toLowerCase()

    return campaigns
      .filter((c) => {
        const matchesStatus = statusFilter === 'All' || c.status === statusFilter
        const matchesChannel =
          channelFilter === 'All' || c.channel.toLowerCase().includes(channelFilter.toLowerCase())
        const matchesSearch =
          !normalized ||
          c.name.toLowerCase().includes(normalized) ||
          c.channel.toLowerCase().includes(normalized) ||
          (c.targetAudience && c.targetAudience.toLowerCase().includes(normalized)) ||
          (c.agentName && c.agentName.toLowerCase().includes(normalized)) ||
          (c.scriptSnippet && c.scriptSnippet.toLowerCase().includes(normalized))

        return matchesStatus && matchesChannel && matchesSearch
      })
      .sort((a, b) => {
        if (sortBy === 'connect-rate') {
          const rateA = parseFloat(a.connectRate) || 0
          const rateB = parseFloat(b.connectRate) || 0
          return rateB - rateA
        }
        if (sortBy === 'progress') {
          return b.progress - a.progress
        }
        if (sortBy === 'contacts') {
          return b.contacts - a.contacts
        }
        if (sortBy === 'booked') {
          return (b.bookedCount || 0) - (a.bookedCount || 0)
        }
        return 0 // newest preserves default order
      })
  }, [campaigns, search, statusFilter, channelFilter, sortBy])

  // Handlers
  function handleToggleCampaignStatus(id: string) {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextStatus: CampaignStatus = c.status === 'Active' ? 'Paused' : 'Active'
          notify(`“${c.name}” dialer is now ${nextStatus.toLowerCase()}.`)
          return { ...c, status: nextStatus }
        }
        return c
      }),
    )

    if (selectedCampaignForDetail?.id === id) {
      setSelectedCampaignForDetail((prev) =>
        prev
          ? {
              ...prev,
              status: prev.status === 'Active' ? 'Paused' : 'Active',
            }
          : null,
      )
    }
  }

  function handleBatchToggleAll(action: 'pause' | 'resume') {
    const nextStatus: CampaignStatus = action === 'pause' ? 'Paused' : 'Active'
    setCampaigns((prev) => prev.map((c) => ({ ...c, status: nextStatus })))
    notify(
      action === 'pause'
        ? 'All active campaign dialers paused immediately.'
        : 'All campaigns resumed. AI voice agents dialing active queues.',
    )
  }

  function handleCreateCampaign(input: NewCampaignInput) {
    const newCamp: Campaign = {
      id: `campaign-${Date.now()}`,
      name: input.name,
      channel: input.aiPersonalization ? 'WhatsApp Bulk + AI' : 'WhatsApp Bulk',
      meta: `${input.audience.label} · Just now`,
      status: 'Active',
      progress: 0,
      connectRate: '—',
      contacts: input.audience.contacts,
      dialedContacts: 0,
      connectedContacts: 0,
      bookedCount: 0,
      callsPerMinute: 24,
      agentName: 'Aria',
      agentVoice: 'ElevenLabs Turbo · Aria (Executive Closer)',
      targetAudience: input.audience.label,
      schedule: 'Mon - Fri, 9:00 AM - 6:00 PM EST',
      scriptSnippet: input.message,
      avgDuration: '—',
      sentimentScore: 92,
      budgetSpent: '$0 / $1,000',
      createdDate: 'Just now',
      channelType: 'whatsapp-voice',
      aiPersonalized: input.aiPersonalization,
      description: `Autonomous campaign targeting ${input.audience.label} with AI voice & WhatsApp personalization.`,
    }

    setCampaigns((prev) => [newCamp, ...prev])
    setStatusFilter('All')
    setSearch('')
    setCampaignModalOpen(false)
    notify(`Campaign “${input.name}” created! 32 AI agents queued to broadcast.`)
  }

  function handleDeleteCampaign(id: string, name: string) {
    setCampaigns((prev) => prev.filter((c) => c.id !== id))
    if (selectedCampaignForDetail?.id === id) {
      setSelectedCampaignForDetail(null)
    }
    notify(`Campaign “${name}” deleted.`)
  }

  function handleDuplicateCampaign(c: Campaign) {
    const copy: Campaign = {
      ...c,
      id: `campaign-${Date.now()}`,
      name: `${c.name} (Copy)`,
      status: 'Draft',
      progress: 0,
      dialedContacts: 0,
      connectedContacts: 0,
      bookedCount: 0,
      createdDate: 'Just now',
    }
    setCampaigns((prev) => [copy, ...prev])
    notify(`Duplicated “${c.name}” as Draft.`)
  }

  function handleInspectCampaign(c: Campaign) {
    setSelectedCampaignForDetail(c)
    setDetailPacing(c.callsPerMinute || 24)
  }

  function handlePlayVoiceSample(scriptText: string) {
    if (isPlayingAudioPreview) {
      stopAgentSpeech()
      setIsPlayingAudioPreview(false)
      return
    }

    setIsPlayingAudioPreview(true)
    speakAgentLine(scriptText, {
      onEnd: () => setIsPlayingAudioPreview(false),
      onError: () => setIsPlayingAudioPreview(false),
    })
  }

  function handleExportCsv() {
    const headers = [
      'ID',
      'Name',
      'Status',
      'Channel',
      'Target Audience',
      'Agent',
      'Progress %',
      'Dialed Contacts',
      'Total Contacts',
      'Connect Rate',
      'Booked Meetings',
      'Calls Per Minute',
      'Schedule',
    ]

    const rows = filteredCampaigns.map((c) => [
      c.id,
      `"${c.name.replace(/"/g, '""')}"`,
      c.status,
      `"${c.channel}"`,
      `"${c.targetAudience || ''}"`,
      `"${c.agentName || 'Aria'}"`,
      c.progress,
      c.dialedContacts || 0,
      c.contacts,
      `"${c.connectRate}"`,
      c.bookedCount || 0,
      c.callsPerMinute || 20,
      `"${c.schedule || ''}"`,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `callwave-campaigns-${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    notify(`Exported ${filteredCampaigns.length} campaigns to CSV.`)
  }

  function handleCopyScript(text: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
      notify('Script copied to clipboard.')
    }
  }

  return (
    <>
      <DashboardLayout
        search={search}
        onSearchChange={setSearch}
        onNotice={notify}
        onNewCampaign={() => setCampaignModalOpen(true)}
        activeNav="campaigns"
      >
        <div className="w-full space-y-4 pb-12 pt-0">
          {/* ========================================================================= */}
          {/* 1. OPERATIONS HUB HEADER (Glassmorphic, Ambient Glow, Compact)            */}
          {/* ========================================================================= */}
          <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-200/70 shadow-[0_10px_30px_-15px_rgba(15,80,55,0.06),0_1px_3px_rgba(0,0,0,0.02)] p-4 sm:p-5 lg:p-6">
            {/* Ambient Radial Gradients */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-emerald-400/15 via-teal-300/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-teal-400/10 via-emerald-200/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-3.5">
              {/* Telemetry Strip */}
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/90 border border-emerald-200/70 text-emerald-800 font-semibold shadow-2xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>32 Voice &amp; WhatsApp Senders Live</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 border border-slate-200/80 text-slate-700 font-medium shadow-2xs">
                  <span className="text-amber-500 font-bold">⚡</span>
                  <span>114ms Audio Latency (Ultra-Low)</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 border border-slate-200/80 text-slate-700 font-medium shadow-2xs">
                  <span className="text-emerald-500 font-bold">🎯</span>
                  <span>{kpiStats.avgConnect}% Fleet Avg Connect</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 font-medium">
                  <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Meta Cloud API v21.0 Active</span>
                </div>

                <div className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 border border-slate-200/80 text-slate-600 font-medium shadow-2xs">
                  <CalendarIcon className="w-3 h-3 text-slate-400" />
                  <span>24/7 Concurrency Ready</span>
                </div>
              </div>

              {/* Title & Action Buttons Row */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 mb-0.5">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 font-extrabold text-[9.5px] tracking-wider uppercase border border-emerald-200/60 inline-flex items-center gap-1.5">
                      <MegaphoneIcon className="w-3 h-3 text-emerald-700" />
                      Campaign Operations Hub
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                    WhatsApp &amp; AI Voice <span className="bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">Campaign Engine</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5 max-w-3xl leading-relaxed">
                    Manage autonomous outbound dialers, audience cohorts, dynamic template variables &amp; high-volume broadcast queues.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
                  <button
                    type="button"
                    onClick={() => setImportModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs hover:border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <UploadIcon className="w-4 h-4 text-slate-500" />
                    <span>Import Audience</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBulkingLoaderOpen(true)}
                    className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-emerald-300/80 bg-emerald-50/90 hover:bg-emerald-100 text-emerald-900 shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>WhatsApp Bulking Dispatch</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCampaignModalOpen(true)}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>New Campaign</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 2. FOUR EXECUTIVE KPI METRIC CARDS                                        */}
          {/* ========================================================================= */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4" aria-label="Campaign Executive KPIs">
            {/* KPI 1: Active Campaigns */}
            <div className="relative rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/80 hover:border-emerald-300/80 p-4 shadow-2xs hover:shadow-md transition-all duration-200 group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Active Campaigns</span>
                <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-2xs group-hover:scale-105 transition-transform">
                  <MegaphoneIcon className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <strong className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {kpiStats.activeCount}
                </strong>
                <span className="text-sm font-bold text-slate-400">/ {kpiStats.totalCount}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 truncate">32 autonomous agents</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                  <TrendUpIcon className="w-3 h-3" /> 100% fleet
                </span>
              </div>
            </div>

            {/* KPI 2: Dialed Leads */}
            <div className="relative rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/80 hover:border-emerald-300/80 p-4 shadow-2xs hover:shadow-md transition-all duration-200 group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Broadcasted Leads</span>
                <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-2xs group-hover:scale-105 transition-transform">
                  <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
                </span>
              </div>
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <strong className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {numberFormatter.format(kpiStats.dialedContacts)}
                </strong>
                <span className="text-xs font-medium text-slate-400">
                  / {numberFormatter.format(kpiStats.totalContacts)}
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 truncate">
                  {((kpiStats.dialedContacts / (kpiStats.totalContacts || 1)) * 100).toFixed(1)}% fleet completed
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                  <TrendUpIcon className="w-3 h-3" /> +18.4%
                </span>
              </div>
            </div>

            {/* KPI 3: Fleet Live Connect */}
            <div className="relative rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/80 hover:border-emerald-300/80 p-4 shadow-2xs hover:shadow-md transition-all duration-200 group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Fleet Live Connect</span>
                <span className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 shadow-2xs group-hover:scale-105 transition-transform">
                  <SparkIcon className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <strong className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {kpiStats.avgConnect}%
                </strong>
                <span className="text-xs font-medium text-emerald-600">avg rate</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 truncate">2.8x higher than manual</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                  <TrendUpIcon className="w-3 h-3" /> +4.3%
                </span>
              </div>
            </div>

            {/* KPI 4: Meetings Booked */}
            <div className="relative rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/80 hover:border-emerald-300/80 p-4 shadow-2xs hover:shadow-md transition-all duration-200 group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Meetings Booked</span>
                <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs group-hover:scale-105 transition-transform">
                  <CalendarIcon className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <strong className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {numberFormatter.format(kpiStats.totalBooked)}
                </strong>
                <span className="text-xs font-medium text-slate-500">deals</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 truncate">Direct calendar sync</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                  <TrendUpIcon className="w-3 h-3" /> +22.5%
                </span>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 3. FILTERING, SEARCH & CONTROL TOOLBAR                                    */}
          {/* ========================================================================= */}
          <div className="rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-2xs p-3.5 sm:p-4 space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 text-xs no-scrollbar">
                {STATUS_FILTERS.map((status) => {
                  const isActive = statusFilter === status
                  return (
                    <button
                      key={status}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                          : 'bg-slate-100/80 hover:bg-slate-200/70 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>{status}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                        }`}
                      >
                        {statusCounts[status]}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Right Controls: Search, Channel, Sort, View Mode */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Search Input */}
                <div className="relative flex-1 sm:w-60">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, agent, audience…"
                    aria-label="Search campaigns"
                    className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-slate-900 transition-all placeholder:text-slate-400"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      aria-label="Clear search"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Channel Filter */}
                <select
                  value={channelFilter}
                  onChange={(e) => setChannelFilter(e.target.value)}
                  aria-label="Filter by channel"
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:border-emerald-500 outline-none cursor-pointer"
                >
                  <option value="All">All Channels</option>
                  <option value="WhatsApp Bulk + AI">WhatsApp Bulk + AI</option>
                  <option value="WhatsApp Bulk">WhatsApp Bulk</option>
                  <option value="WhatsApp Broadcast">WhatsApp Broadcast</option>
                  <option value="AI Voice">AI Voice</option>
                </select>

                {/* Sort Option */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  aria-label="Sort campaigns"
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:border-emerald-500 outline-none cursor-pointer"
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="connect-rate">Highest Connect Rate</option>
                  <option value="progress">Highest Progress %</option>
                  <option value="contacts">Most Contacts</option>
                  <option value="booked">Most Meetings Booked</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view"
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <GridIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    aria-label="Table view"
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      viewMode === 'table'
                        ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <ListIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Sub-toolbar with Batch Operations & Summary */}
            <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-500">
                Showing <strong className="text-slate-800">{filteredCampaigns.length}</strong> of{' '}
                <strong className="text-slate-800">{campaigns.length}</strong> campaigns
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleBatchToggleAll('pause')}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <PauseIcon className="w-3 h-3 text-slate-500" />
                  <span>Pause All</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBatchToggleAll('resume')}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <PlayIcon className="w-3 h-3 text-emerald-600" />
                  <span>Resume All</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <DownloadIcon className="w-3 h-3 text-slate-500" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4. MAIN CAMPAIGN CONTENT: GRID VIEW OR TABLE VIEW                         */}
          {/* ========================================================================= */}
          {filteredCampaigns.length === 0 ? (
            /* Empty State */
            <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-2xs mb-4">
                <MegaphoneIcon className="w-7 h-7" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">No campaigns found</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                We could not find any campaigns matching “{search}” with the current status filter.
              </p>
              <div className="mt-5 flex items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setStatusFilter('All')
                    setChannelFilter('All')
                  }}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
                <button
                  type="button"
                  onClick={() => setCampaignModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>New Campaign</span>
                </button>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              {filteredCampaigns.map((c) => {
                const isPaused = c.status === 'Paused'

                return (
                  <article
                    key={c.id}
                    className="group relative flex flex-col rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 overflow-hidden"
                  >
                    {/* Top Ambient Accent Line */}
                    <div
                      className={`h-1 w-full ${
                        c.status === 'Active'
                          ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600'
                          : c.status === 'Paused'
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                          : 'bg-slate-200'
                      }`}
                    />

                    <div className="p-4 sm:p-5 flex-1 flex flex-col">
                      {/* Badge Row */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <StatusBadge status={c.status} />
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200/60">
                            {c.aiPersonalized && <SparkIcon className="w-2.5 h-2.5 text-emerald-600" />}
                            {c.channel}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleInspectCampaign(c)}
                          aria-label="Campaign options"
                          title="Inspect campaign details & telemetry"
                          className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <SlidersIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Title & Audience */}
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                        {c.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 min-h-[32px] leading-relaxed">
                        {c.description ||
                          `Targeting ${c.targetAudience || 'leads'} with automated broadcast synthesis.`}
                      </p>

                      {/* Assigned AI Persona Box */}
                      <div className="mt-3 bg-slate-50/80 rounded-xl p-2.5 border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shadow-2xs flex-shrink-0">
                            {c.agentName ? c.agentName.charAt(0) : 'A'}
                          </span>
                          <div className="min-w-0">
                            <strong className="block text-xs font-bold text-slate-900 truncate">
                              {c.agentName || 'Aria'}
                            </strong>
                            <small className="block text-[10px] text-slate-500 truncate">
                              {c.agentVoice?.split('·')[0] || 'ElevenLabs Turbo'}
                            </small>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200/80 text-slate-700 text-[10px] font-mono font-semibold shadow-2xs flex-shrink-0">
                          ⚡ {c.callsPerMinute || 24} msgs/min
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3.5 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 font-medium">
                            {numberFormatter.format(c.dialedContacts || 0)} of{' '}
                            {numberFormatter.format(c.contacts)} leads
                          </span>
                          <strong className="text-slate-900 font-bold">{c.progress}%</strong>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              c.status === 'Active'
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                : c.status === 'Paused'
                                ? 'bg-amber-400'
                                : 'bg-slate-300'
                            }`}
                            style={{ width: `${Math.min(c.progress, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* 3 Metrics Cluster */}
                      <div className="mt-3.5 grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-slate-50/60 border border-slate-100 text-center">
                        <div>
                          <small className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Connect</small>
                          <strong className="text-xs sm:text-sm font-extrabold text-slate-900">{c.connectRate}</strong>
                        </div>
                        <div className="border-x border-slate-200/60">
                          <small className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Booked</small>
                          <strong className="text-xs sm:text-sm font-extrabold text-slate-900">{c.bookedCount || 0}</strong>
                        </div>
                        <div>
                          <small className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Avg Time</small>
                          <strong className="text-xs sm:text-sm font-extrabold text-slate-900">{c.avgDuration || '2m 30s'}</strong>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleCampaignStatus(c.id)}
                          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isPaused
                              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                              : 'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100'
                          }`}
                        >
                          {c.status === 'Active' ? (
                            <>
                              <PauseIcon className="w-3.5 h-3.5" />
                              <span>Pause</span>
                            </>
                          ) : (
                            <>
                              <PlayIcon className="w-3.5 h-3.5" />
                              <span>Resume</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleInspectCampaign(c)}
                          className="flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <SlidersIcon className="w-3.5 h-3.5 text-slate-500" />
                          <span>Inspect</span>
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            /* Table View */
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs text-left divide-y divide-slate-100" aria-label="Campaigns list">
                  <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Campaign &amp; Audience</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Channel</th>
                      <th className="px-4 py-3">Agent / Voice</th>
                      <th className="px-4 py-3">Progress</th>
                      <th className="px-4 py-3">Connect Rate</th>
                      <th className="px-4 py-3">Meetings</th>
                      <th className="px-4 py-3">Speed</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCampaigns.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-2xs flex-shrink-0">
                              <MegaphoneIcon className="w-4 h-4" />
                            </span>
                            <div>
                              <strong className="block text-slate-900 font-bold">{c.name}</strong>
                              <small className="text-[11px] text-slate-500">
                                {c.targetAudience || 'Target Audience'} · {c.createdDate || c.meta}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <StatusBadge status={c.status} />
                        </td>

                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200/60">
                            {c.aiPersonalized && <SparkIcon className="w-2.5 h-2.5 text-emerald-600" />}
                            {c.channel}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <div>
                            <strong className="block font-bold text-slate-900">{c.agentName || 'Aria'}</strong>
                            <small className="text-[10px] text-slate-500">
                              {c.agentVoice?.split('·')[0] || 'ElevenLabs'}
                            </small>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="w-36 space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span>{c.progress}%</span>
                              <span className="text-slate-400">
                                {numberFormatter.format(c.dialedContacts || 0)}/{numberFormatter.format(c.contacts)}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-emerald-500"
                                style={{ width: `${c.progress}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 font-bold text-slate-900">{c.connectRate}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{c.bookedCount || 0}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono font-semibold">
                            ⚡ {c.callsPerMinute || 20}/m
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleCampaignStatus(c.id)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                              title={c.status === 'Active' ? 'Pause Campaign' : 'Resume Campaign'}
                            >
                              {c.status === 'Active' ? <PauseIcon className="w-3.5 h-3.5" /> : <PlayIcon className="w-3.5 h-3.5 text-emerald-600" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleInspectCampaign(c)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                              title="View Campaign Details"
                            >
                              <SlidersIcon className="w-3.5 h-3.5 text-slate-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>

      {/* ========================================================================= */}
      {/* 5. CAMPAIGN DETAILS DEEP-DIVE SLIDE-OVER DRAWER                           */}
      {/* ========================================================================= */}
      {selectedCampaignForDetail && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              stopAgentSpeech()
              setIsPlayingAudioPreview(false)
              setSelectedCampaignForDetail(null)
            }
          }}
        >
          <div
            className="fixed inset-y-0 right-0 w-full max-w-lg sm:max-w-xl bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200 overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="campaign-drawer-title"
          >
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/70 flex-shrink-0">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <StatusBadge status={selectedCampaignForDetail.status} />
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200/70 text-slate-700 text-[11px] font-semibold">
                    {selectedCampaignForDetail.aiPersonalized && <SparkIcon className="w-2.5 h-2.5 text-emerald-600" />}
                    {selectedCampaignForDetail.channel}
                  </span>
                </div>
                <h2 id="campaign-drawer-title" className="text-base sm:text-lg font-bold text-slate-900 truncate">
                  {selectedCampaignForDetail.name}
                </h2>
                <small className="block text-xs text-slate-500 truncate">
                  Target: {selectedCampaignForDetail.targetAudience} · Schedule: {selectedCampaignForDetail.schedule}
                </small>
              </div>

              <button
                type="button"
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
                onClick={() => {
                  stopAgentSpeech()
                  setIsPlayingAudioPreview(false)
                  setSelectedCampaignForDetail(null)
                }}
                aria-label="Close details"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body - Scrollable */}
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
              {/* Section 1: Voice Agent Persona */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <HeadsetIcon className="w-3.5 h-3.5 text-emerald-600" />
                  Assigned Voice Persona &amp; Audio Preview
                </span>

                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center shadow-2xs">
                      {selectedCampaignForDetail.agentName?.charAt(0) || 'A'}
                    </span>
                    <div>
                      <strong className="block text-xs sm:text-sm font-bold text-slate-900">
                        {selectedCampaignForDetail.agentName || 'Aria'} · Autonomous Closer
                      </strong>
                      <span className="text-[11px] text-slate-500">
                        {selectedCampaignForDetail.agentVoice || 'ElevenLabs Turbo'} · 114ms turnaround
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handlePlayVoiceSample(
                        selectedCampaignForDetail.scriptSnippet ||
                          'Hello! This is CallWave autonomous calling engine.',
                      )
                    }
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    {isPlayingAudioPreview ? (
                      <>
                        <PauseIcon className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Stop Audio</span>
                      </>
                    ) : (
                      <>
                        <PlayIcon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Play Voice Sample</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Section 2: Speech Script & Prompt */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <SparkIcon className="w-3.5 h-3.5 text-emerald-600" />
                  Broadcast Script &amp; Dynamic Variables
                </span>

                <div className="relative rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                  <button
                    type="button"
                    onClick={() => handleCopyScript(selectedCampaignForDetail.scriptSnippet || '')}
                    className="absolute top-3 right-3 px-2 py-1 rounded-lg text-[10px] font-semibold border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <CopyIcon className="w-3 h-3 text-slate-500" />
                    <span>Copy</span>
                  </button>

                  <p className="text-xs text-slate-800 leading-relaxed font-mono pr-12">
                    {selectedCampaignForDetail.scriptSnippet ? (
                      selectedCampaignForDetail.scriptSnippet
                        .split(/(\{\{[^}]+\}\})/)
                        .map((part, i) =>
                          part.startsWith('{{') ? (
                            <mark key={i} className="bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded font-bold">
                              {part}
                            </mark>
                          ) : (
                            part
                          ),
                        )
                    ) : (
                      'Hello {{first_name}}, this is CallWave connecting regarding your business inquiry.'
                    )}
                  </p>
                </div>
              </div>

              {/* Section 3: Live Disposition Telemetry */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />
                  Live Disposition Telemetry
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/60 text-center">
                    <small className="block text-[10px] text-slate-500 uppercase font-semibold">Connect Rate</small>
                    <strong className="text-sm font-extrabold text-emerald-800">
                      {selectedCampaignForDetail.connectRate}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl border border-blue-100 bg-blue-50/60 text-center">
                    <small className="block text-[10px] text-slate-500 uppercase font-semibold">Booked</small>
                    <strong className="text-sm font-extrabold text-blue-800">
                      {selectedCampaignForDetail.bookedCount || 0}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50 text-center">
                    <small className="block text-[10px] text-slate-500 uppercase font-semibold">Voicemails</small>
                    <strong className="text-sm font-extrabold text-slate-700">
                      {Math.round((selectedCampaignForDetail.dialedContacts || 100) * 0.12)}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl border border-teal-100 bg-teal-50/60 text-center">
                    <small className="block text-[10px] text-slate-500 uppercase font-semibold">Sentiment</small>
                    <strong className="text-sm font-extrabold text-teal-800">
                      {selectedCampaignForDetail.sentimentScore || 88}%
                    </strong>
                  </div>
                </div>
              </div>

              {/* Section 4: SIP Carrier Pacing Control */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <SlidersIcon className="w-3.5 h-3.5 text-emerald-600" />
                  SIP &amp; WhatsApp Dispatch Pacing
                </span>

                <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <strong className="font-semibold text-slate-800">Dialing / Dispatch Speed</strong>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold text-[11px]">
                      {detailPacing} msgs / min
                    </span>
                  </div>

                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="1"
                    value={detailPacing}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      setDetailPacing(val)
                      setCampaigns((prev) =>
                        prev.map((item) =>
                          item.id === selectedCampaignForDetail.id
                            ? { ...item, callsPerMinute: val }
                            : item,
                        ),
                      )
                    }}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span>5 /min (Gentle)</span>
                    <span>25 /min (Balanced)</span>
                    <span>60 /min (Maximum Concurrent)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between gap-2.5 bg-slate-50/80 flex-shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDuplicateCampaign(selectedCampaignForDetail)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <CopyIcon className="w-3.5 h-3.5" />
                  <span>Duplicate</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDeleteCampaign(
                      selectedCampaignForDetail.id,
                      selectedCampaignForDetail.name,
                    )
                  }
                  className="px-3 py-2 rounded-xl text-xs font-semibold border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleToggleCampaignStatus(selectedCampaignForDetail.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm ${
                  selectedCampaignForDetail.status === 'Active'
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                }`}
              >
                {selectedCampaignForDetail.status === 'Active' ? 'Pause Campaign' : 'Resume Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Campaign Creation Modal */}
      {campaignModalOpen && (
        <NewCampaignModal
          onClose={() => setCampaignModalOpen(false)}
          onCreate={handleCreateCampaign}
        />
      )}

      {/* CSV Contact Import Modal */}
      {importModalOpen && (
        <ImportContactsModal
          onClose={() => setImportModalOpen(false)}
          onImportSuccess={(count, filename) => {
            notify(`Imported ${count.toLocaleString()} contacts from ${filename} into campaigns list.`)
          }}
        />
      )}

      {/* WhatsApp Bulking Dispatch Animation Loader */}
      {bulkingLoaderOpen && (
        <WhatsAppBulkingLoader
          variant="fullscreen"
          size="lg"
          onCancel={() => setBulkingLoaderOpen(false)}
        />
      )}

      {/* Toast Notification */}
      {toast && <Toast key={toast.id} message={toast.message} onClose={closeToast} />}
    </>
  )
}
