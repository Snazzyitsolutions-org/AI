import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../components/dashboard/DashboardLayout'
import { Toast } from '../components/dashboard/Toast'
import { usePageTitle } from '../lib/usePageTitle'
import {
  BellIcon,
  CheckCircleIcon,
  CloseIcon,
  WhatsAppIcon,
  MegaphoneIcon,
  TemplateIcon,
  SearchIcon,
  TrashIcon,
} from '../components/dashboard/DashboardIcons'
import { SparkIcon } from '../components/icons'

export interface AppNotification {
  id: string
  title: string
  description: string
  timestamp: string
  dateGroup: 'today' | 'yesterday' | 'earlier'
  category: 'lead' | 'campaign' | 'template' | 'whatsapp' | 'system'
  read: boolean
  actionLabel?: string
  actionRoute?: string
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Aarav Sharma requested Demo Walkthrough',
    description: 'Hot lead (94 intent score) selected Tomorrow at 3:00 PM for 20-seat SDR pilot trial.',
    timestamp: '4 mins ago',
    dateGroup: 'today',
    category: 'lead',
    read: false,
    actionLabel: 'Open Chat',
    actionRoute: '/inbox',
  },
  {
    id: 'notif-2',
    title: 'Q4 Reactivation & Renewal broadcast completed',
    description: '1,220 of 1,686 automated personalized WhatsApp messages delivered. Connect rate: 72.4%.',
    timestamp: '24 mins ago',
    dateGroup: 'today',
    category: 'campaign',
    read: false,
    actionLabel: 'View Campaign',
    actionRoute: '/campaigns',
  },
  {
    id: 'notif-3',
    title: 'Meta approved "Diwali Flash Sale VIP"',
    description: 'WhatsApp Marketing template verified and active for automated bulk dispatch.',
    timestamp: '1 hour ago',
    dateGroup: 'today',
    category: 'template',
    read: false,
    actionLabel: 'View Template',
    actionRoute: '/templates',
  },
  {
    id: 'notif-4',
    title: 'Voice note received from Vikram Mehta',
    description: 'Received a 0:24 voice note regarding BFSI enterprise bank data encryption and compliance.',
    timestamp: '3 hours ago',
    dateGroup: 'today',
    category: 'whatsapp',
    read: true,
    actionLabel: 'Listen in Inbox',
    actionRoute: '/inbox',
  },
  {
    id: 'notif-5',
    title: 'Meta Cloud API Senders Synced',
    description: '32 of 32 WhatsApp senders operational. Sub-42ms webhook response latency confirmed.',
    timestamp: '5 hours ago',
    dateGroup: 'today',
    category: 'system',
    read: true,
  },
  {
    id: 'notif-6',
    title: 'New qualified lead: Priya Patel ($75,000)',
    description: 'Automatically qualified via incoming WhatsApp inquiry and added to CRM pipeline.',
    timestamp: 'Yesterday at 6:45 PM',
    dateGroup: 'yesterday',
    category: 'lead',
    read: true,
    actionLabel: 'View Contact',
    actionRoute: '/contacts',
  },
  {
    id: 'notif-7',
    title: 'AI Studio voice engine updated',
    description: 'Audio speech generation latency reduced with enhanced natural cadence and emotional tone.',
    timestamp: 'Yesterday at 3:10 PM',
    dateGroup: 'yesterday',
    category: 'system',
    read: true,
  },
  {
    id: 'notif-8',
    title: 'Whitefield Property Launch milestone',
    description: '52 VIP customer site visits booked via automated WhatsApp interactive buttons.',
    timestamp: '3 days ago',
    dateGroup: 'earlier',
    category: 'campaign',
    read: true,
    actionLabel: 'View Campaign',
    actionRoute: '/campaigns',
  },
  {
    id: 'notif-9',
    title: 'Automated database backup completed',
    description: 'Snapshot successfully created for all contact records and conversation histories.',
    timestamp: '4 days ago',
    dateGroup: 'earlier',
    category: 'system',
    read: true,
  },
]

type FilterTab = 'all' | 'unread' | 'lead' | 'campaign' | 'template' | 'system'

export function NotificationsPage() {
  usePageTitle('Notifications · CallWave')
  const navigate = useNavigate()

  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [globalSearch, setGlobalSearch] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => setToastMessage(msg)

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length
  }, [notifications])

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // Tab filter
      if (activeTab === 'unread' && item.read) return false
      if (activeTab !== 'all' && activeTab !== 'unread' && item.category !== activeTab) return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesTitle = item.title.toLowerCase().includes(q)
        const matchesDesc = item.description.toLowerCase().includes(q)
        if (!matchesTitle && !matchesDesc) return false
      }

      return true
    })
  }, [notifications, activeTab, searchQuery])

  // Group filtered notifications by date
  const groupedNotifications = useMemo(() => {
    const today = filteredNotifications.filter((n) => n.dateGroup === 'today')
    const yesterday = filteredNotifications.filter((n) => n.dateGroup === 'yesterday')
    const earlier = filteredNotifications.filter((n) => n.dateGroup === 'earlier')

    return [
      { label: 'Today', items: today },
      { label: 'Yesterday', items: yesterday },
      { label: 'Earlier', items: earlier },
    ].filter((group) => group.items.length > 0)
  }, [filteredNotifications])

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    showToast('All notifications marked as read')
  }

  const handleToggleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const nextRead = !n.read
          showToast(nextRead ? 'Marked as read' : 'Marked as unread')
          return { ...n, read: nextRead }
        }
        return n
      })
    )
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    showToast('Notification removed')
  }

  const handleClearAll = () => {
    if (notifications.length === 0) return
    setNotifications([])
    showToast('All notifications cleared')
  }

  const getCategoryIcon = (category: AppNotification['category']) => {
    switch (category) {
      case 'lead':
        return (
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <WhatsAppIcon className="w-5 h-5" />
          </div>
        )
      case 'campaign':
        return (
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <MegaphoneIcon className="w-5 h-5" />
          </div>
        )
      case 'template':
        return (
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <TemplateIcon className="w-5 h-5" />
          </div>
        )
      case 'whatsapp':
        return (
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <WhatsAppIcon className="w-5 h-5" />
          </div>
        )
      case 'system':
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <SparkIcon className="w-5 h-5" />
          </div>
        )
    }
  }

  return (
    <DashboardLayout
      search={globalSearch}
      onSearchChange={setGlobalSearch}
      onNotice={showToast}
      onNewCampaign={() => navigate('/campaigns')}
      activeNav="notifications"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications</h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Stay updated on leads, campaigns, templates, and messages.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
              >
                <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                Mark all as read
              </button>
            )}

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-6 pb-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shrink-0 ${
                activeTab === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              All ({notifications.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('unread')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shrink-0 ${
                activeTab === 'unread'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Unread ({unreadCount})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('lead')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shrink-0 ${
                activeTab === 'lead'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Leads
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('campaign')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shrink-0 ${
                activeTab === 'campaign'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Campaigns
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('template')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shrink-0 ${
                activeTab === 'template'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Templates
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('system')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shrink-0 ${
                activeTab === 'system'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              System
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-60 shrink-0">
            <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <CloseIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Notifications List Card */}
        {groupedNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center mt-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <BellIcon className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">No notifications</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No notifications found matching "${searchQuery}".`
                : activeTab === 'unread'
                ? "You're all caught up! No unread notifications."
                : 'There are no notifications in this category.'}
            </p>
            {(searchQuery || activeTab !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('all')
                  setSearchQuery('')
                }}
                className="mt-4 text-xs font-medium text-emerald-600 hover:text-emerald-700"
              >
                Reset all filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6 mt-2">
            {groupedNotifications.map((group) => (
              <div key={group.label}>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
                  {group.label}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (item.actionRoute) {
                          navigate(item.actionRoute)
                        } else if (!item.read) {
                          setNotifications((prev) =>
                            prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
                          )
                        }
                      }}
                      className={`group p-4 flex items-start gap-3.5 transition-colors cursor-pointer ${
                        item.read ? 'hover:bg-slate-50/80' : 'bg-emerald-50/20 hover:bg-emerald-50/40'
                      }`}
                    >
                      {/* Left Category Icon */}
                      {getCategoryIcon(item.category)}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-sm tracking-tight ${
                              item.read ? 'font-medium text-slate-800' : 'font-semibold text-slate-900'
                            }`}
                          >
                            {item.title}
                          </h4>
                          {!item.read && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          )}
                        </div>

                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {item.description}
                        </p>

                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                          <span>{item.timestamp}</span>

                          {item.actionLabel && item.actionRoute && (
                            <>
                              <span>·</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  navigate(item.actionRoute!)
                                }}
                                className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                              >
                                {item.actionLabel} →
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right Quick Actions (visible on hover) */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          type="button"
                          title={item.read ? 'Mark as unread' : 'Mark as read'}
                          onClick={(e) => handleToggleRead(item.id, e)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                        >
                          <CheckCircleIcon className={`w-4 h-4 ${item.read ? 'text-slate-400' : 'text-emerald-600'}`} />
                        </button>

                        <button
                          type="button"
                          title="Dismiss"
                          onClick={(e) => handleDelete(item.id, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                        >
                          <CloseIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </DashboardLayout>
  )
}
