import { useState } from 'react'
import type { Campaign, CampaignStatus, PriorityLead } from './campaignData'
import { CALL_TRANSCRIPTS, HOT_LEADS } from './campaignData'
import { ArrowUpRightIcon, MegaphoneIcon, WhatsAppIcon } from './DashboardIcons'
import { SparkIcon } from '../icons'
import { Avatar } from '../Avatar'

export type CampaignFilter = 'All' | CampaignStatus
export type HubView = 'campaigns' | 'hot-leads' | 'transcripts'

const FILTERS: CampaignFilter[] = ['All', 'Active', 'Paused', 'Scheduled', 'Completed', 'Draft']

type CampaignTableProps = {
  campaigns: Campaign[]
  filter: CampaignFilter
  onFilterChange: (filter: CampaignFilter) => void
  searchQuery: string
  onViewAll: () => void
  onClearFilters: () => void
  onToggleCampaignStatus?: (id: string) => void
  onTriggerLeadDial?: (lead: PriorityLead) => void
  onNotice: (message: string) => void
}

const numberFormatter = new Intl.NumberFormat('en-US')

function campaignTone(campaign: Campaign) {
  if (campaign.status === 'Paused') return 'amber'
  if (campaign.status === 'Completed') return 'slate'
  if (campaign.status === 'Scheduled') return 'teal'
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
  onToggleCampaignStatus,
  onTriggerLeadDial,
  onNotice,
}: CampaignTableProps) {
  const [currentView, setCurrentView] = useState<HubView>('campaigns')
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

  const visibleLeads = HOT_LEADS.filter((l) =>
    !normalizedSearch ||
    `${l.name} ${l.company} ${l.role} ${l.note}`.toLowerCase().includes(normalizedSearch)
  )

  const visibleTranscripts = CALL_TRANSCRIPTS.filter((t) =>
    !normalizedSearch ||
    `${t.contactName} ${t.company} ${t.agentName} ${t.summary}`.toLowerCase().includes(normalizedSearch)
  )

  return (
    <article className="dashboard-panel campaigns-panel">
      <div className="panel-heading panel-heading--wrap">
        <div>
          <div className="analytics-kicker">
            <MegaphoneIcon />
            <span>Workspace Operations</span>
          </div>
          <h2>Campaign &amp; Lead Command Board</h2>
          <p>Manage WhatsApp broadcasts, prioritized lead queues &amp; conversation logs</p>
        </div>

        <div className="hub-view-tabs" role="tablist" aria-label="Command board view selection">
          <button
            type="button"
            role="tab"
            aria-selected={currentView === 'campaigns'}
            className={`hub-tab-btn ${currentView === 'campaigns' ? 'is-active' : ''}`}
            onClick={() => setCurrentView('campaigns')}
          >
            <span>Active Campaigns</span>
            <span className="hub-tab-count">{campaigns.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={currentView === 'hot-leads'}
            className={`hub-tab-btn ${currentView === 'hot-leads' ? 'is-active' : ''}`}
            onClick={() => setCurrentView('hot-leads')}
          >
            <SparkIcon />
            <span>Priority Leads</span>
            <span className="hub-tab-count hub-tab-count--accent">{HOT_LEADS.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={currentView === 'transcripts'}
            className={`hub-tab-btn ${currentView === 'transcripts' ? 'is-active' : ''}`}
            onClick={() => setCurrentView('transcripts')}
          >
            <span>Call Transcripts</span>
            <span className="hub-tab-count">{CALL_TRANSCRIPTS.length}</span>
          </button>
        </div>
      </div>

      {currentView === 'campaigns' && (
        <>
          <div className="campaign-toolbar">
            <div className="filter-tabs" role="tablist" aria-label="Campaign status filter">
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

            <div className="toolbar-right-meta">
              <span className="campaign-count">
                {visibleCampaigns.length} {visibleCampaigns.length === 1 ? 'campaign' : 'campaigns'}
              </span>
              <button type="button" className="panel-link" onClick={onViewAll}>
                View all
                <ArrowUpRightIcon />
              </button>
            </div>
          </div>

          <div className="campaign-table" role="table" aria-label="Recent campaigns">
            <div className="campaign-table__head" role="row">
              <span role="columnheader">Campaign</span>
              <span role="columnheader">Status</span>
              <span role="columnheader">Channel</span>
              <span role="columnheader">Progress</span>
              <span role="columnheader">Connect</span>
              <span role="columnheader">Contacts</span>
              <span role="columnheader">Action</span>
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

                <div className="campaign-channel" role="cell">
                  <span className="channel-pill">
                    {campaign.aiPersonalized && <SparkIcon />}
                    {campaign.channel}
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

                <div className="campaign-actions-cell" role="cell">
                  <button
                    type="button"
                    className="row-toggle-btn"
                    onClick={() => {
                      if (onToggleCampaignStatus) {
                        onToggleCampaignStatus(campaign.id)
                      } else {
                        onNotice(
                          `Campaign "${campaign.name}" status toggled to ${
                            campaign.status === 'Active' ? 'Paused' : 'Active'
                          }.`,
                        )
                      }
                    }}
                  >
                    {campaign.status === 'Active' ? 'Pause' : 'Resume'}
                  </button>
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
        </>
      )}

      {currentView === 'hot-leads' && (
        <div className="hot-leads-hub">
          <div className="leads-hub-header">
            <p>Leads scored with high AI intent propensities. Ready for WhatsApp outreach or immediate follow-up.</p>
          </div>

          <div className="priority-leads-grid">
            {visibleLeads.map((lead) => (
              <div key={lead.id} className="priority-lead-card">
                <div className="lead-card-head">
                  <Avatar name={lead.name} />
                  <div className="lead-card-identity">
                    <strong>{lead.name}</strong>
                    <span>{lead.role} · {lead.company}</span>
                  </div>
                  <div className="lead-card-score-badge">
                    <span className="score-num">{lead.score}</span>
                    <small>AI Score</small>
                  </div>
                </div>

                <div className="lead-card-meta-row">
                  <span className="lead-deal-val">
                    Pipeline: <strong>{lead.dealValue}</strong>
                  </span>
                  <span className={`lead-intent-pill lead-intent-pill--${lead.intent.toLowerCase()}`}>
                    {lead.intent} Intent
                  </span>
                </div>

                <p className="lead-card-note">{lead.note}</p>
                <span className="lead-card-time">{lead.lastActivity}</span>

                <div className="lead-card-actions">
                  <button
                    type="button"
                    className="dial-lead-btn"
                    onClick={() => {
                      if (onTriggerLeadDial) {
                        onTriggerLeadDial(lead)
                      } else {
                        onNotice(`Opening WhatsApp chat with ${lead.name} (${lead.phone})…`)
                      }
                    }}
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-500 inline-block mr-1" />
                    <span>WhatsApp Chat</span>
                  </button>

                  <button
                    type="button"
                    className="lead-secondary-btn"
                    onClick={() => onNotice(`Contact record for ${lead.name} opened in CRM.`)}
                  >
                    CRM Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentView === 'transcripts' && (
        <div className="transcripts-hub">
          <div className="transcripts-list">
            {visibleTranscripts.map((t) => (
              <div key={t.id} className="transcript-row-card">
                <div className="transcript-row-top">
                  <div className="transcript-contact">
                    <Avatar name={t.contactName} />
                    <div>
                      <strong>{t.contactName}</strong>
                      <span>{t.company} · Handled by {t.agentName}</span>
                    </div>
                  </div>

                  <div className="transcript-badges">
                    <span className="transcript-duration">
                      <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-500 inline-block mr-1" /> {t.duration}
                    </span>
                    <span className="transcript-time">{t.timeAgo}</span>
                    <span className={`sentiment-pill sentiment-pill--${t.sentiment.toLowerCase().replace(/\s+/g, '-')}`}>
                      {t.sentiment}
                    </span>
                  </div>
                </div>

                <div className="transcript-summary-box">
                  <p><strong>Executive Summary:</strong> {t.summary}</p>
                  <p className="transcript-action"><strong>Next Action:</strong> {t.actionItem}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}
