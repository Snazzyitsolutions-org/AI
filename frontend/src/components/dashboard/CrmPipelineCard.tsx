import { Avatar } from '../Avatar'
import { CRM_STAGES, HOT_LEADS } from './campaignData'
import { ArrowUpRightIcon, PhoneOutlineIcon, TrendUpIcon } from './DashboardIcons'

type CrmPipelineCardProps = {
  onNotice: (message: string) => void
}

export function CrmPipelineCard({ onNotice }: CrmPipelineCardProps) {
  return (
    <article className="dashboard-panel crm-panel">
      <div className="panel-heading">
        <div>
          <h2>CRM pipeline</h2>
          <p>Your leads, at a glance</p>
        </div>
        <button
          type="button"
          className="panel-link"
          onClick={() => onNotice('The full CRM pipeline is coming in the next build.')}
        >
          Open CRM
          <ArrowUpRightIcon />
        </button>
      </div>

      <div className="pipeline-total">
        <span>Open pipeline</span>
        <div>
          <strong>$184,200</strong>
          <small>
            <TrendUpIcon />
            14.2%
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
                <strong>{stage.count.toLocaleString('en-US')}</strong>
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
          <span>Hot leads today</span>
          <button
            type="button"
            className="text-button"
            onClick={() => onNotice('The lead inbox is coming in the next build.')}
          >
            View all
          </button>
        </div>

        {HOT_LEADS.map((lead) => (
          <div className="hot-lead" key={lead.id}>
            <Avatar name={lead.name} />
            <span className="hot-lead__copy">
              <strong>{lead.name}</strong>
              <small>
                {lead.company} · {lead.note}
              </small>
            </span>
            <span className="hot-lead__score">{lead.score}</span>
            <button
              type="button"
              className="hot-lead__call"
              aria-label={`Call ${lead.name}`}
              onClick={() => onNotice(`Call queue for ${lead.name} is coming next.`)}
            >
              <PhoneOutlineIcon />
            </button>
          </div>
        ))}
      </div>
    </article>
  )
}
