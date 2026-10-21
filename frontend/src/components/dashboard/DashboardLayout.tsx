import { useEffect, useRef, useState } from 'react'
import type { ComponentType, ReactNode } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { Avatar } from '../Avatar'
import { BrandMark } from '../BrandMark'
import { LogOutIcon, SparkIcon } from '../icons'
import {
  AnalyticsIcon,
  ArrowUpRightIcon,
  BellIcon,
  ChevronDownIcon,
  ContactsIcon,
  HeadsetIcon,
  HomeIcon,
  MegaphoneIcon,
  MenuIcon,
  PhoneOutlineIcon,
  PipelineIcon,
  SearchIcon,
  SettingsIcon,
} from './DashboardIcons'

type DashboardLayoutProps = {
  children: ReactNode
  search: string
  onSearchChange: (value: string) => void
  onNotice: (message: string) => void
}

type NavItem = {
  id: string
  label: string
  icon: ComponentType<{ className?: string }>
  badge?: string
}

const PRIMARY_NAV: NavItem[] = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'campaigns', label: 'Campaigns', icon: MegaphoneIcon, badge: '18' },
  { id: 'contacts', label: 'Contacts', icon: ContactsIcon },
  { id: 'ai-studio', label: 'AI Studio', icon: SparkIcon },
]

const WORKSPACE_NAV: NavItem[] = [
  { id: 'crm', label: 'CRM pipeline', icon: PipelineIcon, badge: '12' },
  { id: 'analytics', label: 'Analytics', icon: AnalyticsIcon },
  { id: 'calls', label: 'Call history', icon: PhoneOutlineIcon },
  { id: 'numbers', label: 'Phone numbers', icon: HeadsetIcon },
]

export function DashboardLayout({
  children,
  search,
  onSearchChange,
  onNotice,
}: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

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

      if (event.key === '/' && !isTyping) {
        event.preventDefault()
        searchRef.current?.focus()
      }

      if (event.key === 'Escape') {
        setSidebarOpen(false)
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

  function handleNavigation(item: NavItem) {
    setSidebarOpen(false)

    if (item.id !== 'home') {
      onNotice(`${item.label} is coming in the next build.`)
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

  const firstName = user?.name.split(/\s+/)[0] || 'there'
  const avatarName = user?.name || 'CallWave user'

  return (
    <div className={`dashboard-shell${sidebarOpen ? ' sidebar-open' : ''}`}>
      <aside className="dashboard-sidebar" aria-label="Workspace navigation">
        <div className="sidebar-brand">
          <BrandMark />
          <p className="sidebar-brand__tagline">AI calling &amp; CRM</p>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-section-label">Workspace</p>
          {PRIMARY_NAV.map((item) => {
            const Icon = item.icon
            const isActive = item.id === 'home'

            return (
              <button
                key={item.id}
                type="button"
                className={`sidebar-link${isActive ? ' is-active' : ''}`}
                onClick={() => handleNavigation(item)}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="sidebar-link__icon" />
                <span className="sidebar-link__label">{item.label}</span>
                {item.badge && <span className="sidebar-link__badge">{item.badge}</span>}
              </button>
            )
          })}

          <p className="sidebar-section-label sidebar-section-label--spaced">Manage</p>
          {WORKSPACE_NAV.map((item) => {
            const Icon = item.icon

            return (
              <button
                key={item.id}
                type="button"
                className="sidebar-link"
                onClick={() => handleNavigation(item)}
              >
                <Icon className="sidebar-link__icon" />
                <span className="sidebar-link__label">{item.label}</span>
                {item.badge && <span className="sidebar-link__badge">{item.badge}</span>}
              </button>
            )
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-usage">
            <div className="sidebar-usage__head">
              <span>
                <SparkIcon />
                AI credits
              </span>
              <strong>68%</strong>
            </div>
            <p>3,400 of 5,000 used</p>
            <div className="sidebar-usage__bar" aria-hidden="true">
              <span />
            </div>
            <button
              type="button"
              className="sidebar-upgrade"
              onClick={() => onNotice('Plan upgrades will be available soon.')}
            >
              Upgrade plan
              <ArrowUpRightIcon />
            </button>
          </div>

          <button
            type="button"
            className="sidebar-account"
            onClick={() => {
              setSidebarOpen(false)
              setUserMenuOpen(true)
            }}
          >
            <Avatar name={avatarName} src={user?.avatarUrl} />
            <span className="sidebar-account__copy">
              <strong>{firstName}</strong>
              <small>Pro workspace</small>
            </span>
            <SettingsIcon className="sidebar-account__settings" />
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="dashboard-content">
        <header className="dashboard-topbar">
          <button
            type="button"
            className="topbar-icon-button topbar-menu"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <MenuIcon />
          </button>

          <div className="topbar-mobile-brand">
            <BrandMark />
          </div>

          <label className="topbar-search">
            <SearchIcon className="topbar-search__icon" />
            <input
              ref={searchRef}
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search campaigns…"
              aria-label="Search campaigns"
            />
            <kbd>/</kbd>
          </label>

          <div className="topbar-actions">
            <span className="topbar-live">
              <span />
              Live
            </span>

            <button
              type="button"
              className="topbar-icon-button topbar-bell"
              aria-label="Notifications"
              onClick={() => onNotice('You are all caught up — no new notifications.')}
            >
              <BellIcon />
              <span className="topbar-bell__dot" />
            </button>

            <div className="topbar-account" ref={menuRef}>
              <button
                type="button"
                className="topbar-user"
                onClick={() => setUserMenuOpen((open) => !open)}
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
              >
                <Avatar name={avatarName} src={user?.avatarUrl} />
                <span className="topbar-user__copy">
                  <strong>{user?.name || 'CallWave user'}</strong>
                  <small>Workspace owner</small>
                </span>
                <ChevronDownIcon className="topbar-user__chevron" />
              </button>

              {userMenuOpen && (
                <div className="account-menu" role="menu">
                  <div className="account-menu__profile">
                    <Avatar name={avatarName} src={user?.avatarUrl} />
                    <span>
                      <strong>{user?.name || 'CallWave user'}</strong>
                      <small>{user?.email}</small>
                    </span>
                  </div>
                  <button
                    type="button"
                    className="account-menu__item"
                    role="menuitem"
                    onClick={() => {
                      setUserMenuOpen(false)
                      onNotice('Account settings are coming next.')
                    }}
                  >
                    <SettingsIcon />
                    Account settings
                  </button>
                  <button
                    type="button"
                    className="account-menu__item"
                    role="menuitem"
                    onClick={() => {
                      setUserMenuOpen(false)
                      onNotice('Help center is coming next.')
                    }}
                  >
                    <HeadsetIcon />
                    Help &amp; support
                  </button>
                  <div className="account-menu__divider" />
                  <button
                    type="button"
                    className="account-menu__item account-menu__item--danger"
                    role="menuitem"
                    onClick={handleSignOut}
                    disabled={signingOut}
                  >
                    <LogOutIcon />
                    {signingOut ? 'Signing out…' : 'Sign out'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="dashboard-main">{children}</main>
      </div>
    </div>
  )
}
