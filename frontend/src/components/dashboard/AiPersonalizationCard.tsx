import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../Avatar'
import { ArrowRightIcon, SparkIcon } from '../icons'
import { CheckCircleIcon, HeadsetIcon, PlayIcon } from './DashboardIcons'
import { speakAgentLine, stopAgentSpeech } from '../../lib/audioVoice'

type Scenario = {
  id: string
  label: string
  name: string
  role: string
  location: string
  agentName: string
  voiceTag: string
  openingLine: string
  highlightedParts: { text: string; isVariable?: boolean }[]
  uplift: string
  duration: string
}

const SCENARIOS: Scenario[] = [
  {
    id: 'real-estate',
    label: 'Real Estate',
    name: 'Priya Sharma',
    role: '3BHK Buyer',
    location: 'Whitefield, Bengaluru',
    agentName: 'Maya',
    voiceTag: 'Voice Model 4.2 · Warm Natural',
    openingLine:
      'Hi Priya, I saw you were exploring 3BHK homes in Whitefield. Our new launch has two units left with private garden terraces — should I send the floor plans?',
    highlightedParts: [
      { text: '“Hi ' },
      { text: '{{lead.firstName}}', isVariable: true },
      { text: ', I saw you were exploring ' },
      { text: '{{property.type}}', isVariable: true },
      { text: ' in ' },
      { text: '{{lead.location}}', isVariable: true },
      { text: '. Our new launch has two units left with private garden terraces — should I send the floor plans?”' },
    ],
    uplift: '3.4× higher response',
    duration: '18 sec',
  },
  {
    id: 'saas',
    label: 'B2B SaaS',
    name: 'Vikram Mehta',
    role: 'VP Operations',
    location: 'TechCorp Global',
    agentName: 'Aria',
    voiceTag: 'Voice Model 4.2 · Confident Closer',
    openingLine:
      'Vikram, I noticed your team manages 20 SDRs. We built an AI voice agent that qualifies leads in 120ms without sounding robotic. Can I show you a 2-minute demo?',
    highlightedParts: [
      { text: '“' },
      { text: '{{lead.firstName}}', isVariable: true },
      { text: ', I noticed your team manages ' },
      { text: '{{team.size}}', isVariable: true },
      { text: '. We built an AI voice agent that qualifies leads in 120ms without sounding robotic. Can I show you a 2-minute demo?”' },
    ],
    uplift: '4.1× meeting booking rate',
    duration: '16 sec',
  },
  {
    id: 'collections',
    label: 'FinTech Reminder',
    name: 'Marcus Sterling',
    role: 'Managing Partner',
    location: 'Vertex Capital',
    agentName: 'Liam',
    voiceTag: 'Voice Model 4.2 · Executive Crisp',
    openingLine:
      'Good morning Marcus. This is Liam following up on invoice INV-8921 due tomorrow. I can process your secure ACH authorization over this call right now.',
    highlightedParts: [
      { text: '“Good morning ' },
      { text: '{{lead.lastName}}', isVariable: true },
      { text: '. This is Liam following up on invoice ' },
      { text: '{{invoice.id}}', isVariable: true },
      { text: ' due tomorrow. I can process your secure ACH authorization right now.”' },
    ],
    uplift: '88% same-day resolution',
    duration: '14 sec',
  },
]

type AiPersonalizationCardProps = {
  onNotice: (message: string) => void
}

export function AiPersonalizationCard({ onNotice }: AiPersonalizationCardProps) {
  const navigate = useNavigate()
  const [selectedScenarioId, setSelectedScenarioId] = useState(SCENARIOS[0].id)
  const [isPlaying, setIsPlaying] = useState(false)

  const activeScenario = SCENARIOS.find((s) => s.id === selectedScenarioId) ?? SCENARIOS[0]

  function handlePlayAudio() {
    if (isPlaying) {
      stopAgentSpeech()
      setIsPlaying(false)
      return
    }

    setIsPlaying(true)
    speakAgentLine(activeScenario.openingLine, {
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    })
  }

  return (
    <article className="dashboard-panel ai-panel">
      <div className="ai-panel__orb ai-panel__orb--one" aria-hidden="true" />
      <div className="ai-panel__orb ai-panel__orb--two" aria-hidden="true" />

      <div className="ai-panel__top">
        <span className="ai-chip">
          <SparkIcon />
          AI Script &amp; Voice Studio
        </span>
        <span className="ai-live">
          <span />
          99.2% Natural Cadence
        </span>
      </div>

      <div className="ai-panel__intro">
        <h2>Make every message feel ultra-personal.</h2>
        <p>
          CallWave dynamically generates tailored conversational hooks and WhatsApp voice notes using CRM context, past interactions, and buyer intent.
        </p>
      </div>

      <div className="scenario-selector-tabs" role="tablist" aria-label="Target persona scenarios">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={selectedScenarioId === s.id}
            className={`scenario-tab-btn ${selectedScenarioId === s.id ? 'is-active' : ''}`}
            onClick={() => {
              stopAgentSpeech()
              setIsPlaying(false)
              setSelectedScenarioId(s.id)
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="ai-message-card">
        <div className="ai-message-card__head">
          <Avatar name={activeScenario.name} />
          <span>
            <strong>{activeScenario.name}</strong>
            <small>{activeScenario.role} · {activeScenario.location}</small>
          </span>

          <button
            type="button"
            className={`ai-message-card__play ${isPlaying ? 'is-playing' : ''}`}
            aria-label={isPlaying ? 'Pause AI voice' : 'Play AI voice message preview'}
            onClick={handlePlayAudio}
          >
            {isPlaying ? (
              <span className="mini-sound-wave" aria-hidden="true">
                <span /><span /><span />
              </span>
            ) : (
              <PlayIcon />
            )}
          </button>
        </div>

        <div className="ai-message-card__script">
          <p className="ai-message-card__copy">
            {activeScenario.highlightedParts.map((part, index) =>
              part.isVariable ? (
                <mark key={index} className="prompt-variable">
                  {part.text}
                </mark>
              ) : (
                <span key={index}>{part.text}</span>
              ),
            )}
          </p>
        </div>

        <div className="ai-message-card__footer">
          <span className="agent-voice-tag">
            <HeadsetIcon />
            {activeScenario.agentName} ({activeScenario.voiceTag})
          </span>
          <span className="voice-duration-pill">{activeScenario.duration}</span>
        </div>
      </div>

      <div className="ai-panel__result">
        <CheckCircleIcon />
        <span>
          <strong>{activeScenario.uplift}</strong>
          vs generic static outreach templates
        </span>
      </div>

      <div className="ai-panel-actions">
        <button
          type="button"
          className="ai-cta"
          onClick={() => {
            onNotice('Opening AI Studio & Voice Engine workspace...')
            navigate('/ai-studio')
          }}
        >
          <span>Open AI Studio</span>
          <ArrowRightIcon />
        </button>
        <button
          type="button"
          className="voice-clone-btn"
          onClick={() => {
            onNotice('Opening Voice Engine Studio...')
            navigate('/ai-studio')
          }}
        >
          Generate Voice Note
        </button>
      </div>
    </article>
  )
}
