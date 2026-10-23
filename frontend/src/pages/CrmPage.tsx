import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ComponentType, DragEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { DashboardLayout } from '../components/dashboard/DashboardLayout'
import { NewDealModal } from '../components/dashboard/NewDealModal'
import type { NewDealInput } from '../components/dashboard/NewDealModal'
import { Toast } from '../components/dashboard/Toast'
import {
  DEALS,
  DEAL_OWNERS,
  DEAL_STAGES,
  STAGE_PROBABILITY,
  formatCompactCurrency,
  formatCurrency,
  getInitials,
} from '../components/dashboard/crmData'
import type {
  Deal,
  DealActivityType,
  DealPriority,
  DealStage,
} from '../components/dashboard/crmData'
import {
  CalendarIcon,
  CheckCircleIcon,
  CloseIcon,
  ContactsIcon,
  DownloadIcon,
  GridIcon,
  ListIcon,
  PencilIcon,
  PipelineIcon,
  PlusIcon,
  SearchIcon,
  SlidersIcon,
  TrendUpIcon,
  WhatsAppIcon,
} from '../components/dashboard/DashboardIcons'
import { MailIcon, PhoneIcon, SparkIcon } from '../components/icons'
import { usePageTitle } from '../lib/usePageTitle'

type SortOption = 'value-desc' | 'value-asc' | 'close-asc' | 'probability-desc' | 'company-asc'

const STAGE_META: Record<
  DealStage,
  { label: string; dot: string; pill: string; bar: string; soft: string }
> = {
  New: {
    label: 'New',
    dot: 'bg-slate-400',
    pill: 'bg-slate-100 text-slate-700 border-slate-200',
    bar: 'bg-slate-400',
    soft: 'bg-slate-50',
  },
  Contacted: {
    label: 'Contacted',
    dot: 'bg-sky-500',
    pill: 'bg-sky-50 text-sky-700 border-sky-200',
    bar: 'bg-sky-500',
    soft: 'bg-sky-50/40',
  },
  Qualified: {
    label: 'Qualified',
    dot: 'bg-violet-500',
    pill: 'bg-violet-50 text-violet-700 border-violet-200',
    bar: 'bg-violet-500',
    soft: 'bg-violet-50/40',
  },
  Proposal: {
    label: 'Proposal',
    dot: 'bg-amber-500',
    pill: 'bg-amber-50 text-amber-700 border-amber-200',
    bar: 'bg-amber-500',
    soft: 'bg-amber-50/40',
  },
  Won: {
    label: 'Won',
    dot: 'bg-emerald-500',
    pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    bar: 'bg-emerald-500',
    soft: 'bg-emerald-50/40',
  },
  Lost: {
    label: 'Lost',
    dot: 'bg-rose-500',
    pill: 'bg-rose-50 text-rose-700 border-rose-200',
    bar: 'bg-rose-500',
    soft: 'bg-rose-50/40',
  },
}

const PRIORITY_META: Record<DealPriority, string> = {
  High: 'bg-rose-50 text-rose-700 border-rose-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Low: 'bg-slate-100 text-slate-600 border-slate-200',
}

const KPI_TONES = {
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  teal: 'bg-teal-50 text-teal-600 border-teal-100',
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  amber: 'bg-amber-50 text-amber-600 border-amber-100',
} as const

type KpiTone = keyof typeof KPI_TONES

const ACTIVITY_META: Record<
  DealActivityType,
  { icon: ComponentType<{ className?: string }>; tile: string }
> = {
  call: { icon: PhoneIcon, tile: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  whatsapp: { icon: WhatsAppIcon, tile: 'bg-green-50 text-green-700 border-green-200' },
  meeting: { icon: CalendarIcon, tile: 'bg-sky-50 text-sky-700 border-sky-200' },
  email: { icon: MailIcon, tile: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  note: { icon: PencilIcon, tile: 'bg-slate-100 text-slate-600 border-slate-200' },
  stage: { icon: CheckCircleIcon, tile: 'bg-violet-50 text-violet-700 border-violet-200' },
}

function parseDate(value: string): Date {
  return new Date(`${value}T12:00:00`)
}

const shortDateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
const longDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

function formatShortDate(value: string): string {
  return shortDateFormatter.format(parseDate(value))
}

function formatLongDate(value: string): string {
  return longDateFormatter.format(parseDate(value))
}

function isOverdue(deal: Deal): boolean {
  if (deal.stage === 'Won' || deal.stage === 'Lost') return false
  const endOfDay = parseDate(deal.closeDate)
  endOfDay.setHours(23, 59, 59, 999)
  return endOfDay.getTime() < Date.now()
}

let activitySequence = 0

function nextActivityId(prefix: string): string {
  activitySequence += 1
  return `${prefix}-${activitySequence}`
}

function KpiCard({
  title,
  value,
  unit,
  footer,
  trend,
  icon: Icon,
  tone,
}: {
  title: string
  value: string
  unit: string
  footer: string
  trend: string
  icon: ComponentType<{ className?: string }>
  tone: KpiTone
}) {
  return (
    <div className="relative rounded-2xl bg-white/95 border border-slate-200/80 hover:border-emerald-300/80 p-4 shadow-2xs hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600">{title}</span>
        <span
          className={`w-8 h-8 rounded-xl border flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform ${KPI_TONES[tone]}`}
        >
          <Icon className="w-4 h-4" />
        </span>
      </div>
      <div className="mt-2.5 flex items-baseline gap-1.5 flex-wrap">
        <strong className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </strong>
        <span className="text-xs font-medium text-slate-500">{unit}</span>
      </div>
      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px]">
        <span className="text-slate-500 truncate">{footer}</span>
        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md shrink-0">
          <TrendUpIcon className="w-3 h-3" />
          {trend}
        </span>
      </div>
    </div>
  )
}

function DealCard({
  deal,
  isDragging,
  onOpen,
  onDragStart,
  onDragEnd,
}: {
  deal: Deal
  isDragging: boolean
  onOpen: (deal: Deal) => void
  onDragStart: (event: DragEvent<HTMLElement>, deal: Deal) => void
  onDragEnd: () => void
}) {
  const overdue = isOverdue(deal)
  const priorityClass = PRIORITY_META[deal.priority]
  const stageMeta = STAGE_META[deal.stage]

  return (
    <article
      draggable
      onDragStart={(event) => onDragStart(event, deal)}
      onDragEnd={onDragEnd}
      onClick={() => onOpen(deal)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen(deal)
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open deal ${deal.name} for ${deal.company}`}
      title="Click to open · drag to move stage"
      className={`group relative rounded-2xl border bg-white p-3 shadow-2xs transition-all cursor-grab active:cursor-grabbing hover:shadow-md hover:border-emerald-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
        isDragging ? 'opacity-45 scale-[0.98]' : ''
      } ${overdue ? 'border-rose-200/80' : 'border-slate-200/80'}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded-md border text-[9.5px] font-bold uppercase tracking-wide ${priorityClass}`}
        >
          {deal.priority}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200/80 px-1.5 py-0.5 rounded-md">
          <SparkIcon className="w-2.5 h-2.5 text-emerald-600" />
          {deal.score}
        </span>
      </div>

      <h3 className="mt-2 text-[13px] font-bold text-slate-900 leading-snug line-clamp-2 min-h-[2.2rem] group-hover:text-emerald-800 transition-colors">
        {deal.name}
      </h3>
      <p className="text-[11px] text-slate-500 truncate">{deal.company}</p>

      <div className="mt-2.5 flex items-center gap-2">
        <Avatar name={deal.contactName} />
        <div className="min-w-0">
          <div className="text-[11px] font-semibold text-slate-800 truncate">{deal.contactName}</div>
          <div className="text-[10px] text-slate-400 truncate">{deal.role}</div>
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between gap-2">
          <span className="text-base font-extrabold text-slate-900 tracking-tight">
            {formatCurrency(deal.value)}
          </span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${stageMeta.pill}`}>
            {deal.probability}%
          </span>
        </div>
        <div className="mt-1.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${stageMeta.bar}`}
            style={{ width: `${deal.probability}%` }}
          />
        </div>
      </div>

      <p className="mt-2 text-[10.5px] text-slate-500 line-clamp-1">
        <span className="font-bold text-slate-600">Next:</span> {deal.nextStep}
      </p>

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
            overdue ? 'text-rose-600' : 'text-slate-500'
          }`}
        >
          <CalendarIcon className="w-3 h-3" />
          {formatShortDate(deal.closeDate)}
          {overdue && <span className="font-bold">· Overdue</span>}
        </span>

        <span
          className="inline-flex items-center gap-1.5 text-[10px] text-slate-500 min-w-0"
          title={`Owner: ${deal.owner}`}
        >
          <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#0c3529] to-[#1e6650] text-[#c8f169] text-[8px] font-extrabold flex items-center justify-center shrink-0">
            {getInitials(deal.owner)}
          </span>
          <span className="truncate max-w-[80px]">{deal.owner.split(' ')[0]}</span>
        </span>
      </div>
    </article>
  )
}

export function CrmPage() {
  usePageTitle('CRM Pipeline & Deals · CallWave')
  const navigate = useNavigate()

  const [deals, setDeals] = useState<Deal[]>(DEALS)
  const [search, setSearch] = useState('')
  const [ownerFilter, setOwnerFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [sortBy, setSortBy] = useState<SortOption>('value-desc')
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board')

  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverStage, setDragOverStage] = useState<DealStage | null>(null)

  const [selectedDealId, setSelectedDealId] = useState<string | null>(null)
  const [dealNotes, setDealNotes] = useState('')
  const [isNewDealOpen, setIsNewDealOpen] = useState(false)

  const [toast, setToast] = useState<{ id: number; message: string } | null>(null)
  const notify = useCallback((message: string) => {
    setToast({ id: Date.now(), message })
  }, [])
  const closeToast = useCallback(() => setToast(null), [])

  const stats = useMemo(() => {
    const openDeals = deals.filter((deal) => deal.stage !== 'Won' && deal.stage !== 'Lost')
    const wonDeals = deals.filter((deal) => deal.stage === 'Won')
    const lostDeals = deals.filter((deal) => deal.stage === 'Lost')

    const openValue = openDeals.reduce((total, deal) => total + deal.value, 0)
    const weightedValue = openDeals.reduce(
      (total, deal) => total + (deal.value * deal.probability) / 100,
      0,
    )
    const wonValue = wonDeals.reduce((total, deal) => total + deal.value, 0)
    const totalValue = deals.reduce((total, deal) => total + deal.value, 0)
    const closedCount = wonDeals.length + lostDeals.length
    const winRate = closedCount > 0 ? (wonDeals.length / closedCount) * 100 : 0
    const avgDealSize = deals.length > 0 ? totalValue / deals.length : 0
    const highIntent = openDeals.filter((deal) => deal.score >= 85).length

    return {
      openCount: openDeals.length,
      openValue,
      weightedValue,
      wonValue,
      wonCount: wonDeals.length,
      lostCount: lostDeals.length,
      closedCount,
      winRate,
      avgDealSize,
      highIntent,
      coverage: openValue > 0 ? (weightedValue / openValue) * 100 : 0,
    }
  }, [deals])

  const filteredDeals = useMemo(() => {
    const query = search.trim().toLowerCase()

    return deals
      .filter((deal) => {
        if (query) {
          const matches =
            deal.name.toLowerCase().includes(query) ||
            deal.company.toLowerCase().includes(query) ||
            deal.contactName.toLowerCase().includes(query) ||
            deal.owner.toLowerCase().includes(query) ||
            deal.nextStep.toLowerCase().includes(query) ||
            deal.tags.some((tag) => tag.toLowerCase().includes(query))
          if (!matches) return false
        }

        if (ownerFilter !== 'all' && deal.owner !== ownerFilter) return false
        if (priorityFilter !== 'all' && deal.priority !== priorityFilter) return false

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'value-desc') return b.value - a.value
        if (sortBy === 'value-asc') return a.value - b.value
        if (sortBy === 'close-asc')
          return parseDate(a.closeDate).getTime() - parseDate(b.closeDate).getTime()
        if (sortBy === 'probability-desc') return b.probability - a.probability
        if (sortBy === 'company-asc') return a.company.localeCompare(b.company)
        return 0
      })
  }, [deals, search, ownerFilter, priorityFilter, sortBy])

  const stageBuckets = useMemo(
    () =>
      DEAL_STAGES.map((stage) => {
        const items = filteredDeals.filter((deal) => deal.stage === stage.id)
        return {
          ...stage,
          items,
          total: items.reduce((sum, deal) => sum + deal.value, 0),
        }
      }),
    [filteredDeals],
  )

  const maxStageTotal = Math.max(...stageBuckets.map((bucket) => bucket.total), 1)
  const visibleValue = filteredDeals.reduce((total, deal) => total + deal.value, 0)
  const selectedDeal = deals.find((deal) => deal.id === selectedDealId) ?? null
  const hasActiveFilters =
    search.trim().length > 0 || ownerFilter !== 'all' || priorityFilter !== 'all'

  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }).format(new Date()),
    [],
  )

  useEffect(() => {
    if (!selectedDealId) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setSelectedDealId(null)
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedDealId])

  function openDeal(deal: Deal) {
    setSelectedDealId(deal.id)
    setDealNotes(deal.notes)
  }

  function moveDeal(dealId: string, nextStage: DealStage) {
    const deal = deals.find((item) => item.id === dealId)
    if (!deal || deal.stage === nextStage) return

    const previousStage = deal.stage
    const activityId = nextActivityId('act-stage')

    setDeals((prev) =>
      prev.map((item) =>
        item.id === dealId
          ? {
              ...item,
              stage: nextStage,
              probability: STAGE_PROBABILITY[nextStage],
              lostReason:
                nextStage === 'Lost'
                  ? item.lostReason ?? 'Marked lost from the CRM pipeline.'
                  : nextStage === 'Won'
                    ? undefined
                    : item.lostReason,
              activity: [
                {
                  id: activityId,
                  type: 'stage',
                  title: `Stage updated to ${nextStage}`,
                  detail: `Deal moved from ${previousStage} to ${nextStage}.`,
                  time: 'Just now',
                },
                ...item.activity,
              ],
            }
          : item,
      ),
    )

    notify(`${deal.name} moved from ${previousStage} to ${nextStage}.`)
  }

  function handleDragStart(event: DragEvent<HTMLElement>, deal: Deal) {
    event.dataTransfer.setData('text/plain', deal.id)
    event.dataTransfer.effectAllowed = 'move'
    setDraggingId(deal.id)
  }

  function handleDragEnd() {
    setDraggingId(null)
    setDragOverStage(null)
  }

  function handleDrop(event: DragEvent<HTMLElement>, stage: DealStage) {
    event.preventDefault()
    const dealId = event.dataTransfer.getData('text/plain') || draggingId
    if (dealId) moveDeal(dealId, stage)
    setDragOverStage(null)
    setDraggingId(null)
  }

  function handleSaveNotes() {
    if (!selectedDeal) return

    setDeals((prev) =>
      prev.map((deal) =>
        deal.id === selectedDeal.id
          ? {
              ...deal,
              notes: dealNotes,
              activity: [
                {
                  id: nextActivityId('act-note'),
                  type: 'note',
                  title: 'Deal notes updated',
                  detail: dealNotes.trim() || 'Notes cleared.',
                  time: 'Just now',
                },
                ...deal.activity,
              ],
            }
          : deal,
      ),
    )
    notify('Deal notes updated.')
  }

  function handleLogActivity(deal: Deal, type: DealActivityType, title: string, detail: string) {
    setDeals((prev) =>
      prev.map((item) =>
        item.id === deal.id
          ? {
              ...item,
              activity: [
                {
                  id: nextActivityId('act-log'),
                  type,
                  title,
                  detail,
                  time: 'Just now',
                },
                ...item.activity,
              ],
            }
          : item,
      ),
    )
    notify('Activity added to the deal timeline.')
  }

  function handleCreateDeal(input: NewDealInput) {
    const newDealId = nextActivityId('deal')
    const createdActivityId = nextActivityId('act-created')
    const newDeal: Deal = {
      id: newDealId,
      name: input.name,
      contactName: input.contactName,
      role: 'Decision Maker',
      company: input.company,
      email:
        input.email ||
        `${input.contactName.toLowerCase().replace(/[^a-z0-9]+/g, '.')}@example.com`,
      phone: input.phone || '—',
      value: input.value,
      stage: input.stage,
      priority: input.priority,
      probability: STAGE_PROBABILITY[input.stage],
      owner: input.owner,
      source: input.source,
      closeDate: input.closeDate,
      createdAt: new Date().toISOString().slice(0, 10),
      nextStep: input.nextStep || 'Define the next step with the deal owner.',
      tags: ['New Deal', input.source],
      score: 70,
      notes: input.notes || 'Manually added from the CRM pipeline.',
      activity: [
        {
          id: createdActivityId,
          type: 'note',
          title: 'Deal created',
          detail: `Manually added to the ${input.stage} stage by ${input.owner}.`,
          time: 'Just now',
        },
      ],
    }

    setDeals((prev) => [newDeal, ...prev])
    setIsNewDealOpen(false)
    setSearch('')
    setOwnerFilter('all')
    setPriorityFilter('all')
    setViewMode('board')
    notify(`Deal “${newDeal.name}” added to ${newDeal.stage}.`)
  }

  function handleExportCsv() {
    if (filteredDeals.length === 0) {
      notify('No deals to export.')
      return
    }

    const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`
    const headers = [
      'Deal',
      'Company',
      'Contact',
      'Email',
      'Phone',
      'Stage',
      'Value (USD)',
      'Probability',
      'Owner',
      'Source',
      'Priority',
      'Close Date',
      'Next Step',
      'Tags',
    ]

    const rows = filteredDeals.map((deal) => [
      escape(deal.name),
      escape(deal.company),
      escape(deal.contactName),
      escape(deal.email),
      escape(deal.phone),
      deal.stage,
      deal.value,
      `${deal.probability}%`,
      escape(deal.owner),
      escape(deal.source),
      deal.priority,
      deal.closeDate,
      escape(deal.nextStep),
      escape(deal.tags.join('; ')),
    ])

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `callwave_crm_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    notify(`Exported ${filteredDeals.length} deals to CSV.`)
  }

  function resetFilters() {
    setSearch('')
    setOwnerFilter('all')
    setPriorityFilter('all')
  }

  return (
    <>
      <DashboardLayout
        search={search}
        onSearchChange={setSearch}
        onNotice={notify}
        onNewCampaign={() => setIsNewDealOpen(true)}
        activeNav="crm"
      >
        <div className="max-w-[1440px] mx-auto space-y-4 pb-16">
          {/* Header */}
          <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-200/70 shadow-[0_10px_30px_-15px_rgba(15,80,55,0.06),0_1px_3px_rgba(0,0,0,0.02)] p-4 sm:p-5">
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-emerald-400/15 via-teal-300/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-teal-400/10 via-emerald-200/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-3.5">
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/90 border border-emerald-200/70 text-emerald-800 font-semibold shadow-2xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <PipelineIcon className="w-3 h-3" />
                  <span>Revenue Operations</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 border border-slate-200/80 text-slate-700 font-medium shadow-2xs">
                  <SparkIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{formatCompactCurrency(stats.weightedValue)} weighted forecast</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 border border-slate-200/80 text-slate-700 font-medium shadow-2xs">
                  <CalendarIcon className="w-3 h-3 text-slate-400" />
                  <span>{stats.openCount} open deals</span>
                </div>

                <div className="hidden md:inline-flex items-center gap-1.5 ml-auto text-slate-400 font-medium">
                  <span>Pipeline synced</span>
                  <span className="text-slate-500 font-semibold">{todayLabel}</span>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                    CRM{' '}
                    <span className="bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
                      Pipeline
                    </span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5 max-w-2xl leading-relaxed">
                    Track every AI-qualified deal from first touch to closed-won, with owners,
                    forecasts, and next best actions in one board.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
                  <button
                    type="button"
                    onClick={() => navigate('/contacts')}
                    className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs hover:border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ContactsIcon className="w-4 h-4 text-slate-500" />
                    Contacts
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs hover:border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <DownloadIcon className="w-4 h-4 text-slate-500" />
                    Export
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsNewDealOpen(true)}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlusIcon className="w-4 h-4" />
                    New deal
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* KPI cards */}
          <section
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4"
            aria-label="CRM executive KPIs"
          >
            <KpiCard
              title="Open pipeline"
              value={formatCompactCurrency(stats.openValue)}
              unit={`${stats.openCount} active deals`}
              footer={`Avg. deal size ${formatCompactCurrency(stats.avgDealSize)}`}
              trend="+7.4%"
              icon={PipelineIcon}
              tone="emerald"
            />
            <KpiCard
              title="Weighted forecast"
              value={formatCompactCurrency(stats.weightedValue)}
              unit={`${stats.coverage.toFixed(0)}% of pipeline`}
              footer={`${stats.highIntent} high-intent deals`}
              trend="+12.1%"
              icon={SparkIcon}
              tone="teal"
            />
            <KpiCard
              title="Closed won"
              value={formatCompactCurrency(stats.wonValue)}
              unit={`${stats.wonCount} deals`}
              footer="This month's bookings"
              trend="+22.5%"
              icon={CheckCircleIcon}
              tone="blue"
            />
            <KpiCard
              title="Win rate"
              value={`${stats.winRate.toFixed(1)}%`}
              unit={`${stats.wonCount}W · ${stats.lostCount}L`}
              footer={`Across ${stats.closedCount} closed deals`}
              trend="+4.3%"
              icon={TrendUpIcon}
              tone="amber"
            />
          </section>

          {/* Toolbar */}
          <div className="rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-2xs p-3.5 sm:p-4 space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-lg">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search deals, companies, contacts, owners…"
                  aria-label="Search CRM deals"
                  className="w-full pl-8 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-slate-900 transition-all placeholder:text-slate-400"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <CloseIcon className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <SlidersIcon className="w-3.5 h-3.5" />
                  Filters
                </span>

                <select
                  value={ownerFilter}
                  onChange={(event) => setOwnerFilter(event.target.value)}
                  aria-label="Filter deals by owner"
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:border-emerald-500 outline-none cursor-pointer"
                >
                  <option value="all">All owners</option>
                  {DEAL_OWNERS.map((owner) => (
                    <option key={owner} value={owner}>
                      {owner}
                    </option>
                  ))}
                </select>

                <select
                  value={priorityFilter}
                  onChange={(event) => setPriorityFilter(event.target.value)}
                  aria-label="Filter deals by priority"
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:border-emerald-500 outline-none cursor-pointer"
                >
                  <option value="all">All priorities</option>
                  <option value="High">High priority</option>
                  <option value="Medium">Medium priority</option>
                  <option value="Low">Low priority</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortOption)}
                  aria-label="Sort deals"
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:border-emerald-500 outline-none cursor-pointer"
                >
                  <option value="value-desc">Highest value</option>
                  <option value="value-asc">Lowest value</option>
                  <option value="close-asc">Closing soon</option>
                  <option value="probability-desc">Most likely</option>
                  <option value="company-asc">Company A–Z</option>
                </select>

                <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setViewMode('board')}
                    aria-label="Board view"
                    aria-pressed={viewMode === 'board'}
                    title="Pipeline board"
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      viewMode === 'board'
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
                    aria-pressed={viewMode === 'table'}
                    title="Deals table"
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

            <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-500">
                Showing <strong className="text-slate-800">{filteredDeals.length}</strong> of{' '}
                <strong className="text-slate-800">{deals.length}</strong> deals ·{' '}
                <strong className="text-slate-800">{formatCompactCurrency(visibleValue)}</strong>{' '}
                visible
              </span>

              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                  >
                    Clear filters
                  </button>
                )}
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-slate-400">
                  <PipelineIcon className="w-3 h-3" />
                  Drag cards across stages to update the pipeline
                </span>
              </div>
            </div>
          </div>

          {/* Board / Table */}
          {filteredDeals.length === 0 ? (
            <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-2xs mb-4">
                <PipelineIcon className="w-7 h-7" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">No deals found</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                No deals match your search or filters. Try a different query or add a new deal to
                the pipeline.
              </p>
              <div className="mt-5 flex items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                >
                  Clear filters
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewDealOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusIcon className="w-4 h-4" />
                  New deal
                </button>
              </div>
            </div>
          ) : viewMode === 'board' ? (
            <div className="grid grid-flow-col auto-cols-[minmax(252px,1fr)] gap-3 overflow-x-auto pb-3 -mx-1 px-1">
              {stageBuckets.map((stage) => {
                const meta = STAGE_META[stage.id]
                const isDropTarget = dragOverStage === stage.id

                return (
                  <section
                    key={stage.id}
                    onDragOver={(event) => {
                      event.preventDefault()
                      event.dataTransfer.dropEffect = 'move'
                      setDragOverStage(stage.id)
                    }}
                    onDragLeave={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                        setDragOverStage(null)
                      }
                    }}
                    onDrop={(event) => handleDrop(event, stage.id)}
                    aria-label={`${stage.label} stage`}
                    className={`flex flex-col rounded-2xl border min-h-[440px] transition-all ${
                      isDropTarget
                        ? 'border-emerald-400 bg-emerald-50/70 ring-2 ring-emerald-400/30'
                        : 'border-slate-200/80 bg-slate-50/60'
                    }`}
                  >
                    <div className="p-3 border-b border-slate-200/70">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${meta.dot}`} />
                          <h2 className="text-xs font-bold text-slate-800 truncate">{stage.label}</h2>
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold border ${meta.pill}`}
                          >
                            {stage.items.length}
                          </span>
                        </div>
                        <strong className="text-[11px] font-bold text-slate-700 shrink-0">
                          {formatCompactCurrency(stage.total)}
                        </strong>
                      </div>
                      <div className="mt-2 h-1 w-full bg-white/80 rounded-full overflow-hidden border border-slate-200/50">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${meta.bar}`}
                          style={{ width: `${Math.max((stage.total / maxStageTotal) * 100, 2)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex-1 p-2 space-y-2.5 min-h-[140px]">
                      {stage.items.length === 0 ? (
                        <div className="h-28 rounded-xl border border-dashed border-slate-300 bg-white/50 flex flex-col items-center justify-center gap-1 text-center px-3">
                          <span className="text-[11px] font-semibold text-slate-500">
                            No deals here
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Drag a card into {stage.label.toLowerCase()}
                          </span>
                        </div>
                      ) : (
                        stage.items.map((deal) => (
                          <DealCard
                            key={deal.id}
                            deal={deal}
                            isDragging={draggingId === deal.id}
                            onOpen={openDeal}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                          />
                        ))
                      )}
                    </div>
                  </section>
                )
              })}
            </div>
          ) : (
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table
                  className="min-w-full text-xs text-left divide-y divide-slate-100"
                  aria-label="CRM deals"
                >
                  <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Deal &amp; Contact</th>
                      <th className="px-4 py-3">Stage</th>
                      <th className="px-4 py-3">Value</th>
                      <th className="px-4 py-3">Probability</th>
                      <th className="px-4 py-3">Close Date</th>
                      <th className="px-4 py-3">Owner</th>
                      <th className="px-4 py-3">Source</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDeals.map((deal) => {
                      const meta = STAGE_META[deal.stage]
                      const overdue = isOverdue(deal)

                      return (
                        <tr
                          key={deal.id}
                          onClick={() => openDeal(deal)}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <Avatar name={deal.contactName} />
                              <div className="min-w-0">
                                <strong className="block text-slate-900 font-bold group-hover:text-emerald-700 transition-colors truncate max-w-[230px]">
                                  {deal.name}
                                </strong>
                                <small className="text-[11px] text-slate-500 truncate block max-w-[230px]">
                                  {deal.company} · {deal.contactName}
                                </small>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${meta.pill}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                              {deal.stage}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <strong className="text-slate-900 font-bold">
                              {formatCurrency(deal.value)}
                            </strong>
                          </td>

                          <td className="px-4 py-3">
                            <div className="w-28 space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-600">
                                <span>{deal.probability}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${meta.bar}`}
                                  style={{ width: `${deal.probability}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`font-semibold ${
                                overdue ? 'text-rose-600' : 'text-slate-700'
                              }`}
                            >
                              {formatShortDate(deal.closeDate)}
                            </span>
                            {overdue && (
                              <small className="block text-[10px] font-bold text-rose-500">
                                Overdue
                              </small>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#0c3529] to-[#1e6650] text-[#c8f169] text-[8px] font-extrabold flex items-center justify-center shrink-0">
                                {getInitials(deal.owner)}
                              </span>
                              <span className="text-[11px] font-medium text-slate-700 truncate max-w-[90px]">
                                {deal.owner}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <span className="inline-flex px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200/60">
                              {deal.source}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-right">
                            <div
                              className="flex items-center justify-end gap-1.5"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => openDeal(deal)}
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                                title="Open deal"
                              >
                                <PipelineIcon className="w-3.5 h-3.5 text-slate-500" />
                              </button>
                              <button
                                type="button"
                                onClick={() => navigate('/inbox')}
                                className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                                title={`WhatsApp ${deal.contactName}`}
                              >
                                <WhatsAppIcon className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>

      {/* Deal detail drawer */}
      {selectedDeal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedDealId(null)
          }}
        >
          <div
            className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden animate-in slide-in-from-right duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="deal-drawer-title"
          >
            <div className="p-6 bg-gradient-to-br from-[#0c3529] via-[#104435] to-[#0c3529] text-white relative">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-[#c8f169] text-[#0c3529] text-xl font-extrabold flex items-center justify-center shadow-md shrink-0">
                    {getInitials(selectedDeal.contactName)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${STAGE_META[selectedDeal.stage].pill}`}
                      >
                        {selectedDeal.stage}
                      </span>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${PRIORITY_META[selectedDeal.priority]}`}
                      >
                        {selectedDeal.priority} priority
                      </span>
                    </div>
                    <h2
                      id="deal-drawer-title"
                      className="mt-1 text-xl font-bold tracking-tight text-white truncate"
                    >
                      {selectedDeal.name}
                    </h2>
                    <p className="text-xs text-emerald-100/90 font-medium truncate">
                      {selectedDeal.company} · {selectedDeal.contactName}
                    </p>
                    <p className="mt-1 text-[11px] text-emerald-200/70 font-mono truncate">
                      {selectedDeal.email}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  onClick={() => setSelectedDealId(null)}
                  aria-label="Close deal drawer"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div>
                  <span className="block text-[9.5px] uppercase tracking-wider font-bold text-emerald-200/70">
                    Deal value
                  </span>
                  <strong className="text-xl sm:text-2xl font-extrabold text-white">
                    {formatCurrency(selectedDeal.value)}
                  </strong>
                </div>
                <div>
                  <span className="block text-[9.5px] uppercase tracking-wider font-bold text-emerald-200/70">
                    Probability
                  </span>
                  <strong className="text-xl sm:text-2xl font-extrabold text-white">
                    {selectedDeal.probability}%
                  </strong>
                </div>
                <div>
                  <span className="block text-[9.5px] uppercase tracking-wider font-bold text-emerald-200/70">
                    Expected close
                  </span>
                  <strong className="text-sm sm:text-base font-extrabold text-white">
                    {formatLongDate(selectedDeal.closeDate)}
                  </strong>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/15 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#c8f169] hover:bg-[#bbf055] text-[#0c3529] text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
                  onClick={() => navigate('/inbox')}
                >
                  <WhatsAppIcon className="w-3.5 h-3.5" />
                  WhatsApp
                </button>

                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/15 cursor-pointer active:scale-95"
                  onClick={() =>
                    handleLogActivity(
                      selectedDeal,
                      'call',
                      'Sales call logged',
                      'Manual call activity recorded from the CRM deal drawer.',
                    )
                  }
                >
                  <PhoneIcon className="w-3 h-3" />
                  Log call
                </button>

                {selectedDeal.stage !== 'Won' && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/15 cursor-pointer active:scale-95"
                    onClick={() => moveDeal(selectedDeal.id, 'Won')}
                  >
                    <CheckCircleIcon className="w-3 h-3 text-emerald-400" />
                    Mark won
                  </button>
                )}

                {selectedDeal.stage !== 'Lost' && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold transition-all border border-rose-400/20 cursor-pointer active:scale-95"
                    onClick={() => moveDeal(selectedDeal.id, 'Lost')}
                  >
                    <CloseIcon className="w-3 h-3" />
                    Mark lost
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {selectedDeal.stage === 'Lost' && (
                <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <strong className="block text-xs font-bold text-rose-900">
                        Deal marked lost
                      </strong>
                      <p className="text-[11px] text-rose-700 mt-0.5">
                        {selectedDeal.lostReason ?? 'No reason recorded.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-700 text-[10px] font-bold hover:bg-rose-100 transition-colors cursor-pointer shrink-0"
                      onClick={() => moveDeal(selectedDeal.id, 'Qualified')}
                    >
                      Reopen
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Pipeline stage
                </span>
                <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-xl">
                  {DEAL_STAGES.filter((stage) => stage.id !== 'Lost').map((stage, index) => {
                    const isActive = selectedDeal.stage === stage.id
                    return (
                      <button
                        key={stage.id}
                        type="button"
                        className={`py-2 px-1 rounded-lg text-center text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-white text-emerald-900 shadow-sm border border-emerald-500/30'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                        }`}
                        onClick={() => moveDeal(selectedDeal.id, stage.id)}
                      >
                        <span className="block text-[9px] text-slate-400">{index + 1}.</span>
                        <span className="block truncate">{stage.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-2xl p-4 bg-emerald-50/60 border border-emerald-200/80 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                  <SparkIcon className="w-4 h-4 text-emerald-600" />
                  AI next best action
                </div>
                <p className="text-xs text-emerald-950/80 leading-relaxed">
                  {selectedDeal.nextStep}
                </p>
                <p className="text-[10px] text-emerald-700/80 font-medium">
                  Intent score {selectedDeal.score}/100 · Source {selectedDeal.source}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
                  <span className="block text-[9.5px] uppercase tracking-wider font-bold text-slate-400">
                    Deal owner
                  </span>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Avatar name={selectedDeal.owner} />
                    <strong className="text-xs font-bold text-slate-900">
                      {selectedDeal.owner}
                    </strong>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
                  <span className="block text-[9.5px] uppercase tracking-wider font-bold text-slate-400">
                    Contact
                  </span>
                  <strong className="block mt-1.5 text-xs font-bold text-slate-900">
                    {selectedDeal.contactName}
                  </strong>
                  <span className="block text-[10px] text-slate-500">{selectedDeal.role}</span>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
                  <span className="block text-[9.5px] uppercase tracking-wider font-bold text-slate-400">
                    Email
                  </span>
                  <span className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-700 break-all">
                    <MailIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {selectedDeal.email}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
                  <span className="block text-[9.5px] uppercase tracking-wider font-bold text-slate-400">
                    Phone
                  </span>
                  <span className="mt-1.5 flex items-center gap-1.5 text-[11px] font-mono font-semibold text-slate-700">
                    <PhoneIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {selectedDeal.phone}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
                  <span className="block text-[9.5px] uppercase tracking-wider font-bold text-slate-400">
                    Created
                  </span>
                  <strong className="block mt-1.5 text-xs font-bold text-slate-800">
                    {formatLongDate(selectedDeal.createdAt)}
                  </strong>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
                  <span className="block text-[9.5px] uppercase tracking-wider font-bold text-slate-400">
                    Priority
                  </span>
                  <span
                    className={`inline-flex mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${PRIORITY_META[selectedDeal.priority]}`}
                  >
                    {selectedDeal.priority}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {selectedDeal.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500"
                    htmlFor="deal-drawer-notes"
                  >
                    Deal notes
                  </label>
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    <PencilIcon className="w-3 h-3" />
                    Save notes
                  </button>
                </div>
                <textarea
                  id="deal-drawer-notes"
                  rows={3}
                  value={dealNotes}
                  onChange={(event) => setDealNotes(event.target.value)}
                  placeholder="Add context, buying signals, or next steps…"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-slate-800 resize-none"
                />
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Activity timeline
                </span>
                <div className="relative space-y-3">
                  {selectedDeal.activity.map((item) => {
                    const activityMeta = ACTIVITY_META[item.type]
                    const Icon = activityMeta.icon

                    return (
                      <div key={item.id} className="relative flex gap-3">
                        <span
                          className={`relative z-10 w-7 h-7 rounded-full border flex items-center justify-center shrink-0 ${activityMeta.tile}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <div className="min-w-0 flex-1 pb-1">
                          <div className="flex items-start justify-between gap-2">
                            <strong className="text-[11.5px] font-bold text-slate-800">
                              {item.title}
                            </strong>
                            <span className="text-[9.5px] text-slate-400 shrink-0">{item.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                            {item.detail}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isNewDealOpen && (
        <NewDealModal onClose={() => setIsNewDealOpen(false)} onCreate={handleCreateDeal} />
      )}

      {toast && <Toast key={toast.id} message={toast.message} onClose={closeToast} />}
    </>
  )
}
