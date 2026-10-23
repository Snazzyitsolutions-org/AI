import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { Avatar } from '../Avatar'
import { BrandMark } from '../BrandMark'
import { LogOutIcon } from '../icons'
import {
  ChevronDownIcon,
  HeadsetIcon,
  MenuIcon,
  SearchIcon,
  SettingsIcon,
} from './DashboardIcons'
import { Sidebar } from './Sidebar'
import { NotificationDropdown } from './NotificationDropdown'
import { GlobalSearchModal } from './GlobalSearchModal'

type DashboardLayoutProps = {
  children: ReactNode
  search: string
  activeNav?: string
  searchPlaceholder?: string
  onSearchChange: (value: string) => void
  onNotice: (message: string) => void
  onNewCampaign: () => void
}

const SIDEBAR_STORAGE_KEY = 'callwave.sidebar.collapsed'

export function DashboardLayout({
  children,
  search,
  activeNav,
  searchPlaceholder = 'Search campaigns, templates, numbers…',
  onSearchChange,
  onNotice,
  onNewCampaign,
}: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const closeSidebar = useCallback(() => setSidebarOpen(false), [])
  const toggleSidebarCollapsed = useCallback(
    () => setSidebarCollapsed((current) => !current),
    [],
  )

  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, sidebarCollapsed ? '1' : '0')
    } catch {
      // Storage fallback
    }
  }, [sidebarCollapsed])

  useEffect(() => {
    if (!userMenuOpen) return

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setUserMenuOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [userMenuOpen])

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      const target = event.target as HTMLElement
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable

      if (
        ((event.key === 'k' || event.key === 'K') && (event.metaKey || event.ctrlKey)) ||
        (event.key === '/' && !isTyping)
      ) {
        event.preventDefault()
        setGlobalSearchOpen(true)
      }

      if (event.key === 'Escape') {
        setSidebarOpen(false)
        setGlobalSearchOpen(false)
      }
    }

    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  useEffect(() => {
    if (!sidebarOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [sidebarOpen])

  const path = location.pathname.replace(/^\//, '')
  const currentNav = activeNav || path || 'dashboard'

  function handleNavigation(navId: string, label: string) {
    if (navId === 'dashboard' || navId === 'home') {
      navigate('/dashboard')
    } else if (navId === 'inbox') {
      navigate('/inbox')
    } else if (navId === 'campaigns') {
      navigate('/campaigns')
    } else if (navId === 'templates') {
      navigate('/templates')
    } else if (navId === 'contacts') {
      navigate('/contacts')
    } else if (navId === 'crm') {
      navigate('/crm')
    } else if (navId === 'notifications') {
      navigate('/notifications')
    } else if (navId === 'ai-studio') {
      navigate('/ai-studio')
    } else if (navId === 'analytics') {
      navigate('/analytics')
    } else if (navId === 'numbers') {
      navigate('/numbers')
    } else if (navId === 'automations') {
      navigate('/automations')
    } else {
      onNotice(`${label} is coming in the next build.`)
    }
  }

  async function handleSignOut() {
    setSigningOut(true)

    try {
      await logout()
      setUserMenuOpen(false)
    } catch {
      onNotice('Could not sign out right now. Please try again.')
      setSigningOut(false)
    }
  }

  const avatarName = user?.name || 'CallWave user'

  return (
    <div className="min-h-screen bg-[#fbfdfc] flex flex-row text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* 1. Sidebar - Fixed to viewport on desktop, drawer on mobile */}
      <Sidebar
        user={user}
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        signingOut={signingOut}
        activeNav={currentNav}
        onClose={closeSidebar}
        onToggleCollapse={toggleSidebarCollapsed}
        onNavigate={handleNavigation}
        onNewCampaign={onNewCampaign}
        onSignOut={handleSignOut}
        onNotice={onNotice}
      />

      {/* 2. Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close navigation"
          onClick={closeSidebar}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 lg:hidden cursor-default border-none outline-none animate-in fade-in duration-200"
        />
      )}

      {/* 3. Main Workspace Container - Offset by sidebar width on desktop */}
      <div
        className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        } ${
          currentNav === 'inbox' ? 'h-[100svh] max-h-[100svh] overflow-hidden' : ''
        }`}
      >
        {/* Apple/Stripe-level Glassmorphic Topbar Header */}
        <header className="sticky top-0 z-20 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-4 sm:px-6 flex items-center justify-between gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          {/* Mobile hamburger menu button */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
            aria-expanded={sidebarOpen}
            aria-controls="workspace-sidebar"
            className="flex lg:hidden items-center justify-center w-9 h-9 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <MenuIcon className="w-5 h-5" />
          </button>

          {/* Mobile BrandMark */}
          <div className="flex lg:hidden items-center">
            <BrandMark compact />
          </div>

          {/* Mobile Search Button */}
          <button
            type="button"
            onClick={() => setGlobalSearchOpen(true)}
            aria-label="Open global search"
            className="flex sm:hidden items-center justify-center w-9 h-9 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors ml-auto mr-1"
          >
            <SearchIcon className="w-4 h-4" />
          </button>

          {/* Floating Global Search Bar (Wider, Taller, Full Working Command Palette) */}
          <div
            onClick={() => setGlobalSearchOpen(true)}
            className="relative flex-1 max-w-xl lg:max-w-2xl hidden sm:flex items-center cursor-pointer group"
          >
            <SearchIcon className="absolute left-3.5 w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors pointer-events-none" />
            <input
              ref={searchRef}
              type="text"
              readOnly
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onClick={() => setGlobalSearchOpen(true)}
              onFocus={() => setGlobalSearchOpen(true)}
              placeholder={searchPlaceholder || 'Search campaigns, templates, contacts, numbers...'}
              aria-label={searchPlaceholder || 'Global search command palette'}
              className="w-full h-10 sm:h-11 pl-10 pr-20 text-xs sm:text-sm bg-slate-100/75 hover:bg-slate-100/95 focus:bg-white rounded-xl border border-slate-200/70 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-2xs cursor-pointer"
            />
            <div className="absolute right-3 flex items-center gap-1 pointer-events-none">
              <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200/90 text-[10px] font-mono font-medium text-slate-400 shadow-2xs">
                ⌘K
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200/90 text-[10px] font-mono font-medium text-slate-400 shadow-2xs">
                /
              </kbd>
            </div>
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            {/* Live WhatsApp Telemetry Pill */}
            <span className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50/80 border border-emerald-200/60 text-emerald-800 text-xs font-semibold shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>32 Senders Live</span>
            </span>

            {/* Notifications Center Dropdown */}
            <NotificationDropdown onNotice={onNotice} />

            {/* User Profile Pill */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((open) => !open)}
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2.5 p-1 sm:pl-1.5 sm:pr-3 py-1 rounded-full hover:bg-slate-100/80 transition-colors border border-transparent hover:border-slate-200/60"
              >
                <Avatar name={avatarName} src={user?.avatarUrl} size="small" />
                <span className="hidden md:block text-left text-xs">
                  <strong className="block font-bold text-slate-800 leading-tight">
                    {user?.name || 'CallWave user'}
                  </strong>
                  <span className="block text-[10px] text-slate-400 font-medium">
                    Pro Workspace
                  </span>
                </span>
                <ChevronDownIcon className="hidden sm:block w-3.5 h-3.5 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-2xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150"
                  role="menu"
                >
                  <div className="flex items-center gap-2.5 p-2.5 border-b border-slate-100 mb-1">
                    <Avatar name={avatarName} src={user?.avatarUrl} size="small" />
                    <div className="overflow-hidden">
                      <strong className="block font-bold text-slate-800 truncate">
                        {user?.name || 'CallWave user'}
                      </strong>
                      <span className="block text-[11px] text-slate-500 truncate">
                        {user?.email || 'admin@callwave.io'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                    role="menuitem"
                    onClick={() => {
                      setUserMenuOpen(false)
                      onNotice('Account settings are coming next.')
                    }}
                  >
                    <SettingsIcon className="w-4 h-4 text-slate-500" />
                    Account settings
                  </button>

                  <button
                    type="button"
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                    role="menuitem"
                    onClick={() => {
                      setUserMenuOpen(false)
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
                    role="menuitem"
                    onClick={handleSignOut}
                    disabled={signingOut}
                  >
                    <LogOutIcon className="w-4 h-4 text-rose-500" />
                    {signingOut ? 'Signing out…' : 'Sign out'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Body - Compact, tightly proportioned */}
        <main
          className={`flex-1 ${
            currentNav === 'inbox'
              ? 'p-0 m-0 w-full h-[calc(100svh-64px)] max-h-[calc(100svh-64px)] overflow-hidden flex flex-col'
              : 'p-3 sm:p-4 lg:p-5 overflow-y-auto'
          }`}
        >
          {children}
        </main>
      </div>

      {/* Global Command Palette Search Modal */}
      <GlobalSearchModal
        isOpen={globalSearchOpen}
        onClose={() => setGlobalSearchOpen(false)}
        onNewCampaign={onNewCampaign}
        onNotice={onNotice}
      />
    </div>
  )
}
