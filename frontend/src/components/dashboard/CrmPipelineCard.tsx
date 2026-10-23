import { Avatar } from '../Avatar'
import { useNavigate } from 'react-router-dom'
import { CRM_STAGES, HOT_LEADS } from './campaignData'
import type { PriorityLead } from './campaignData'
import { ArrowUpRightIcon, PipelineIcon, TrendUpIcon, WhatsAppIcon } from './DashboardIcons'
import { SparkIcon } from '../icons'

type CrmPipelineCardProps = {
  onNotice: (message: string) => void
  onDialLead?: (lead: PriorityLead) => void
}

export function CrmPipelineCard({ onNotice, onDialLead }: CrmPipelineCardProps) {
  const navigate = useNavigate()

  return (
    <article className="dashboard-panel crm-panel">
      <div className="panel-heading">
        <div>
          <div className="analytics-kicker">
            <PipelineIcon />
            <span>Revenue Operations</span>
          </div>
          <h2>Autonomous CRM Pipeline</h2>
          <p>Real-time deal flow &amp; AI qualification stages</p>
        </div>
        <button
          type="button"
          className="panel-link"
          onClick={() => navigate('/crm')}
        >
          <span>Open CRM</span>
          <ArrowUpRightIcon />
        </button>
      </div>

      <div className="pipeline-total">
        <span>Active Pipeline Value</span>
        <div>
          <strong>$184,200</strong>
          <small>
            <TrendUpIcon />
            +14.2% this cycle
          </small>
        </div>
      </div>

      <div className="pipeline-stages">
        {CRM_STAGES.map((stage, index) => (
          <div className="pipeline-stage" key={stage.id}>
            <div className="pipeline-stage__head">
              <span>
                <i className={`pipeline-stage__dot pipeline-stage__dot--${index + 1}`} />
                {stage.label}
              </span>
              <span>
                <strong>{stage.count.toLocaleString('en-US')} leads</strong>
                <small>{stage.value}</small>
              </span>
            </div>
            <div className="pipeline-stage__track">
              <span
                className={`pipeline-stage__fill pipeline-stage__fill--${index + 1}`}
                style={{ width: `${stage.width}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="hot-leads">
        <div className="hot-leads__head">
          <span>High-Intent Leads Queue</span>
          <button
            type="button"
            className="text-button"
            onClick={() => onNotice('Lead inbox opened.')}
          >
            View all
          </button>
        </div>

        {HOT_LEADS.slice(0, 3).map((lead) => (
          <div className="hot-lead" key={lead.id}>
            <Avatar name={lead.name} />
            <span className="hot-lead__copy">
              <strong>{lead.name}</strong>
              <small>
                {lead.company} · {lead.dealValue}
              </small>
            </span>
            <span className="hot-lead__score">
              <SparkIcon />
              {lead.score}
            </span>
            <button
              type="button"
              className="hot-lead__call text-emerald-500 hover:text-emerald-400"
              aria-label={`WhatsApp message ${lead.name}`}
              onClick={() => {
                if (onDialLead) {
                  onDialLead(lead)
                } else {
                  onNotice(`Opening WhatsApp conversation with ${lead.name}…`)
                }
              }}
            >
              <WhatsAppIcon className="w-4 h-4 text-emerald-500" />
            </button>
          </div>
        ))}
      </div>
    </article>
  )
}
