import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../components/dashboard/DashboardLayout'
import {
  CheckCircleIcon,
  ClockIcon,
  SearchIcon,
  WhatsAppIcon,
} from '../components/dashboard/DashboardIcons'
import { ArrowRightIcon as LongArrowIcon, SparkIcon } from '../components/icons'
import { Toast } from '../components/dashboard/Toast'
import { usePageTitle } from '../lib/usePageTitle'

type Automation = {
  id: string
  name: string
  description: string
  trigger: string
  action: string
  runs: number
  lastRun: string
  enabled: boolean
  tone: 'emerald' | 'violet' | 'amber' | 'sky'
}

type AutomationTemplate = Pick<Automation, 'name' | 'description' | 'trigger' | 'action' | 'tone'>

const INITIAL_AUTOMATIONS: Automation[] = [
  {
    id: 'welcome',
    name: 'Welcome new leads',
    description: 'Make every new conversation feel personal from the very first message.',
    trigger: 'New contact added',
    action: 'Send welcome message',
    runs: 1248,
    lastRun: '2 min ago',
    enabled: true,
    tone: 'emerald',
  },
  {
    id: 'follow-up',
    name: 'Follow up after 24 hours',
    description: 'Bring quiet conversations back to life with a thoughtful nudge.',
    trigger: 'No reply for 24 hours',
    action: 'Send follow-up template',
    runs: 836,
    lastRun: '18 min ago',
    enabled: true,
    tone: 'violet',
  },
  {
    id: 'new-deal',
    name: 'New deal notification',
    description: 'Keep your team in the loop as soon as a lead moves forward.',
    trigger: 'Deal stage changes',
    action: 'Notify sales team',
    runs: 392,
    lastRun: '1 hour ago',
    enabled: true,
    tone: 'amber',
  },
  {
    id: 'missed-call',
    name: 'Missed call recovery',
    description: 'Reach out automatically when a customer cannot get through.',
    trigger: 'Call is missed',
    action: 'Start WhatsApp conversation',
    runs: 156,
    lastRun: 'Yesterday',
    enabled: false,
    tone: 'sky',
  },
]

const AUTOMATION_TEMPLATES: AutomationTemplate[] = [
  {
    name: 'Welcome new leads',
    description: 'Greet new contacts and start the conversation on the right note.',
    trigger: 'New contact added',
    action: 'Send welcome message',
    tone: 'emerald',
  },
  {
    name: 'Follow up after 24 hours',
    description: 'Send a friendly follow-up when a conversation goes quiet.',
    trigger: 'No reply for 24 hours',
    action: 'Send follow-up template',
    tone: 'violet',
  },
  {
    name: 'Missed call recovery',
    description: 'Reconnect with customers automatically after a missed call.',
    trigger: 'Call is missed',
    action: 'Start WhatsApp conversation',
    tone: 'sky',
  },
]

type ListFilter = 'All' | 'Active' | 'Paused'

const TONE_STYLES: Record<Automation['tone'], { icon: string; line: string; wash: string }> = {
  emerald: { icon: 'bg-emerald-100 text-emerald-700', line: 'bg-emerald-400', wash: 'from-emerald-50' },
  violet: { icon: 'bg-violet-100 text-violet-700', line: 'bg-violet-400', wash: 'from-violet-50' },
  amber: { icon: 'bg-amber-100 text-amber-700', line: 'bg-amber-400', wash: 'from-amber-50' },
  sky: { icon: 'bg-sky-100 text-sky-700', line: 'bg-sky-400', wash: 'from-sky-50' },
}

export function AutomationsPage() {
  usePageTitle('Automations · CallWave')
  const navigate = useNavigate()
  const [automations, setAutomations] = useState(INITIAL_AUTOMATIONS)
  const [search, setSearch] = useState('')
  const [globalSearch, setGlobalSearch] = useState('')
  const [filter, setFilter] = useState<ListFilter>('All')
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const activeCount = automations.filter((automation) => automation.enabled).length
  const totalRuns = automations.reduce((total, automation) => total + automation.runs, 0)
  const filteredAutomations = useMemo(() => {
    const query = search.trim().toLowerCase()
    return automations.filter((automation) => {
      const matchesFilter =
        filter === 'All' || (filter === 'Active' ? automation.enabled : !automation.enabled)
      const matchesSearch =
        !query ||
        `${automation.name} ${automation.description} ${automation.trigger} ${automation.action}`
          .toLowerCase()
          .includes(query)
      return matchesFilter && matchesSearch
    })
  }, [automations, filter, search])

  function createAutomation(template: AutomationTemplate) {
    setAutomations((current) => [
      {
        ...template,
        id: `automation-${Date.now()}`,
        runs: 0,
        lastRun: 'Not run yet',
        enabled: true,
      },
      ...current,
    ])
    setFilter('All')
    setSearch('')
    setTemplatePickerOpen(false)
    setToast(`${template.name} added to your automations`)
  }

  function toggleAutomation(id: string) {
    setAutomations((current) =>
      current.map((automation) =>
        automation.id === id ? { ...automation, enabled: !automation.enabled } : automation,
      ),
    )
  }

  return (
    <>
      <DashboardLayout
        search={globalSearch}
        onSearchChange={setGlobalSearch}
        onNotice={setToast}
        onNewCampaign={() => navigate('/campaigns')}
        activeNav="automations"
      >
        <div className="mx-auto max-w-7xl space-y-6 pb-10">
          <section className="relative overflow-hidden rounded-3xl border border-emerald-900/10 bg-[#103d32] px-6 py-7 text-white shadow-[0_18px_45px_-25px_rgba(16,61,50,0.55)] sm:px-9 sm:py-9">
            <div className="pointer-events-none absolute -right-20 -top-36 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-teal-300/10 blur-3xl" />
            <div className="relative grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="max-w-xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-100">
                  <SparkIcon className="h-3.5 w-3.5" />
                  YOUR WORKFLOW, ON AUTOPILOT
                </div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Less busywork.
                  <br />
                  <span className="text-emerald-300">More conversations.</span>
                </h1>
                <p className="mt-3 max-w-lg text-sm leading-6 text-emerald-50/75">
                  Create smart workflows that welcome leads, follow up at the right moment, and keep
                  your team moving — automatically.
                </p>
                <button
                  type="button"
                  onClick={() => setTemplatePickerOpen(true)}
                  className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#c8f169] px-4 py-2.5 text-sm font-bold text-[#143c30] shadow-lg shadow-black/10 transition hover:bg-[#d6fa82] focus:outline-none focus:ring-4 focus:ring-emerald-200/30"
                >
                  Create automation
                  <LongArrowIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="relative hidden rounded-2xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-sm sm:block">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">Your workflow</p>
                    <p className="mt-1 text-[10px] text-emerald-100/55">Welcome new leads</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-300/15 px-2.5 py-1 text-[10px] font-semibold text-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    Active
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex-1 rounded-xl border border-white/10 bg-white/[0.07] p-3">
                    <span className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-sky-300/15 text-sky-200">
                      <CheckCircleIcon className="h-4 w-4" />
                    </span>
                    <p className="text-[10px] font-semibold text-white">When this happens</p>
                    <p className="mt-1 text-[9px] text-emerald-100/55">New contact added</p>
                  </div>
                  <LongArrowIcon className="h-4 w-4 shrink-0 text-emerald-200/60" />
                  <div className="flex-1 rounded-xl border border-white/10 bg-white/[0.07] p-3">
                    <span className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-300/15 text-emerald-200">
                      <WhatsAppIcon className="h-4 w-4" />
                    </span>
                    <p className="text-[10px] font-semibold text-white">Then do this</p>
                    <p className="mt-1 text-[9px] text-emerald-100/55">Send a welcome message</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3 text-[10px] text-emerald-100/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  1,248 runs this month
                  <span className="ml-auto font-semibold text-emerald-200">98.4% success</span>
                </div>
              </div>
            </div>
          </section>

          <section aria-label="Automation overview" className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Total automations', value: automations.length, hint: 'Across your workspace', icon: '✳', color: 'text-violet-600 bg-violet-50' },
              { label: 'Running now', value: activeCount, hint: 'Working around the clock', icon: '↗', color: 'text-emerald-700 bg-emerald-50' },
              { label: 'Workflow runs', value: totalRuns.toLocaleString(), hint: 'All-time completed runs', icon: '⌁', color: 'text-sky-700 bg-sky-50' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_18px_-14px_rgba(15,23,42,0.25)]">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl font-bold ${stat.color}`}>
                  {stat.icon}
                </span>
                <div>
                  <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                  <div className="mt-0.5 flex items-baseline gap-2">
                    <span className="text-xl font-bold tracking-tight text-slate-900">{stat.value}</span>
                    <span className="text-[10px] text-slate-400">{stat.hint}</span>
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_26px_-20px_rgba(15,23,42,0.25)]">
            <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h2 className="text-base font-bold tracking-tight text-slate-900">Your automations</h2>
                <p className="mt-1 text-xs text-slate-500">A little less to remember, every single day.</p>
              </div>
              <button
                type="button"
                onClick={() => setTemplatePickerOpen(true)}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-800"
              >
                <span className="text-base leading-none">+</span>
                New automation
              </button>
            </div>

            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
              <div className="flex items-center gap-1 rounded-xl bg-slate-100/80 p-1">
                {(['All', 'Active', 'Paused'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFilter(option)}
                    aria-pressed={filter === option}
                    className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition ${
                      filter === option
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {option}
                    {option === 'All' && <span className="ml-1.5 text-slate-400">{automations.length}</span>}
                  </button>
                ))}
              </div>
              <label className="relative ml-auto block w-full sm:max-w-60">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search automations"
                  className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </label>
            </div>

            {filteredAutomations.length ? (
              <div className="divide-y divide-slate-100">
                {filteredAutomations.map((automation) => {
                  const tone = TONE_STYLES[automation.tone]
                  return (
                    <article key={automation.id} className="group flex flex-col gap-4 px-5 py-5 transition hover:bg-slate-50/60 sm:flex-row sm:items-center sm:px-6">
                      <div className="flex min-w-0 flex-1 items-center gap-3.5">
                        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone.icon}`}>
                          <WhatsAppIcon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-sm font-bold text-slate-900">{automation.name}</h3>
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              automation.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${automation.enabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                              {automation.enabled ? 'Active' : 'Paused'}
                            </span>
                          </div>
                          <p className="mt-1 truncate text-xs text-slate-500">{automation.description}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500">
                            <span className="inline-flex items-center gap-1.5">
                              <span className={`h-1.5 w-1.5 rounded-full ${tone.line}`} />
                              {automation.trigger}
                            </span>
                            <LongArrowIcon className="hidden h-3 w-3 text-slate-300 sm:block" />
                            <span>{automation.action}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3 sm:justify-end sm:border-0 sm:pt-0">
                        <div className="flex items-center gap-5 sm:mr-2">
                          <div>
                            <p className="text-xs font-bold text-slate-800">{automation.runs.toLocaleString()}</p>
                            <p className="mt-0.5 text-[10px] text-slate-400">runs</p>
                          </div>
                          <div>
                            <p className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
                              <ClockIcon className="h-3 w-3 text-slate-400" />
                              {automation.lastRun}
                            </p>
                            <p className="mt-0.5 text-[10px] text-slate-400">last run</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleAutomation(automation.id)}
                          aria-label={`${automation.enabled ? 'Pause' : 'Activate'} ${automation.name}`}
                          aria-pressed={automation.enabled}
                          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-emerald-500/15 ${
                            automation.enabled ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                        >
                          <span className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                            automation.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="px-6 py-14 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <SearchIcon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-sm font-bold text-slate-800">No automations found</h3>
                <p className="mt-1 text-xs text-slate-500">Try another search or switch to a different filter.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setFilter('All')
                  }}
                  className="mt-3 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Clear filters
                </button>
              </div>
            )}
          </section>
        </div>
      </DashboardLayout>

      {templatePickerOpen && (
        <div
          className="modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setTemplatePickerOpen(false)
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="automation-picker-title"
            className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">Get started in a click</p>
                <h2 id="automation-picker-title" className="mt-1 text-lg font-bold tracking-tight text-slate-900">Choose a workflow</h2>
                <p className="mt-1 text-xs text-slate-500">Start with a tried-and-ready automation template.</p>
              </div>
              <button
                type="button"
                onClick={() => setTemplatePickerOpen(false)}
                aria-label="Close template picker"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <span aria-hidden="true" className="text-xl leading-none">×</span>
              </button>
            </div>
            <div className="space-y-2 p-4 sm:p-5">
              {AUTOMATION_TEMPLATES.map((template) => (
                <button
                  key={template.name}
                  type="button"
                  onClick={() => createAutomation(template)}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-slate-200 p-3.5 text-left transition hover:border-emerald-300 hover:bg-emerald-50/40"
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TONE_STYLES[template.tone].icon}`}>
                    <WhatsAppIcon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-slate-900">{template.name}</span>
                    <span className="mt-1 block text-[11px] leading-4 text-slate-500">{template.description}</span>
                    <span className="mt-1.5 block text-[10px] font-medium text-slate-400">{template.trigger} → {template.action}</span>
                  </span>
                  <LongArrowIcon className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-emerald-600" />
                </button>
              ))}
            </div>
            <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-3 text-center text-[10px] text-slate-500">
              You can edit every step after adding a workflow.
            </div>
          </section>
        </div>
      )}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  )
}
