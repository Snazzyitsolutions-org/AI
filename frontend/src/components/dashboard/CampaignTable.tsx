import type { Campaign, CampaignStatus } from './campaignData'
import { ArrowUpRightIcon, MegaphoneIcon } from './DashboardIcons'

export type CampaignFilter = 'All' | Extract<CampaignStatus, 'Active' | 'Paused' | 'Draft'>

const FILTERS: CampaignFilter[] = ['All', 'Active', 'Paused', 'Draft']

type CampaignTableProps = {
  campaigns: Campaign[]
  filter: CampaignFilter
  onFilterChange: (filter: CampaignFilter) => void
  searchQuery: string
  onViewAll: () => void
  onClearFilters: () => void
}

const numberFormatter = new Intl.NumberFormat('en-US')

function campaignTone(campaign: Campaign) {
  if (campaign.status === 'Paused') return 'amber'
  if (campaign.status === 'Completed') return 'slate'
  if (campaign.status === 'Draft') return 'draft'
  if (campaign.aiPersonalized) return 'mint'
  return 'teal'
}

export function CampaignTable({
  campaigns,
  filter,
  onFilterChange,
  searchQuery,
  onViewAll,
  onClearFilters,
}: CampaignTableProps) {
  const normalizedSearch = searchQuery.trim().toLowerCase()
  const visibleCampaigns = campaigns.filter((campaign) => {
    const matchesFilter = filter === 'All' || campaign.status === filter
    const matchesSearch =
      !normalizedSearch ||
      `${campaign.name} ${campaign.channel} ${campaign.meta}`
        .toLowerCase()
        .includes(normalizedSearch)

    return matchesFilter && matchesSearch
  })

  return (
    <article className="dashboard-panel campaigns-panel">
      <div className="panel-heading">
        <div>
          <h2>Recent campaigns</h2>
          <p>Bulk calling and outreach happening right now</p>
        </div>
        <button type="button" className="panel-link" onClick={onViewAll}>
          View all
          <ArrowUpRightIcon />
        </button>
      </div>

      <div className="campaign-toolbar">
        <div className="filter-tabs" role="tablist" aria-label="Campaign status">
          {FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={filter === item}
              className={filter === item ? 'is-active' : ''}
              onClick={() => onFilterChange(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <span className="campaign-count">
          {visibleCampaigns.length} {visibleCampaigns.length === 1 ? 'campaign' : 'campaigns'}
        </span>
      </div>

      <div className="campaign-table" role="table" aria-label="Recent campaigns">
        <div className="campaign-table__head" role="row">
          <span role="columnheader">Campaign</span>
          <span role="columnheader">Status</span>
          <span role="columnheader">Progress</span>
          <span role="columnheader">Connect</span>
          <span role="columnheader">Contacts</span>
        </div>

        {visibleCampaigns.map((campaign) => (
          <div className="campaign-row" role="row" key={campaign.id}>
            <div className="campaign-name-cell" role="cell">
              <span className={`campaign-icon campaign-icon--${campaignTone(campaign)}`}>
                <MegaphoneIcon />
              </span>
              <span className="campaign-name-copy">
                <strong>{campaign.name}</strong>
                <small>
                  {campaign.channel} <i /> {campaign.meta}
                </small>
              </span>
            </div>

            <div className="campaign-status" role="cell">
              <span className={`status-pill status-pill--${campaign.status.toLowerCase()}`}>
                <i />
                {campaign.status}
              </span>
            </div>

            <div className="campaign-progress" role="cell">
              <div className="campaign-progress__track">
                <span
                  className={`campaign-progress__fill campaign-progress__fill--${campaign.status.toLowerCase()}`}
                  style={{ width: `${campaign.progress}%` }}
                />
              </div>
              <small>{campaign.progress}%</small>
            </div>

            <div className="campaign-connect" role="cell">
              <span className="campaign-cell-label">Connect</span>
              <strong>{campaign.connectRate}</strong>
            </div>

            <div className="campaign-contacts" role="cell">
              <span className="campaign-cell-label">Contacts</span>
              <strong>{numberFormatter.format(campaign.contacts)}</strong>
            </div>
          </div>
        ))}

        {visibleCampaigns.length === 0 && (
          <div className="campaign-empty">
            <span className="campaign-empty__icon">
              <MegaphoneIcon />
            </span>
            <strong>No campaigns found</strong>
            <p>Try a different search or status filter.</p>
            <button type="button" className="panel-link" onClick={onClearFilters}>
              Clear filters
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
