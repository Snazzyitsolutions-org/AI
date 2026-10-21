import { useCallback, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { AiPersonalizationCard } from '../components/dashboard/AiPersonalizationCard'
import { CampaignTable } from '../components/dashboard/CampaignTable'
import type { CampaignFilter } from '../components/dashboard/CampaignTable'
import { CrmPipelineCard } from '../components/dashboard/CrmPipelineCard'
import { CAMPAIGNS } from '../components/dashboard/campaignData'
import type { Campaign } from '../components/dashboard/campaignData'
import { DashboardLayout } from '../components/dashboard/DashboardLayout'
import {
  CalendarIcon,
  ContactsIcon,
  MegaphoneIcon,
  PhoneOutlineIcon,
  PlusIcon,
  UploadIcon,
} from '../components/dashboard/DashboardIcons'
import { KpiCard } from '../components/dashboard/KpiCard'
import { NewCampaignModal } from '../components/dashboard/NewCampaignModal'
import type { NewCampaignInput } from '../components/dashboard/NewCampaignModal'
import { PerformanceCard } from '../components/dashboard/PerformanceCard'
import { Toast } from '../components/dashboard/Toast'
import { SparkIcon } from '../components/icons'
import { usePageTitle } from '../lib/usePageTitle'
import './HomePage.css'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function HomePage() {
  usePageTitle('Home · CallWave')

  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const firstName = user?.name.split(/\s+/)[0] || 'there'
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<CampaignFilter>('All')
  const [campaigns, setCampaigns] = useState<Campaign[]>(CAMPAIGNS)
  const [campaignModalOpen, setCampaignModalOpen] = useState(false)
  const [toast, setToast] = useState<{ id: number; message: string } | null>(() =>
    searchParams.get('welcome') === 'google'
      ? {
          id: 1,
          message: 'Signed in with Google. Welcome to your workspace.',
        }
      : null,
  )
  const importInputRef = useRef<HTMLInputElement>(null)

  const notify = useCallback((message: string) => {
    setToast({ id: Date.now(), message })
  }, [])

  const closeToast = useCallback(() => setToast(null), [])
  const closeCampaignModal = useCallback(() => setCampaignModalOpen(false), [])

  function handleImportClick() {
    importInputRef.current?.click()
  }

  function handleImportChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (file) {
      notify(`${file.name} is ready. CRM contact sync is coming next.`)
    }

    event.target.value = ''
  }

  function handleCreateCampaign(input: NewCampaignInput) {
    const campaign: Campaign = {
      id: `campaign-${Date.now()}`,
      name: input.name,
      channel: input.aiPersonalization ? 'AI voice' : 'Voice',
      meta: `${input.audience.label} · Just now`,
      status: 'Draft',
      progress: 0,
      connectRate: '—',
      contacts: input.audience.contacts,
      aiPersonalized: input.aiPersonalization,
    }

    setCampaigns((current) => [campaign, ...current])
    setFilter('All')
    setSearch('')
    setCampaignModalOpen(false)
    notify(`“${input.name}” is ready as a draft campaign.`)
  }

  function handleClearFilters() {
    setFilter('All')
    setSearch('')
  }

  return (
    <>
      <DashboardLayout
        search={search}
        onSearchChange={setSearch}
        onNotice={notify}
      >
        <section className="dashboard-heading">
          <div>
            <div className="dashboard-heading__meta">
              <span className="workspace-live">
                <span />
                32 agents online
              </span>
              <span className="dashboard-date">
                <CalendarIcon />
                {dateFormatter.format(new Date())}
              </span>
            </div>
            <h1>
              {getGreeting()}, {firstName}.
            </h1>
            <p>Here&apos;s what&apos;s happening across your calling workspace today.</p>
          </div>

          <div className="dashboard-actions">
            <input
              ref={importInputRef}
              className="screen-reader-only"
              type="file"
              accept=".csv,text/csv"
              tabIndex={-1}
              onChange={handleImportChange}
            />
            <button
              type="button"
              className="dash-button dash-button--ghost"
              onClick={handleImportClick}
            >
              <UploadIcon />
              Import<span className="button-label-long"> contacts</span>
            </button>
            <button
              type="button"
              className="dash-button dash-button--primary"
              onClick={() => setCampaignModalOpen(true)}
            >
              <PlusIcon />
              New campaign
            </button>
          </div>
        </section>

        <section className="kpi-grid" aria-label="Workspace overview">
          <KpiCard
            label="Total contacts"
            value="24,860"
            change="12.4%"
            note="vs last month"
            icon={<ContactsIcon />}
            tone="mint"
            points={[19, 22, 20, 25, 24, 29, 27, 33, 31, 36]}
          />
          <KpiCard
            label="Active campaigns"
            value="18"
            change="3 new"
            note="this week"
            icon={<MegaphoneIcon />}
            tone="leaf"
            points={[12, 14, 13, 16, 15, 18, 17, 20, 19, 22]}
          />
          <KpiCard
            label="Calls today"
            value="1,284"
            change="8.2%"
            note="vs yesterday"
            icon={<PhoneOutlineIcon />}
            tone="teal"
            points={[16, 14, 18, 17, 21, 19, 24, 22, 27, 29]}
          />
          <KpiCard
            label="AI messages"
            value="892"
            change="18.6%"
            note="this week"
            icon={<SparkIcon />}
            tone="lime"
            points={[9, 12, 11, 16, 14, 19, 21, 20, 25, 27]}
          />
        </section>

        <div className="dashboard-grid">
          <PerformanceCard onNotice={notify} />
          <AiPersonalizationCard onNotice={notify} />
          <CampaignTable
            campaigns={campaigns}
            filter={filter}
            onFilterChange={setFilter}
            searchQuery={search}
            onViewAll={() => notify('The full campaigns page is coming next.')}
            onClearFilters={handleClearFilters}
          />
          <CrmPipelineCard onNotice={notify} />
        </div>

        <footer className="dashboard-page-footer">
          <span className="system-status">
            <i />
            All systems operational
          </span>
          <span>Last synced 2 min ago · Data refreshes automatically</span>
        </footer>
      </DashboardLayout>

      {campaignModalOpen && (
        <NewCampaignModal onClose={closeCampaignModal} onCreate={handleCreateCampaign} />
      )}

      {toast && (
        <Toast key={toast.id} message={toast.message} onClose={closeToast} />
      )}
    </>
  )
}
