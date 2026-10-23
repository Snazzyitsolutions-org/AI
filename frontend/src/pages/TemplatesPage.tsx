import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EyeIcon, SparkIcon } from '../components/icons'
import { DashboardLayout } from '../components/dashboard/DashboardLayout'
import {
  CalendarIcon,
  CopyIcon,
  DownloadIcon,
  GlobeIcon,
  GridIcon,
  ListIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  SendIcon,
  TemplateIcon,
  TrashIcon,
  TrendUpIcon,
  WhatsAppIcon,
} from '../components/dashboard/DashboardIcons'
import { NewTemplateModal } from '../components/dashboard/NewTemplateModal'
import { TemplateDetailDrawer } from '../components/dashboard/TemplateDetailDrawer'
import { TemplateGalleryModal } from '../components/dashboard/TemplateGalleryModal'
import { TemplateMessagePreview } from '../components/dashboard/TemplateMessagePreview'
import { Toast } from '../components/dashboard/Toast'
import {
  TEMPLATE_BLUEPRINTS,
  TEMPLATE_CATEGORIES,
  TEMPLATE_LANGUAGES,
  extractVariableNumbers,
  formatTemplateDate,
  getLanguageLabel,
  getSeedTemplates,
} from '../components/dashboard/templateData'
import type {
  TemplateBlueprint,
  TemplateCategory,
  TemplateDraftInput,
  TemplateFormInitial,
  TemplateStatus,
  WhatsAppTemplate,
} from '../components/dashboard/templateData'
import { usePageTitle } from '../lib/usePageTitle'

type CategoryFilter = 'All' | TemplateCategory
type StatusFilter = 'All' | TemplateStatus
type SortOption = 'recent' | 'usage' | 'name'
type ViewMode = 'grid' | 'table'

type EditorState = {
  mode: 'create' | 'edit'
  template?: WhatsAppTemplate
  initial?: TemplateFormInitial
}

const STORAGE_KEY = 'callwave.whatsapp.templates.v1'
const STATUS_FILTERS: StatusFilter[] = ['All', 'Approved', 'Pending', 'Rejected', 'Draft']

const numberFormatter = new Intl.NumberFormat('en-US')
const compactNumberFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

function loadTemplates(): WhatsAppTemplate[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return getSeedTemplates()

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return getSeedTemplates()

    return parsed as WhatsAppTemplate[]
  } catch {
    return getSeedTemplates()
  }
}

function safeCsvCell(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`
}

function TemplateStatusBadge({ status }: { status: TemplateStatus }) {
  switch (status) {
    case 'Approved':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          Approved
        </span>
      )
    case 'Pending':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          In Review
        </span>
      )
    case 'Rejected':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200/80 text-rose-800 text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Rejected
        </span>
      )
    case 'Draft':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          Draft
        </span>
      )
  }
}

function CategoryPill({ category }: { category: TemplateCategory }) {
  const styles = {
    Marketing: 'bg-purple-50 text-purple-800 border-purple-200/60',
    Utility: 'bg-sky-50 text-sky-800 border-sky-200/60',
    Authentication: 'bg-amber-50 text-amber-800 border-amber-200/60',
  }[category] || 'bg-slate-100 text-slate-700 border-slate-200'

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${styles}`}>
      {category}
    </span>
  )
}

export function TemplatesPage() {
  usePageTitle('WhatsApp Templates · CallWave')

  const navigate = useNavigate()

  const [templates, setTemplates] = useState<WhatsAppTemplate[]>(loadTemplates)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [languageFilter, setLanguageFilter] = useState('All')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  const [editor, setEditor] = useState<EditorState | null>(null)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [detailTemplate, setDetailTemplate] = useState<WhatsAppTemplate | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<WhatsAppTemplate | null>(null)

  const [toast, setToast] = useState<{ id: number; message: string } | null>(null)

  const notify = useCallback((message: string) => {
    setToast({ id: Date.now(), message })
  }, [])

  const closeToast = useCallback(() => setToast(null), [])

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
    } catch {
      // Storage unavailable in private browsing
    }
  }, [templates])

  const stats = useMemo(() => {
    const statusCounts: Record<StatusFilter, number> = {
      All: templates.length,
      Approved: 0,
      Pending: 0,
      Rejected: 0,
      Draft: 0,
    }
    const categoryCounts: Record<CategoryFilter, number> = {
      All: templates.length,
      Marketing: 0,
      Utility: 0,
      Authentication: 0,
    }

    let totalSends = 0
    const languages = new Set<string>()

    templates.forEach((template) => {
      statusCounts[template.status] += 1
      categoryCounts[template.category] += 1
      totalSends += template.usageCount
      languages.add(template.language)
    })

    return {
      statusCounts,
      categoryCounts,
      totalSends,
      approved: statusCounts.Approved,
      pending: statusCounts.Pending,
      rejected: statusCounts.Rejected,
      drafts: statusCounts.Draft,
      languageCount: languages.size,
    }
  }, [templates])

  const filteredTemplates = useMemo(() => {
    const normalized = search.trim().toLowerCase()

    return templates
      .filter((template) => {
        const matchesCategory =
          categoryFilter === 'All' || template.category === categoryFilter
        const matchesStatus = statusFilter === 'All' || template.status === statusFilter
        const matchesLanguage =
          languageFilter === 'All' || template.language === languageFilter
        const matchesSearch =
          !normalized ||
          template.name.toLowerCase().includes(normalized) ||
          template.body.toLowerCase().includes(normalized) ||
          (template.headerText ?? '').toLowerCase().includes(normalized) ||
          (template.footer ?? '').toLowerCase().includes(normalized) ||
          template.category.toLowerCase().includes(normalized) ||
          getLanguageLabel(template.language).toLowerCase().includes(normalized)

        return matchesCategory && matchesStatus && matchesLanguage && matchesSearch
      })
      .sort((a, b) => {
        if (sortBy === 'usage') return b.usageCount - a.usageCount
        if (sortBy === 'name') return a.name.localeCompare(b.name)
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      })
  }, [templates, search, categoryFilter, statusFilter, languageFilter, sortBy])

  function openCreate() {
    setGalleryOpen(false)
    setEditor({ mode: 'create' })
  }

  function openEdit(template: WhatsAppTemplate) {
    setDetailTemplate(null)
    setEditor({
      mode: 'edit',
      template,
      initial: {
        name: template.name,
        category: template.category,
        language: template.language,
        headerType: template.headerType,
        headerText: template.headerText ?? '',
        body: template.body,
        footer: template.footer ?? '',
        buttons: template.buttons.map((button) => ({ ...button })),
        submitForReview: template.status !== 'Approved',
      },
    })
  }

  function handleUseBlueprint(blueprint: TemplateBlueprint) {
    setGalleryOpen(false)
    setEditor({
      mode: 'create',
      initial: {
        name: blueprint.name,
        category: blueprint.category,
        language: blueprint.language,
        headerType: blueprint.headerType,
        headerText: blueprint.headerText ?? '',
        body: blueprint.body,
        footer: blueprint.footer ?? '',
        buttons: blueprint.buttons.map((button) => ({ ...button })),
        submitForReview: true,
      },
    })
  }

  function handleSaveTemplate(input: TemplateDraftInput) {
    const now = new Date().toISOString()

    if (editor?.mode === 'edit' && editor.template) {
      const editing = editor.template
      const resubmitted = input.submitForReview && editing.status !== 'Approved'
      const nextStatus: TemplateStatus = resubmitted ? 'Pending' : editing.status

      setTemplates((current) =>
        current.map((template) =>
          template.id === editing.id
            ? {
                ...template,
                name: input.name,
                category: input.category,
                language: input.language,
                headerType: input.headerType,
                headerText: input.headerText,
                body: input.body,
                footer: input.footer,
                buttons: input.buttons,
                status: nextStatus,
                rejectionReason: resubmitted ? undefined : template.rejectionReason,
                updatedAt: now,
              }
            : template,
        ),
      )

      setEditor(null)
      setDetailTemplate(null)
      notify(
        resubmitted
          ? `“${input.name}” updated and resubmitted for Meta review.`
          : `“${input.name}” updated successfully.`,
      )
      return
    }

    const newTemplate: WhatsAppTemplate = {
      id: `tmpl-${Date.now()}`,
      name: input.name,
      category: input.category,
      status: input.submitForReview ? 'Pending' : 'Draft',
      language: input.language,
      headerType: input.headerType,
      headerText: input.headerText,
      body: input.body,
      footer: input.footer,
      buttons: input.buttons,
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    }

    setTemplates((current) => [newTemplate, ...current])
    setEditor(null)
    setSearch('')
    setCategoryFilter('All')
    setStatusFilter('All')
    setLanguageFilter('All')
    notify(
      input.submitForReview
        ? `“${input.name}” submitted to Meta for review.`
        : `“${input.name}” saved as a draft.`,
    )
  }

  function uniqueCopyName(baseName: string) {
    const base = baseName.slice(0, 52)
    let candidate = `${base}_copy`
    let index = 2

    while (templates.some((template) => template.name === candidate)) {
      candidate = `${base}_copy_${index}`
      index += 1
    }

    return candidate
  }

  function handleDuplicate(template: WhatsAppTemplate) {
    const now = new Date().toISOString()
    const copy: WhatsAppTemplate = {
      ...template,
      id: `tmpl-${Date.now()}`,
      name: uniqueCopyName(template.name),
      status: 'Draft',
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
      rejectionReason: undefined,
      buttons: template.buttons.map((button) => ({ ...button })),
    }

    setTemplates((current) => [copy, ...current])
    setDetailTemplate(null)
    setCategoryFilter('All')
    setStatusFilter('All')
    setSearch('')
    notify(`Duplicated “${template.name}” as a new draft.`)
  }

  function confirmDelete() {
    if (!deleteTarget) return

    setTemplates((current) =>
      current.filter((template) => template.id !== deleteTarget.id),
    )
    setDetailTemplate((current) =>
      current?.id === deleteTarget.id ? null : current,
    )
    notify(`Template “${deleteTarget.name}” deleted.`)
    setDeleteTarget(null)
  }

  function handleSendTest(template: WhatsAppTemplate) {
    notify(`Test WhatsApp message for “${template.name}” queued for +1 (415) 555-0132.`)
  }

  function handleExportCsv() {
    const headers = [
      'Name',
      'Category',
      'Status',
      'Language',
      'Header type',
      'Variables',
      'Buttons',
      'Usage count',
      'Created',
      'Updated',
    ]

    const rows = filteredTemplates.map((template) => [
      safeCsvCell(template.name),
      safeCsvCell(template.category),
      safeCsvCell(template.status),
      safeCsvCell(getLanguageLabel(template.language)),
      safeCsvCell(template.headerType),
      safeCsvCell(extractVariableNumbers(template.headerText, template.body).length),
      safeCsvCell(template.buttons.length),
      template.usageCount,
      safeCsvCell(formatTemplateDate(template.createdAt)),
      safeCsvCell(formatTemplateDate(template.updatedAt)),
    ])

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
    const link = document.createElement('a')
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`
    link.download = `callwave-templates-${Date.now()}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    notify(`Exported ${filteredTemplates.length} templates to CSV.`)
  }

  return (
    <>
      <DashboardLayout
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search templates…"
        onNotice={notify}
        onNewCampaign={() => navigate('/campaigns')}
        activeNav="templates"
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
                  <span>Meta Cloud API v21.0 Connected</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 border border-slate-200/80 text-slate-700 font-medium shadow-2xs">
                  <span className="text-emerald-500 font-bold">✅</span>
                  <span>{stats.approved} Templates Approved</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 border border-slate-200/80 text-slate-700 font-medium shadow-2xs">
                  <span className="text-sky-500 font-bold">🌐</span>
                  <span>{stats.languageCount} Languages Active</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50/80 border border-amber-200/70 text-amber-800 font-medium shadow-2xs">
                  <span>⚡</span>
                  <span>{stats.pending} Awaiting Meta Review</span>
                </div>

                <div className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 border border-slate-200/80 text-slate-600 font-medium shadow-2xs">
                  <TemplateIcon className="w-3 h-3 text-emerald-600" />
                  <span>{TEMPLATE_BLUEPRINTS.length} Ready Blueprints</span>
                </div>
              </div>

              {/* Title & Action Buttons Row */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 mb-0.5">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 font-extrabold text-[9.5px] tracking-wider uppercase border border-emerald-200/60 inline-flex items-center gap-1.5">
                      <WhatsAppIcon className="w-3 h-3 text-emerald-700" />
                      Meta Cloud API · Template Studio
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                    WhatsApp Broadcast &amp; <span className="bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">Template Studio</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5 max-w-3xl leading-relaxed">
                    Create reusable WhatsApp messages once, personalise with dynamic {'{{1}}'} variables, and broadcast across campaigns with Meta API approval built in.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
                  <button
                    type="button"
                    onClick={() => setGalleryOpen(true)}
                    className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs hover:border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <GridIcon className="w-4 h-4 text-slate-500" />
                    <span>Browse Gallery</span>
                  </button>

                  <button
                    type="button"
                    onClick={openCreate}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>New Template</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 2. FOUR EXECUTIVE KPI METRIC CARDS                                        */}
          {/* ========================================================================= */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4" aria-label="Template Executive KPIs">
            {/* KPI 1: Total Templates */}
            <div className="relative rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/80 hover:border-emerald-300/80 p-4 shadow-2xs hover:shadow-md transition-all duration-200 group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Total Templates</span>
                <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-2xs group-hover:scale-105 transition-transform">
                  <TemplateIcon className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <strong className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {templates.length}
                </strong>
                <span className="text-xs font-medium text-slate-400">in library</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 truncate">
                  {stats.drafts} drafts · {stats.rejected} edits
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                  <SparkIcon className="w-3 h-3" /> Library
                </span>
              </div>
            </div>

            {/* KPI 2: Approved & Live */}
            <div className="relative rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/80 hover:border-emerald-300/80 p-4 shadow-2xs hover:shadow-md transition-all duration-200 group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Approved &amp; Live</span>
                <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-2xs group-hover:scale-105 transition-transform">
                  <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
                </span>
              </div>
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <strong className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {stats.approved}
                </strong>
                <span className="text-xs font-medium text-slate-400">
                  / {templates.length}
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 truncate">Ready for broadcasts</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                  <TrendUpIcon className="w-3 h-3" /> {templates.length > 0 ? Math.round((stats.approved / templates.length) * 100) : 0}% rate
                </span>
              </div>
            </div>

            {/* KPI 3: In Review */}
            <div className="relative rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/80 hover:border-emerald-300/80 p-4 shadow-2xs hover:shadow-md transition-all duration-200 group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Awaiting Meta Review</span>
                <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-2xs group-hover:scale-105 transition-transform">
                  <SendIcon className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <strong className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {stats.pending}
                </strong>
                <span className="text-xs font-medium text-amber-600">pending</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 truncate">Submitted to Meta API</span>
                <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">
                  ≈ 24h turnaround
                </span>
              </div>
            </div>

            {/* KPI 4: Lifetime Sends */}
            <div className="relative rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/80 hover:border-emerald-300/80 p-4 shadow-2xs hover:shadow-md transition-all duration-200 group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Total Dispatched</span>
                <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs group-hover:scale-105 transition-transform">
                  <SendIcon className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <strong className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {compactNumberFormatter.format(stats.totalSends)}
                </strong>
                <span className="text-xs font-medium text-slate-400">sends</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 truncate">Lifetime template usage</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                  All time
                </span>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 3. FILTERING, SEARCH & CONTROL TOOLBAR                                    */}
          {/* ========================================================================= */}
          <div className="rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-2xs p-3.5 sm:p-4 space-y-3">
            {/* Category Filter Tabs Strip */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar border-b border-slate-100">
              {(['All', ...TEMPLATE_CATEGORIES] as CategoryFilter[]).map((category) => {
                const isActive = categoryFilter === category
                return (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setCategoryFilter(category)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100/80 hover:bg-slate-200/70 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        category === 'All'
                          ? 'bg-emerald-400'
                          : category === 'Marketing'
                          ? 'bg-purple-400'
                          : category === 'Utility'
                          ? 'bg-sky-400'
                          : 'bg-amber-400'
                      }`}
                    />
                    <span>{category === 'All' ? 'All Templates' : category}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                      }`}
                    >
                      {stats.categoryCounts[category]}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Status Tabs, Search, Language, Sort & View Mode */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
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
                        {stats.statusCounts[status]}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Right Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Search Input */}
                <div className="relative flex-1 sm:w-56">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search templates…"
                    aria-label="Search templates"
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

                {/* Language Filter */}
                <select
                  value={languageFilter}
                  onChange={(e) => setLanguageFilter(e.target.value)}
                  aria-label="Filter by language"
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:border-emerald-500 outline-none cursor-pointer"
                >
                  <option value="All">All Languages</option>
                  {TEMPLATE_LANGUAGES.map((language) => (
                    <option value={language.code} key={language.code}>
                      {language.label}
                    </option>
                  ))}
                </select>

                {/* Sort Option */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  aria-label="Sort templates"
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:border-emerald-500 outline-none cursor-pointer"
                >
                  <option value="recent">Sort: Recently Updated</option>
                  <option value="usage">Most Used</option>
                  <option value="name">Name A–Z</option>
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
                Showing <strong className="text-slate-800">{filteredTemplates.length}</strong> of{' '}
                <strong className="text-slate-800">{templates.length}</strong> templates
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setGalleryOpen(true)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <GridIcon className="w-3 h-3 text-slate-500" />
                  <span>Template Gallery</span>
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
          {/* 4. MAIN TEMPLATE CONTENT: GRID VIEW OR TABLE VIEW                         */}
          {/* ========================================================================= */}
          {filteredTemplates.length === 0 ? (
            /* Empty State */
            <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-2xs mb-4">
                <TemplateIcon className="w-7 h-7" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">No templates found</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                {search
                  ? `Nothing matches “${search}” with the current filters.`
                  : 'No templates in this category yet. Start from a blueprint or create one from scratch.'}
              </p>
              <div className="mt-5 flex items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setCategoryFilter('All')
                    setStatusFilter('All')
                    setLanguageFilter('All')
                  }}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
                <button
                  type="button"
                  onClick={() => setGalleryOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                >
                  Browse Gallery
                </button>
                <button
                  type="button"
                  onClick={openCreate}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>New Template</span>
                </button>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              {filteredTemplates.map((template) => {
                const variables = extractVariableNumbers(template.headerText, template.body)

                return (
                  <article
                    key={template.id}
                    className="group relative flex flex-col rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 overflow-hidden"
                  >
                    {/* Top Status Accent Bar */}
                    <div
                      className={`h-1 w-full ${
                        template.status === 'Approved'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                          : template.status === 'Pending'
                          ? 'bg-amber-400'
                          : template.status === 'Rejected'
                          ? 'bg-rose-500'
                          : 'bg-slate-300'
                      }`}
                    />

                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
                      {/* Badge Row */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <TemplateStatusBadge status={template.status} />
                            <CategoryPill category={template.category} />
                          </div>

                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200/70 px-2 py-0.5 rounded-full">
                            <SendIcon className="w-3 h-3 text-slate-400" />
                            {compactNumberFormatter.format(template.usageCount)} sends
                          </span>
                        </div>

                        {/* Title & Language */}
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                          {template.name}
                        </h3>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {getLanguageLabel(template.language)} ·{' '}
                          {template.headerType === 'none'
                            ? 'No Header'
                            : `${template.headerType.charAt(0).toUpperCase()}${template.headerType.slice(1)} Header`}
                        </span>
                      </div>

                      {/* Embedded WhatsApp Message Bubble */}
                      <div className="rounded-2xl bg-[#efeae2]/40 border border-[#e9edef] p-3 flex-1 flex flex-col justify-center">
                        <TemplateMessagePreview
                          compact
                          headerType={template.headerType}
                          headerText={template.headerText}
                          body={template.body}
                          footer={template.footer}
                          buttons={template.buttons}
                        />
                      </div>

                      {/* Meta Review Rejection Warning */}
                      {template.status === 'Rejected' && template.rejectionReason && (
                        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-800 text-[11px]">
                          <strong>Needs Edits:</strong> {template.rejectionReason}
                        </div>
                      )}

                      {/* Meta Tags Row */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <GlobeIcon className="w-3 h-3 text-slate-400" />
                          {getLanguageLabel(template.language)}
                        </span>
                        <span className="flex items-center gap-1">
                          <TemplateIcon className="w-3 h-3 text-slate-400" />
                          {variables.length} variable{variables.length === 1 ? '' : 's'}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3 text-slate-400" />
                          {formatTemplateDate(template.updatedAt)}
                        </span>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setDetailTemplate(template)}
                          className="flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <EyeIcon className="w-3.5 h-3.5 text-slate-500" />
                          <span>Preview</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(template)}
                            aria-label={`Edit ${template.name}`}
                            title="Edit template"
                            className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                          >
                            <PencilIcon className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDuplicate(template)}
                            aria-label={`Duplicate ${template.name}`}
                            title="Duplicate template"
                            className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                          >
                            <CopyIcon className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(template)}
                            aria-label={`Delete ${template.name}`}
                            title="Delete template"
                            className="p-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
                <table className="min-w-full text-xs text-left divide-y divide-slate-100" aria-label="Templates list">
                  <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Template</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Language</th>
                      <th className="px-4 py-3">Variables</th>
                      <th className="px-4 py-3">Sends</th>
                      <th className="px-4 py-3">Updated</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTemplates.map((template) => {
                      const variables = extractVariableNumbers(template.headerText, template.body)

                      return (
                        <tr key={template.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <span className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-2xs flex-shrink-0">
                                <TemplateIcon className="w-4 h-4" />
                              </span>
                              <div className="min-w-0">
                                <strong className="block text-slate-900 font-bold truncate">{template.name}</strong>
                                <small className="text-[11px] text-slate-500 line-clamp-1">
                                  {template.body.slice(0, 68)}…
                                </small>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <TemplateStatusBadge status={template.status} />
                          </td>

                          <td className="px-4 py-3">
                            <CategoryPill category={template.category} />
                          </td>

                          <td className="px-4 py-3 text-slate-600">
                            {getLanguageLabel(template.language)}
                          </td>

                          <td className="px-4 py-3 font-bold text-slate-800">
                            {variables.length}
                          </td>

                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {numberFormatter.format(template.usageCount)}
                          </td>

                          <td className="px-4 py-3 text-slate-500">
                            {formatTemplateDate(template.updatedAt)}
                          </td>

                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setDetailTemplate(template)}
                                aria-label={`Preview ${template.name}`}
                                title="Preview template"
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                              >
                                <EyeIcon className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => openEdit(template)}
                                aria-label={`Edit ${template.name}`}
                                title="Edit template"
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                              >
                                <PencilIcon className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDuplicate(template)}
                                aria-label={`Duplicate ${template.name}`}
                                title="Duplicate template"
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                              >
                                <CopyIcon className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeleteTarget(template)}
                                aria-label={`Delete ${template.name}`}
                                title="Delete template"
                                className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                              >
                                <TrashIcon className="w-3.5 h-3.5" />
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

      {/* ========================================================================= */}
      {/* 5. MODALS & SLIDE-OVER DRAWERS                                            */}
      {/* ========================================================================= */}
      {galleryOpen && (
        <TemplateGalleryModal
          onClose={() => setGalleryOpen(false)}
          onUse={handleUseBlueprint}
        />
      )}

      {editor && (
        <NewTemplateModal
          key={editor.template?.id ?? editor.initial?.name ?? 'new-template'}
          mode={editor.mode}
          initial={editor.initial}
          onClose={() => setEditor(null)}
          onSave={handleSaveTemplate}
        />
      )}

      {detailTemplate && (
        <TemplateDetailDrawer
          template={detailTemplate}
          onClose={() => setDetailTemplate(null)}
          onEdit={openEdit}
          onDuplicate={handleDuplicate}
          onDelete={setDeleteTarget}
          onSendTest={handleSendTest}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDeleteTarget(null)
          }}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 p-5 sm:p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-template-title"
          >
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center flex-shrink-0 shadow-2xs">
                <TrashIcon className="w-5 h-5" />
              </span>
              <div>
                <h3 id="delete-template-title" className="text-base font-bold text-slate-900">
                  Delete this template?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mt-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <strong>“{deleteTarget.name}”</strong> will be permanently removed from your workspace. Messages that were already sent will not be affected.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                onClick={() => setDeleteTarget(null)}
              >
                Keep Template
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                onClick={confirmDelete}
              >
                <TrashIcon className="w-4 h-4" />
                <span>Delete Template</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast key={toast.id} message={toast.message} onClose={closeToast} />}
    </>
  )
}
