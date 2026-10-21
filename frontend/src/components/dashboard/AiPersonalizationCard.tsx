import { Avatar } from '../Avatar'
import { ArrowRightIcon, SparkIcon } from '../icons'
import { CheckCircleIcon, PlayIcon } from './DashboardIcons'

type AiPersonalizationCardProps = {
  onNotice: (message: string) => void
}

export function AiPersonalizationCard({ onNotice }: AiPersonalizationCardProps) {
  return (
    <article className="dashboard-panel ai-panel">
      <div className="ai-panel__orb ai-panel__orb--one" aria-hidden="true" />
      <div className="ai-panel__orb ai-panel__orb--two" aria-hidden="true" />

      <div className="ai-panel__top">
        <span className="ai-chip">
          <SparkIcon />
          AI message studio
        </span>
        <span className="ai-live">
          <span />
          Live
        </span>
      </div>

      <div className="ai-panel__intro">
        <h2>Make every call feel personal.</h2>
        <p>
          CallWave writes a unique opening line for every lead — using their name, context
          and last conversation.
        </p>
      </div>

      <div className="ai-message-card">
        <div className="ai-message-card__head">
          <Avatar name="Priya Sharma" />
          <span>
            <strong>Priya Sharma</strong>
            <small>3BHK buyer · Whitefield</small>
          </span>
          <button
            type="button"
            className="ai-message-card__play"
            aria-label="Preview AI voice message"
            onClick={() => onNotice('Voice preview is coming in the next build.')}
          >
            <PlayIcon />
          </button>
        </div>

        <p className="ai-message-card__copy">
          “Hi Priya, I saw you were exploring 3BHK homes in Whitefield. Our new launch has
          two units left — should I send the floor plans?”
        </p>

        <div className="ai-message-card__footer">
          <span>
            <SparkIcon />
            Personalized by AI
          </span>
          <span>Voice · 18 sec</span>
        </div>
      </div>

      <div className="ai-panel__result">
        <CheckCircleIcon />
        <span>
          <strong>3.2× higher response rate</strong>
          compared to generic scripts
        </span>
      </div>

      <button
        type="button"
        className="ai-cta"
        onClick={() => onNotice('AI Studio is coming in the next build.')}
      >
        Open AI Studio
        <ArrowRightIcon />
      </button>
    </article>
  )
}
