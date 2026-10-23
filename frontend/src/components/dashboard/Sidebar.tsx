import { useEffect, useRef, useState } from 'react'
import type { ComponentType } from 'react'
import type { User } from '../../types'
import { Avatar } from '../Avatar'
import { BrandMark } from '../BrandMark'
import { LogOutIcon, SparkIcon } from '../icons'
import {
  AnalyticsIcon,
  ArrowUpRightIcon,
  BellIcon,
  ChatIcon,
  ChevronDownIcon,
  CloseIcon,
  ContactsIcon,
  DashboardIcon,
  HeadsetIcon,
  MegaphoneIcon,
  PanelLeftIcon,
  PipelineIcon,
  PlusIcon,
  SettingsIcon,
  SlidersIcon,
  TemplateIcon,
  UsersIcon,
} from './DashboardIcons'

type SidebarProps = {
  user: User | null
  open: boolean
  collapsed: boolean
  signingOut: boolean
  activeNav?: string
  onClose: () => void
  onToggleCollapse: () => void
  onNavigate: (id: string, label: string) => void
  onNewCampaign: () => void
  onSignOut: () => void
  onNotice: (message: string) => void
}

type NavItem = {
  id: string
  label: string
  icon: ComponentType<{ className?: string }>
  badge?: string
  accent?: boolean
}

const PRIMARY_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
  { id: 'inbox', label: 'WhatsApp Inbox', icon: ChatIcon, badge: '4', accent: true },
  { id: 'campaigns', label: 'Campaigns', icon: MegaphoneIcon, badge: '8' },
  { id: 'templates', label: 'Templates', icon: TemplateIcon, badge: '20', accent: true },
  { id: 'contacts', label: 'Contacts', icon: ContactsIcon, badge: '2.4k' },
  { id: 'notifications', label: 'Notifications', icon: BellIcon, badge: '3' },
  { id: 'ai-studio', label: 'AI Studio', icon: SparkIcon, badge: 'New', accent: true },
  { id: 'analytics', label: 'Analytics', icon: AnalyticsIcon, badge: 'Live', accent: true },
]

const MANAGE_NAV: NavItem[] = [
  { id: 'crm', label: 'CRM pipeline', icon: PipelineIcon, badge: '15' },
  { id: 'numbers', label: 'WhatsApp Senders', icon: HeadsetIcon, badge: '32' },
  { id: 'automations', label: 'Automations', icon: SlidersIcon },
  { id: 'team', label: 'Team', icon: UsersIcon },
]

const MOBILE_QUERY = '(max-width: 1023px)'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(MOBILE_QUERY).matches
  })

  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY)
    const update = () => setIsMobile(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return isMobile
}

function NavLink({
  item,
  active,
  collapsed,
  onSelect,
}: {
  item: NavItem
  active: boolean
  collapsed: boolean
  onSelect: (item: NavItem) => void
}) {
  const Icon = item.icon

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? item.label : undefined}
      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 relative group select-none ${
        active
          ? 'bg-gradient-to-r from-emerald-100/80 via-emerald-50/50 to-white/30 text-emerald-950 font-bold shadow-xs border border-emerald-200/50'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
      } ${collapsed ? 'justify-center px-0 h-9' : 'h-9'}`}
    >
      {/* Active Left Indicator Pill */}
      {active && !collapsed && (
        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-gradient-to-b from-emerald-500 to-teal-600 shadow-sm shadow-emerald-500/50" />
      )}

      {/* Icon Tile */}
      <span
        className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
          active
            ? 'bg-white text-emerald-600 shadow-2xs border border-emerald-200/70'
            : 'text-slate-500 group-hover:text-emerald-700 group-hover:bg-white group-hover:shadow-2xs group-hover:border group-hover:border-slate-200/60'
        }`}
      >
        <Icon className="w-4 h-4" />
      </span>

      {/* Label */}
      {!collapsed && (
        <span className="truncate flex-1 text-left tracking-tight">{item.label}</span>
      )}

      {/* Badge */}
      {!collapsed && item.badge && (
        <span
          className={`ml-auto px-1.5 py-0.2 rounded-full text-[10px] font-extrabold tracking-tight ${
            item.accent
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-2xs'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
          }`}
        >
          {item.badge}
        </span>
      )}

      {/* Hover Tooltip when collapsed */}
      {collapsed && (
        <span className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
          {item.label}
          {item.badge && ` (${item.badge})`}
        </span>
      )}
    </button>
  )
}

export function Sidebar({
  user,
  open,
  collapsed,
  signingOut,
  activeNav = 'dashboard',
  onClose,
  onToggleCollapse,
  onNavigate,
  onNewCampaign,
  onSignOut,
  onNotice,
}: SidebarProps) {
  const isMobile = useIsMobile()
  const [accountOpen, setAccountOpen] = useState(false)
  const sidebarRef = useRef<HTMLElement>(null)
  const accountRef = useRef<HTMLDivElement>(null)
  const accountButtonRef = useRef<HTMLButtonElement>(null)

  const avatarName = user?.name || 'CallWave user'

  useEffect(() => {
    if (!isMobile) onClose()
  }, [isMobile, onClose])

  useEffect(() => {
    if (!accountOpen) return

    function handlePointerDown(event: PointerEvent) {
      if (!accountRef.current?.contains(event.target as Node)) {
        setAccountOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setAccountOpen(false)
        accountButtonRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [accountOpen])

  function handleNavigate(item: NavItem) {
    onNavigate(item.id, item.label)
    if (isMobile) onClose()
  }

  return (
    <aside
      ref={sidebarRef}
      className={`fixed top-0 left-0 bottom-0 h-screen z-30 bg-white/95 backdrop-blur-xl border-r border-slate-200/70 flex flex-col transition-all duration-300 ease-in-out shrink-0 select-none ${
        collapsed ? 'w-20' : 'w-64'
      } ${
        isMobile
          ? `w-72 shadow-2xl z-50 ${
              open ? 'translate-x-0' : '-translate-x-full'
            }`
          : 'translate-x-0'
      }`}
    >
      {/* 1. Header: Brand + Tagline + Collapse Toggle */}
      <div className="pt-3.5 pb-2.5 px-3.5 flex items-center justify-between border-b border-slate-100/80 shrink-0">
        <div className="flex flex-col">
          <BrandMark compact={collapsed && !isMobile} />
          {!collapsed && (
            <span className="text-[8.5px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5 ml-11">
              WhatsApp Marketing &amp; CRM
            </span>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <PanelLeftIcon className="w-4 h-4" />
        </button>

        {/* Mobile Close Button */}
        {isMobile && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="flex lg:hidden items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. Primary CTA: New Campaign Button (Apple/Stripe Glossy Gradient) */}
      <div className="p-2.5 shrink-0">
        <button
          type="button"
          onClick={onNewCampaign}
          title={collapsed ? 'New campaign' : undefined}
          className={`w-full h-9 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-500/25 active:scale-[0.98] transition-all duration-200 border border-emerald-400/30 ${
            collapsed ? 'justify-center px-0' : 'px-3'
          }`}
        >
          <span className="w-5.5 h-5.5 rounded-lg bg-white/20 flex items-center justify-center shrink-0 border border-white/20">
            <PlusIcon className="w-3.5 h-3.5 text-white" />
          </span>
          {!collapsed && <span className="truncate tracking-tight">New campaign</span>}
        </button>
      </div>

      {/* 3. Navigation Links List */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-1 space-y-2.5 scrollbar-none">
        {/* Workspace Nav Section */}
        <div>
          {!collapsed && (
            <p className="px-2.5 pb-1 text-[9.5px] font-extrabold text-slate-400 uppercase tracking-widest">
              Workspace
            </p>
          )}
          <div className="space-y-0.5">
            {PRIMARY_NAV.map((item) => (
              <NavLink
                key={item.id}
                item={item}
                active={item.id === activeNav || (item.id === 'dashboard' && activeNav === 'home')}
                collapsed={collapsed && !isMobile}
                onSelect={handleNavigate}
              />
            ))}
          </div>
        </div>

        {/* Manage Nav Section */}
        <div>
          {!collapsed && (
            <p className="px-2.5 pb-1 text-[9.5px] font-extrabold text-slate-400 uppercase tracking-widest">
              Manage
            </p>
          )}
          <div className="space-y-0.5">
            {MANAGE_NAV.map((item) => (
              <NavLink
                key={item.id}
                item={item}
                active={item.id === activeNav}
                collapsed={collapsed && !isMobile}
                onSelect={handleNavigate}
              />
            ))}
          </div>

          {/* Meta Cloud Fleet Status Card (Only when expanded) */}
          {!collapsed && (
            <div className="mx-1 mt-3 p-2 rounded-xl bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 border border-emerald-200/60 shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-[10.5px] font-bold text-slate-800">32 Senders Online</span>
                </div>
                <span className="text-[9px] font-extrabold text-emerald-800 bg-emerald-100/90 px-1.5 py-0.2 rounded-full">v21.0</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span>Meta Cloud API</span>
                <span className="text-emerald-700 font-bold">42ms latency</span>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* 4. Bottom Footer: AI Credits Widget + User Profile */}
      <div className="p-2 border-t border-slate-100 shrink-0 space-y-1.5">
        {/* AI Credits Card (Apple Widget Style - Compact) */}
        {!collapsed ? (
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-emerald-100/30 border border-emerald-200/70 shadow-xs">
            <div className="flex items-center gap-2">
              {/* Conic Ring Gauge */}
              <div
                className="relative flex items-center justify-center w-7.5 h-7.5 rounded-full shrink-0 shadow-xs"
                style={{
                  background: 'conic-gradient(#10b981 0% 68%, #e2e8f0 68% 100%)',
                }}
              >
                <div className="absolute inset-0.5 rounded-full bg-white flex items-center justify-center">
                  <span className="text-[8px] font-extrabold text-emerald-800">68%</span>
                </div>
              </div>

              <div className="overflow-hidden flex-1">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-bold text-slate-900 tracking-tight leading-none">AI Credits</strong>
                  <button
                    type="button"
                    onClick={() => onNotice('Plan upgrades will be available soon.')}
                    className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-0.5"
                  >
                    <span>Upgrade</span>
                    <ArrowUpRightIcon className="w-2.5 h-2.5" />
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 truncate font-medium mt-0.5">3,400 of 5,000 used</p>
              </div>
            </div>

            {/* Linear Progress Bar */}
            <div className="w-full bg-white/90 h-1 rounded-full overflow-hidden mt-1.5 border border-emerald-100">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full w-[68%] rounded-full" />
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => onNotice('Plan upgrades will be available soon.')}
              title="AI Credits: 68% used"
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-center text-xs font-bold text-emerald-700 shadow-2xs"
            >
              68%
            </button>
          </div>
        )}

        {/* User Account Profile */}
        <div className="relative" ref={accountRef}>
          {accountOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-60 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-2.5 p-2.5 border-b border-slate-100 mb-1">
                <Avatar name={avatarName} src={user?.avatarUrl} size="small" />
                <div className="overflow-hidden">
                  <strong className="block font-bold text-slate-800 truncate">{avatarName}</strong>
                  <span className="block text-[11px] text-slate-500 truncate">{user?.email || 'admin@callwave.io'}</span>
                </div>
              </div>

              <button
                type="button"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                onClick={() => {
                  setAccountOpen(false)
                  onNotice('Account settings are coming next.')
                }}
              >
                <SettingsIcon className="w-4 h-4 text-slate-500" />
                Account settings
              </button>

              <button
                type="button"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                onClick={() => {
                  setAccountOpen(false)
                  onNotice('Help center is coming next.')
                }}
              >
                <HeadsetIcon className="w-4 h-4 text-slate-500" />
                Help &amp; support
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                type="button"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-medium transition-colors"
                onClick={onSignOut}
                disabled={signingOut}
              >
                <LogOutIcon className="w-4 h-4 text-rose-500" />
                {signingOut ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          )}

          <button
            ref={accountButtonRef}
            type="button"
            onClick={() => setAccountOpen((current) => !current)}
            className={`w-full flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100/70 border border-transparent hover:border-slate-200/60 transition-colors ${
              collapsed ? 'justify-center p-1' : ''
            }`}
          >
            <div className="relative">
              <Avatar name={avatarName} src={user?.avatarUrl} size="small" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white absolute -bottom-0.5 -right-0.5" />
            </div>

            {!collapsed && (
              <div className="overflow-hidden flex-1 text-left">
                <strong className="block text-xs font-bold text-slate-800 truncate leading-tight">{avatarName}</strong>
                <span className="block text-[10px] text-slate-400 font-medium">Pro workspace</span>
              </div>
            )}

            {!collapsed && (
              <ChevronDownIcon
                className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${
                  accountOpen ? 'rotate-180' : ''
                }`}
              />
            )}
          </button>
        </div>
      </div>
    </aside>
  )
}
