import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LIVE_CALLS } from './campaignData'
import type { LiveCall } from './campaignData'
import { speakAgentLine, stopAgentSpeech } from '../../lib/audioVoice'
import { Avatar } from '../Avatar'
import { SparkIcon } from '../icons'
import { HeadsetIcon, WhatsAppIcon } from './DashboardIcons'

type LiveCallsStreamProps = {
  onNotice: (message: string) => void
  onSimulateCall?: (leadName?: string) => void
}

export function LiveCallsStream({ onNotice }: LiveCallsStreamProps) {
  const navigate = useNavigate()
  const [activeCallId, setActiveCallId] = useState<string | null>(null)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [expandedCallId, setExpandedCallId] = useState<string | null>(LIVE_CALLS[0].id)
  const [callTimers, setCallTimers] = useState<Record<string, number>>(() =>
    LIVE_CALLS.reduce((acc, c) => ({ ...acc, [c.id]: c.durationSeconds }), {}),
  )

  // Live timer tick for active calls
  useEffect(() => {
    const interval = setInterval(() => {
      setCallTimers((prev) => {
        const next = { ...prev }
        LIVE_CALLS.forEach((c) => {
          if (c.status === 'Live') {
            next[c.id] = (next[c.id] || c.durationSeconds) + 1
          }
        })
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  function formatDuration(totalSeconds: number) {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  function handleListenIn(call: LiveCall) {
    if (activeCallId === call.id && isPlayingAudio) {
      stopAgentSpeech()
      setIsPlayingAudio(false)
      setActiveCallId(null)
      return
    }

    stopAgentSpeech()
    setActiveCallId(call.id)
    setIsPlayingAudio(true)
    setExpandedCallId(call.id)

    speakAgentLine(call.speechLine, {
      onEnd: () => {
        setIsPlayingAudio(false)
        setActiveCallId(null)
      },
      onError: () => {
        setIsPlayingAudio(false)
        setActiveCallId(null)
      },
    })
  }

  function toggleExpand(id: string) {
    setExpandedCallId((prev) => (prev === id ? null : id))
  }

  return (
    <article className="dashboard-panel live-calls-panel">
      <div className="live-calls-header">
        <div className="live-calls-header__left">
          <div className="live-radar-badge">
            <span className="live-radar-dot" />
            <strong>LIVE WHATSAPP STREAM</strong>
          </div>
          <div>
            <h2>Real-time WhatsApp Broadcast Feed</h2>
            <p>Active message delivery, sentiment detection &amp; automated AI responses</p>
          </div>
        </div>

        <div className="live-calls-header__actions">
          <div className="telemetry-chip">
            <span className="telemetry-chip__indicator" />
            <span>8 Active Broadcast Pools</span>
          </div>
          <button
            type="button"
            className="dash-button dash-button--ghost live-test-btn"
            onClick={() => navigate('/inbox')}
          >
            <WhatsAppIcon className="w-4 h-4 text-emerald-500" />
            <span>Open WhatsApp Inbox</span>
          </button>
        </div>
      </div>

      <div className="live-calls-grid">
        {LIVE_CALLS.map((call) => {
          const isListening = activeCallId === call.id && isPlayingAudio
          const isExpanded = expandedCallId === call.id
          const currentSeconds = callTimers[call.id] ?? call.durationSeconds

          return (
            <div
              key={call.id}
              className={`live-call-card ${isListening ? 'is-listening' : ''} ${
                call.status === 'Completed' ? 'is-completed' : ''
              }`}
            >
              <div className="live-call-card__main">
                <div className="live-call-card__head">
                  <div className="lead-identity">
                    <Avatar name={call.leadName} />
                    <div className="lead-identity__copy">
                      <div className="lead-identity__title-row">
                        <strong>{call.leadName}</strong>
                        <span className="lead-role">
                          {call.leadRole} · {call.company}
                        </span>
                      </div>
                      <span className="lead-location">{call.location}</span>
                    </div>
                  </div>

                  <div className="call-meta-right">
                    <span
                      className={`sentiment-tag sentiment-tag--${call.sentiment
                        .toLowerCase()
                        .replace(/\s+/g, '-')}`}
                    >
                      {call.sentiment === 'High Intent' && '🔥 '}
                      {call.sentiment === 'Interested' && '🟢 '}
                      {call.sentiment === 'Inquiring' && '🟡 '}
                      {call.sentiment === 'Meeting Booked' && '🎉 '}
                      {call.sentiment}
                    </span>

                    <span className="live-call-timer">
                      {call.status === 'Live' ? (
                        <>
                          <span className="timer-pulse" />
                          {formatDuration(currentSeconds)}
                        </>
                      ) : (
                        <span className="status-badge-done">Done</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="live-call-agent-strip">
                  <div className="agent-pill">
                    <HeadsetIcon />
                    <span>Agent: <strong>{call.agentName}</strong></span>
                    <small>({call.agentModel})</small>
                  </div>
                  <div className="topic-pill">
                    <span>Topic: <em>{call.topic}</em></span>
                  </div>
                </div>

                <div className="live-call-speech-preview">
                  <p className="speech-quote">
                    “{call.speechLine}”
                  </p>
                </div>

                <div className="live-call-card__footer">
                  <div className="live-audio-player">
                    <button
                      type="button"
                      className={`listen-button ${isListening ? 'is-active' : ''}`}
                      onClick={() => handleListenIn(call)}
                      aria-label={isListening ? 'Stop audio preview' : 'Play WhatsApp Voice Note'}
                    >
                      {isListening ? (
                        <>
                          <span className="audio-wave-bars" aria-hidden="true">
                            <span />
                            <span />
                            <span />
                            <span />
                            <span />
                          </span>
                          <span>Playing Voice Note…</span>
                        </>
                      ) : (
                        <>
                          <WhatsAppIcon className="w-4 h-4 text-emerald-500" />
                          <span>Voice Note Preview</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="transcript-toggle"
                      onClick={() => toggleExpand(call.id)}
                    >
                      {isExpanded ? 'Hide WhatsApp Log' : 'View WhatsApp Log'}
                    </button>
                  </div>

                  <div className="call-quick-controls">
                    <button
                      type="button"
                      className="pill-action-btn"
                      onClick={() => onNotice(`AI WhatsApp reply dispatched to ${call.leadName}.`)}
                    >
                      <SparkIcon />
                      <span>AI Follow-Up</span>
                    </button>
                    <button
                      type="button"
                      className="pill-action-btn pill-action-btn--takeover"
                      onClick={() => {
                        navigate('/inbox')
                        onNotice(`Opening WhatsApp chat with ${call.leadName}…`)
                      }}
                    >
                      <span>Open Chat</span>
                    </button>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="live-call-transcript-drawer">
                  <div className="transcript-head">
                    <span className="transcript-title">Real-time WhatsApp Message Stream</span>
                    <span className="transcription-accuracy">Delivery Rate: 99.8% · Latency 42ms</span>
                  </div>
                  <div className="transcript-chat">
                    {call.transcript.map((line, idx) => (
                      <div
                        key={idx}
                        className={`transcript-message transcript-message--${line.speaker.toLowerCase()}`}
                      >
                        <div className="message-speaker">
                          <span>{line.speaker === 'AI' ? `🤖 ${call.agentName} (AI)` : `👤 ${call.leadName}`}</span>
                          <time>{line.time}</time>
                        </div>
                        <p className="message-text">{line.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </article>
  )
}
