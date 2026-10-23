import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  SearchIcon,
  CloseIcon,
  MegaphoneIcon,
  TemplateIcon,
  ContactsIcon,
  DashboardIcon,
  ChatIcon,
  BellIcon,
  PlusIcon,
  ArrowUpRightIcon,
  AnalyticsIcon,
} from './DashboardIcons'
import { SparkIcon } from '../icons'
import { CAMPAIGNS, CONTACTS } from './campaignData'
import { getSeedTemplates } from './templateData'

export interface SearchResultItem {
  id: string
  title: string
  subtitle: string
  category: 'campaign' | 'contact' | 'template' | 'page' | 'action'
  route?: string
  action?: () => void
  meta?: string
  score?: number
}

interface GlobalSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onNewCampaign?: () => void
  onNotice?: (msg: string) => void
}

type FilterCategory = 'all' | 'campaign' | 'contact' | 'template' | 'page'

export function GlobalSearchModal({
  isOpen,
  onClose,
  onNewCampaign,
  onNotice,
}: GlobalSearchModalProps) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const [query, setQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('all')
  const [activeIndex, setActiveIndex] = useState(0)

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedFilter('all')
      setActiveIndex(0)
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // All indexed items across the platform
  const allItems: SearchResultItem[] = useMemo(() => {
    const items: SearchResultItem[] = []

    // 1. Pages Navigation
    items.push(
      {
        id: 'page-dashboard',
        title: 'Dashboard Overview',
        subtitle: 'Live voice telemetry, KPI metrics, recent activity & campaign performance',
        category: 'page',
        route: '/dashboard',
      },
      {
        id: 'page-inbox',
        title: 'WhatsApp CRM Inbox',
        subtitle: 'Live customer conversations, 2-way messaging, media notes & smart replies',
        category: 'page',
        route: '/inbox',
      },
      {
        id: 'page-campaigns',
        title: 'Campaigns & Broadcasts',
        subtitle: 'Multi-line automated voice outreach, progress tracking & conversion analytics',
        category: 'page',
        route: '/campaigns',
      },
      {
        id: 'page-templates',
        title: 'WhatsApp Templates Directory',
        subtitle: 'Meta verified broadcast templates, rich media cards, CTA interactive buttons',
        category: 'page',
        route: '/templates',
      },
      {
        id: 'page-contacts',
        title: 'Contacts & Audience CRM',
        subtitle: 'Lead management, phone verification, intent score tracking & CSV ingestion',
        category: 'page',
        route: '/contacts',
      },
      {
        id: 'page-crm',
        title: 'CRM Pipeline & Deals',
        subtitle: 'Kanban deal stages, weighted forecasting, owner assignments & activity timelines',
        category: 'page',
        route: '/crm',
      },
      {
        id: 'page-notifications',
        title: 'Notifications Center',
        subtitle: 'Inbound leads, delivery alerts, Meta approvals & activity feed',
        category: 'page',
        route: '/notifications',
      },
      {
        id: 'page-ai-studio',
        title: 'AI Studio & Voice Engine',
        subtitle: 'Synthesize custom closing voices, tone calibration & prompt engineering',
        category: 'page',
        route: '/ai-studio',
      },
      {
        id: 'page-analytics',
        title: 'Analytics & Reports',
        subtitle: 'Revenue attribution, performance trends, funnels, send-time heatmaps & AI insights',
        category: 'page',
        route: '/analytics',
      }
    )

    // 2. Quick Actions
    items.push(
      {
        id: 'action-new-campaign',
        title: 'Create New Campaign',
        subtitle: 'Launch a targeted WhatsApp broadcast or automated AI voice call sprint',
        category: 'action',
        action: () => {
          onClose()
          if (onNewCampaign) {
            onNewCampaign()
          } else {
            navigate('/campaigns')
          }
        },
      },
      {
        id: 'action-add-contact',
        title: 'Add New Contact',
        subtitle: 'Manually add a qualified enterprise buyer with phone and CRM stage',
        category: 'action',
        route: '/contacts',
      },
      {
        id: 'action-create-template',
        title: 'Create WhatsApp Template',
        subtitle: 'Submit a new interactive broadcast message for Meta verification',
        category: 'action',
        route: '/templates',
      }
    )

    // 3. Campaigns Data
    CAMPAIGNS.forEach((c) => {
      items.push({
        id: `campaign-${c.id}`,
        title: c.name,
        subtitle: `${c.channel} · ${c.contacts.toLocaleString()} contacts · ${c.connectRate} connect rate`,
        category: 'campaign',
        route: '/campaigns',
        meta: c.status,
      })
    })

    // 4. Contacts Data
    CONTACTS.forEach((ct) => {
      items.push({
        id: `contact-${ct.id}`,
        title: ct.name,
        subtitle: `${ct.role} at ${ct.company} · ${ct.phone} · Score: ${ct.score}/100`,
        category: 'contact',
        route: '/contacts',
        meta: ct.dealValue,
      })
    })

    // 5. Templates Data
    const seedTemplates = getSeedTemplates()
    seedTemplates.forEach((t) => {
      items.push({
        id: `template-${t.id}`,
        title: t.name,
        subtitle: `${t.category} · ${t.language.toUpperCase()} · Status: ${t.status}`,
        category: 'template',
        route: '/templates',
        meta: t.status,
      })
    })

    return items
  }, [onClose, onNewCampaign, navigate])

  // Filtered Results
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase()

    return allItems.filter((item) => {
      // Category Tab Filter
      if (selectedFilter !== 'all' && item.category !== selectedFilter) {
        return false
      }

      // Query Filter
      if (!q) {
        // When query is empty, show default recommended items
        return item.category === 'page' || item.category === 'action' || item.id.includes('q4') || item.id.includes('c-1')
      }

      const matchTitle = item.title.toLowerCase().includes(q)
      const matchSubtitle = item.subtitle.toLowerCase().includes(q)
      const matchMeta = item.meta?.toLowerCase().includes(q)
      const matchCategory = item.category.toLowerCase().includes(q)

      return matchTitle || matchSubtitle || matchMeta || matchCategory
    })
  }, [allItems, query, selectedFilter])

  // Reset activeIndex when results change
  useEffect(() => {
    setActiveIndex(0)
  }, [filteredResults])

  // Select and navigate to an item
  const handleSelectItem = (item: SearchResultItem) => {
    onClose()
    if (item.action) {
      item.action()
    } else if (item.route) {
      navigate(item.route)
      if (onNotice) {
        onNotice(`Navigated to ${item.title}`)
      }
    }
  }

  // Keyboard Navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredResults.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredResults[activeIndex]) {
        handleSelectItem(filteredResults[activeIndex])
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  if (!isOpen) return null

  const getCategoryBadge = (category: SearchResultItem['category']) => {
    switch (category) {
      case 'campaign':
        return <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">Campaign</span>
      case 'contact':
        return <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Contact</span>
      case 'template':
        return <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Template</span>
      case 'page':
        return <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">Page</span>
      case 'action':
        return <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">Action</span>
      default:
        return null
    }
  }

  const getItemIcon = (item: SearchResultItem) => {
    if (item.id === 'page-inbox') {
      return (
        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <ChatIcon className="w-4 h-4" />
        </div>
      )
    }
    if (item.id === 'page-notifications') {
      return (
        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <BellIcon className="w-4 h-4" />
        </div>
      )
    }
    if (item.id === 'page-ai-studio') {
      return (
        <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
          <SparkIcon className="w-4 h-4" />
        </div>
      )
    }
    if (item.id === 'page-analytics') {
      return (
        <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
          <AnalyticsIcon className="w-4 h-4" />
        </div>
      )
    }
    if (item.category === 'template') {
      return (
        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <TemplateIcon className="w-4 h-4" />
        </div>
      )
    }

    switch (item.category) {
      case 'campaign':
        return (
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <MegaphoneIcon className="w-4 h-4" />
          </div>
        )
      case 'contact':
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ContactsIcon className="w-4 h-4" />
          </div>
        )
      case 'page':
        return (
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <DashboardIcon className="w-4 h-4" />
          </div>
        )
      case 'action':
        return (
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <PlusIcon className="w-4 h-4" />
          </div>
        )
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
            <SearchIcon className="w-4 h-4" />
          </div>
        )
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[82vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Header Input */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-200 gap-3">
          <SearchIcon className="w-5 h-5 text-emerald-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search campaigns, contacts, templates, pages, or actions..."
            className="w-full text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex px-2 py-0.5 text-xs font-mono font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-50/80 border-b border-slate-200 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('campaign')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
              selectedFilter === 'campaign'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Campaigns
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('contact')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
              selectedFilter === 'contact'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Contacts
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('template')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
              selectedFilter === 'template'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Templates
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('page')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
              selectedFilter === 'page'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Pages
          </button>
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100">
          {filteredResults.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <SearchIcon className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-800">No results found</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No campaigns, contacts, templates, or pages matched &quot;{query}&quot;. Try searching for &quot;Q4&quot;, &quot;Aarav&quot;, or &quot;Diwali&quot;.
              </p>
            </div>
          ) : (
            <div>
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {query ? `Results (${filteredResults.length})` : 'Suggestions & Quick Jump'}
              </div>
              <div className="space-y-1 mt-1">
                {filteredResults.map((item, index) => {
                  const isActive = index === activeIndex

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`flex items-center justify-between p-3 rounded-xl transition cursor-pointer ${
                        isActive ? 'bg-emerald-50/80 border border-emerald-200' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-3">
                        {getItemIcon(item)}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h5
                              className={`text-sm truncate ${
                                isActive ? 'font-bold text-emerald-950' : 'font-semibold text-slate-800'
                              }`}
                            >
                              {item.title}
                            </h5>
                          </div>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {getCategoryBadge(item.category)}
                        {item.meta && (
                          <span className="hidden sm:inline-block text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            {item.meta}
                          </span>
                        )}
                        <ArrowUpRightIcon className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-600">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-600">
                ↓
              </kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-600">
                ↵
              </kbd>
              <span>to select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-600">
                ESC
              </kbd>
              <span>to close</span>
            </span>
          </div>
          <span className="text-emerald-700 font-medium hidden sm:inline">
            Global Search
          </span>
        </div>
      </div>
    </div>
  )
}
