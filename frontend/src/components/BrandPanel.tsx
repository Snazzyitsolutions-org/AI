import { BrandMark } from './BrandMark'
import { CheckIcon, PhoneIcon, ShieldCheckIcon } from './icons'

export function BrandPanel() {
  return (
    <section className="brand-panel" aria-label="About CallWave">
      <div className="brand-panel__top">
        <BrandMark />
      </div>

      <div className="brand-panel__main">
        <span className="brand-eyebrow">
          <span className="brand-eyebrow__dot" />
          Conversations, made simple
        </span>
        <h1>
          Every great
          <br />
          conversation
          <br />
          <span>starts here.</span>
        </h1>
        <p>
          One secure account for clear calls, closer teams, and conversations that feel
          effortless.
        </p>

        <ul className="brand-points">
          <li>
            <span className="brand-points__icon">
              <ShieldCheckIcon />
            </span>
            Private by design, secure by default
          </li>
          <li>
            <span className="brand-points__icon">
              <CheckIcon />
            </span>
            One account for every conversation
          </li>
        </ul>
      </div>

      <div className="brand-panel__visual" aria-hidden="true">
        <div className="call-preview">
          <div className="call-preview__top">
            <span className="call-preview__status">
              <span className="call-preview__live-dot" />
              Incoming call
            </span>
            <span className="call-preview__time">00:24</span>
          </div>

          <div className="call-preview__body">
            <span className="call-preview__avatar">MK</span>
            <span className="call-preview__person">
              <strong>Maya Kapoor</strong>
              <span>Weekly product huddle</span>
            </span>
            <span className="waveform">
              {[8, 15, 11, 21, 16, 25, 13, 19, 9].map((height, index) => (
                <span key={index} style={{ height }} />
              ))}
            </span>
            <span className="call-preview__answer">
              <PhoneIcon />
            </span>
          </div>
        </div>

        <div className="secure-chip">
          <ShieldCheckIcon />
          <span>
            <strong>Secure connection</strong>
            <small>Your details stay protected</small>
          </span>
        </div>
      </div>
    </section>
  )
}
