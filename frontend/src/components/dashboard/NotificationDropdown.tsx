import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BellIcon,
  CheckCircleIcon,
  CloseIcon,
  WhatsAppIcon,
  MegaphoneIcon,
  PipelineIcon,
} from './DashboardIcons'
import { SparkIcon } from '../icons'

export interface NotificationItem {
  id: string
  title: string
  description: string
  time: string
  type: 'lead' | 'campaign' | 'template' | 'whatsapp' | 'system'
  read: boolean
  actionLabel?: string
  actionRoute?: string
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Aarav Sharma requested Demo walkthrough',
    description: 'Hot lead (94 intent score) selected Tomorrow 3:00 PM for 20 SDR agent seats.',
    time: '4m ago',
    type: 'lead',
    read: false,
    actionLabel: 'Open Chat',
    actionRoute: '/inbox',
  },
  {
    id: 'notif-2',
    title: 'Q4 Reactivation broadcast batch completed',
    description: '1,220 messages delivered to inactive enterprise accounts. Connect rate 72.4%.',
    time: '24m ago',
    type: 'campaign',
    read: false,
    actionLabel: 'View Campaign',
    actionRoute: '/campaigns',
  },
  {
    id: 'notif-3',
    title: 'Meta approved "Flash Sale VIP 2026"',
    description: 'WhatsApp Marketing template verified and active for automated bulk dispatch.',
    time: '1h ago',
    type: 'template',
    read: false,
    actionLabel: 'View Template',
    actionRoute: '/templates',
  },
  {
    id: 'notif-4',
    title: 'Audio compliance note from Vikram Mehta',
    description: 'Sent 0:24 voice note regarding BFSI enterprise encryption and UK GDPR.',
    time: '3h ago',
    type: 'whatsapp',
    read: true,
    actionLabel: 'Listen in Inbox',
    actionRoute: '/inbox',
  },
  {
    id: 'notif-5',
    title: 'Meta Cloud API Tier-4 senders healthy',
    description: 'All 32 WhatsApp senders operational with sub-42ms webhook response latency.',
    time: '5h ago',
    type: 'system',
    read: true,
  },
]

interface NotificationDropdownProps {
  onNotice?: (message: string) => void
}

export function NotificationDropdown({ onNotice }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS)
  const [filter, setFilter] = useState<'all' | 'unread' | 'lead' | 'campaign'>('all')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const unreadCount = notifications.filter((n) => !n.read).length

  // Close on outside click or Escape
  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    onNotice?.('All notifications marked as read')
  }

  const handleDeleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const handleNotificationClick = (notif: NotificationItem) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)),
    )
    setIsOpen(false)
    if (notif.actionRoute) {
      navigate(notif.actionRoute)
    }
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read
    if (filter === 'lead') return n.type === 'lead' || n.type === 'whatsapp'
    if (filter === 'campaign') return n.type === 'campaign' || n.type === 'template'
    return true
  })

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Navbar Notification Bell Trigger */}
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative flex items-center justify-center w-9 h-9 rounded-full transition-all cursor-pointer ${
          isOpen
            ? 'bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/80'
        }`}
        title="Notifications & Activity Feed"
      >
        <BellIcon className="w-5 h-5" />

        {/* Dynamic Unread Pill Badge or Pulse Indicator */}
        {unreadCount > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white shadow-2xs animate-in zoom-in">
            {unreadCount}
          </span>
        ) : (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-slate-300 ring-2 ring-white" />
        )}
      </button>

      {/* Modern Tailwind Notification Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2.5 w-[380px] sm:w-[420px] max-w-[calc(100vw-24px)] rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl z-50 text-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-top-right"
          role="dialog"
          aria-label="Notifications center"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 pb-3 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0c3529] text-[#c8f169] flex items-center justify-center text-sm font-bold shadow-xs">
                  <BellIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    Notifications &amp; Activity
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Realtime Meta WhatsApp &amp; CRM Telemetry
                  </p>
                </div>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-0.5">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  filter === 'all'
                    ? 'bg-[#0c3529] text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  filter === 'unread'
                    ? 'bg-[#0c3529] text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter('lead')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  filter === 'lead'
                    ? 'bg-[#0c3529] text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600'
                }`}
              >
                Leads
              </button>
              <button
                type="button"
                onClick={() => setFilter('campaign')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  filter === 'campaign'
                    ? 'bg-[#0c3529] text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600'
                }`}
              >
                Campaigns
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100/80">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircleIcon className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">You are all caught up!</h4>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  No notifications match your current filter. Realtime events will populate automatically.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                // Icon & Color styling per type
                let iconEl = <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
                let iconBg = 'bg-emerald-50 border-emerald-100'

                if (notif.type === 'lead') {
                  iconEl = <SparkIcon className="w-4 h-4 text-emerald-600" />
                  iconBg = 'bg-emerald-50 border-emerald-100'
                } else if (notif.type === 'campaign') {
                  iconEl = <MegaphoneIcon className="w-4 h-4 text-teal-600" />
                  iconBg = 'bg-teal-50 border-teal-100'
                } else if (notif.type === 'template') {
                  iconEl = <CheckCircleIcon className="w-4 h-4 text-lime-600" />
                  iconBg = 'bg-lime-50 border-lime-200'
                } else if (notif.type === 'system') {
                  iconEl = <PipelineIcon className="w-4 h-4 text-blue-600" />
                  iconBg = 'bg-blue-50 border-blue-100'
                }

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 hover:bg-slate-50/80 transition-all cursor-pointer relative group flex items-start gap-3.5 ${
                      !notif.read ? 'bg-emerald-50/30' : ''
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs mt-0.5 ${iconBg}`}
                    >
                      {iconEl}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-1.5">
                        <h4
                          className={`text-xs tracking-tight truncate ${
                            !notif.read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'
                          }`}
                        >
                          {notif.title}
                        </h4>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 mt-0.5">
                        {notif.description}
                      </p>

                      <div className="mt-2 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-medium">{notif.time}</span>

                        {notif.actionLabel && (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 group-hover:translate-x-0.5 transition-all">
                            {notif.actionLabel} →
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Dismiss action */}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteNotification(notif.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md p-1 transition-all cursor-pointer absolute top-3 right-2.5"
                      title="Dismiss notification"
                    >
                      <CloseIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 px-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Lakebase Postgres Sync
            </span>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                navigate('/notifications')
              }}
              className="font-bold text-slate-700 hover:text-[#0c3529] transition-colors cursor-pointer"
            >
              View all notifications →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
