import { useEffect, useRef, useState } from 'react'
import { speakAgentLine, stopAgentSpeech } from '../../lib/audioVoice'
import { SparkIcon } from '../icons'
import { CloseIcon, HeadsetIcon, PhoneOutlineIcon } from './DashboardIcons'

type CallSimulatorModalProps = {
  initialLeadName?: string
  onClose: () => void
  onNotice: (message: string) => void
}

type AgentPersona = {
  id: string
  name: string
  title: string
  tone: string
  greeting: string
  responses: Record<string, string>
}

const PERSONAS: AgentPersona[] = [
  {
    id: 'aria',
    name: 'Aria',
    title: 'Enterprise Closer',
    tone: 'Confident, articulate, sub-110ms response',
    greeting:
      'Hello there! This is Aria with CallWave. I noticed you were exploring our autonomous voice calling engine. Did you want to see how we handle outbound qualification or incoming customer support?',
    responses: {
      pricing:
        'Our growth tier starts with 5,000 conversational minutes and zero per-seat fees. You get Twilio SIP trunks, custom voice cloning, and direct CRM sync. Should I email you our rate sheet?',
      demo:
        'I would love to set that up! I have an opening this Thursday at 3:00 PM with our solutions architect. Would that slot work for you?',
      callback:
        'Not a problem at all! I have locked in a callback for tomorrow at 2:00 PM sharp. Have a great day!',
      default:
        'That is a great question. CallWave connects directly to your Postgres or CRM and uses low-latency speech-to-speech to ensure zero robotic pauses. Would you like to test a 10-contact pilot?',
    },
  },
  {
    id: 'maya',
    name: 'Maya',
    title: 'Real Estate & Luxury Advisor',
    tone: 'Warm, empathetic, natural inflection',
    greeting:
      'Hi! Maya here from Prestige Luxe Residences. I saw you were looking at 3BHK residences in Whitefield. Are you looking for self-use or an investment asset?',
    responses: {
      pricing:
        'The 3BHK residences start at 1.85 Cr with pre-launch zero-registration benefits. Would you like me to send the complete floor plan and payment breakdown to your WhatsApp?',
      demo:
        'Wonderful! We have our VIP show apartment open this Saturday from 10 AM to 4 PM. Can I reserve your visitor pass for 11 AM?',
      callback:
        'Understood! I will schedule a short follow-up call tomorrow afternoon. Thank you for your time!',
      default:
        'Our development features private garden terraces, clubhouse amenities, and EV charging bays. I can send the video walkthrough right to your phone if you like.',
    },
  },
  {
    id: 'liam',
    name: 'Liam',
    title: 'Fintech & Compliance Specialist',
    tone: 'Authoritative, concise, executive tone',
    greeting:
      'Good day. Liam calling from CallWave Banking Solutions. I understand you are reviewing automated payment reminders and compliance verification.',
    responses: {
      pricing:
        'Enterprise pricing includes SOC2 Type II certification, ephemeral audio processing, and dedicated high-throughput SIP trunks. We customize SLAs based on volume.',
      demo:
        'I can schedule a compliance review with our chief security officer on Friday at 11 AM. Does that align with your team?',
      callback:
        'Certainly. I have queued an automated reminder for tomorrow at 2 PM. Good day.',
      default:
        'We adhere to strict banking regulations with zero persistent audio storage and real-time PII redaction on every voice stream.',
    },
  },
]

export function CallSimulatorModal({
  initialLeadName = 'Alex Mercer',
  onClose,
  onNotice,
}: CallSimulatorModalProps) {
  const [selectedPersona, setSelectedPersona] = useState<AgentPersona>(PERSONAS[0])
  const [leadName, setLeadName] = useState(initialLeadName)
  const [callState, setCallState] = useState<'idle' | 'dialing' | 'connected' | 'ended'>('idle')
  const [duration, setDuration] = useState(0)
  const [isAiSpeaking, setIsAiSpeaking] = useState(false)
  const [userReply, setUserReply] = useState('')
  const [messages, setMessages] = useState<{ sender: 'AI' | 'User'; text: string; time: string }[]>([])
  const [isListeningUser, setIsListeningUser] = useState(false)
  const speechRecognitionRef = useRef<any>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (speechRecognitionRef.current) {
          try {
            speechRecognitionRef.current.stop()
          } catch {}
        }
        stopAgentSpeech()
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop()
        } catch {}
      }
      stopAgentSpeech()
    }
  }, [onClose])

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined
    if (callState === 'connected') {
      timer = setInterval(() => setDuration((d) => d + 1), 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [callState])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isAiSpeaking])

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  function handleStartCall() {
    setCallState('dialing')
    setMessages([])
    setDuration(0)

    setTimeout(() => {
      setCallState('connected')
      setIsAiSpeaking(true)

      const greeting = selectedPersona.greeting
      setMessages([{ sender: 'AI', text: greeting, time: '00:01' }])

      speakAgentLine(greeting, {
        onEnd: () => setIsAiSpeaking(false),
        onError: () => setIsAiSpeaking(false),
      })
    }, 1600)
  }

  function handleUserSend(textToSend?: string) {
    const text = (textToSend || userReply).trim()
    if (!text || callState !== 'connected') return

    const nowTime = formatTime(duration)
    setMessages((prev) => [...prev, { sender: 'User', text, time: nowTime }])
    setUserReply('')
    stopAgentSpeech()
    setIsAiSpeaking(true)

    // Match simulated response
    setTimeout(() => {
      const lower = text.toLowerCase()
      let reply = selectedPersona.responses.default

      if (lower.includes('price') || lower.includes('cost') || lower.includes('rate') || lower.includes('fee')) {
        reply = selectedPersona.responses.pricing
      } else if (lower.includes('demo') || lower.includes('meeting') || lower.includes('visit') || lower.includes('time') || lower.includes('slot')) {
        reply = selectedPersona.responses.demo
      } else if (lower.includes('busy') || lower.includes('later') || lower.includes('tomorrow') || lower.includes('callback')) {
        reply = selectedPersona.responses.callback
      }

      setMessages((prev) => [...prev, { sender: 'AI', text: reply, time: formatTime(duration + 1) }])

      speakAgentLine(reply, {
        onEnd: () => setIsAiSpeaking(false),
        onError: () => setIsAiSpeaking(false),
      })
    }, 800)
  }

  function handleEndCall() {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop()
      } catch {}
    }
    setIsListeningUser(false)
    stopAgentSpeech()
    setCallState('ended')
    setIsAiSpeaking(false)
  }

  function handleToggleMic() {
    if (isListeningUser) {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop()
        } catch {}
      }
      setIsListeningUser(false)
      if (userReply.trim()) {
        handleUserSend()
      }
      return
    }

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognitionClass) {
      onNotice('Speech recognition is not supported in this browser. Please type or use quick replies.')
      return
    }

    try {
      const recognition = new SpeechRecognitionClass()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsListeningUser(true)
        onNotice('Microphone active. Speak your question or reply…')
      }

      recognition.onresult = (event: any) => {
        let transcript = ''
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        setUserReply(transcript)
      }

      recognition.onend = () => {
        setIsListeningUser(false)
      }

      recognition.onerror = () => {
        setIsListeningUser(false)
      }

      recognition.start()
      speechRecognitionRef.current = recognition
    } catch {
      setIsListeningUser(false)
      onNotice('Unable to access microphone for speech recognition.')
    }
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="call-simulator-modal" role="dialog" aria-modal="true" aria-labelledby="simulator-title">
        <div className="simulator-header">
          <div className="simulator-title-group">
            <span className="simulator-icon">
              <PhoneOutlineIcon />
            </span>
            <div>
              <h3 id="simulator-title">Interactive AI Voice Call Tester</h3>
              <p>Simulate real-time autonomous voice conversations in browser</p>
            </div>
          </div>
          <button
            type="button"
            className="campaign-modal__close"
            onClick={() => {
              stopAgentSpeech()
              onClose()
            }}
            aria-label="Close modal"
          >
            <CloseIcon />
          </button>
        </div>

        {callState === 'idle' && (
          <div className="simulator-setup-view">
            <div className="simulator-grid-config">
              <div className="config-block">
                <label className="field-label">Select Voice Agent Persona</label>
                <div className="persona-picker">
                  {PERSONAS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`persona-card ${selectedPersona.id === p.id ? 'is-selected' : ''}`}
                      onClick={() => setSelectedPersona(p)}
                    >
                      <div className="persona-card__top">
                        <HeadsetIcon />
                        <strong>{p.name}</strong>
                      </div>
                      <span className="persona-title">{p.title}</span>
                      <small className="persona-tone">{p.tone}</small>
                    </button>
                  ))}
                </div>
              </div>

              <div className="config-block">
                <label className="field-label" htmlFor="lead-name-input">
                  Test Lead Name
                </label>
                <div className="lead-name-input-row">
                  <input
                    id="lead-name-input"
                    type="text"
                    className="simulator-input"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="Enter lead name"
                  />
                  <button
                    type="button"
                    className="lead-quick-pick"
                    onClick={() => setLeadName('Vikram Mehta (VP Sales)')}
                  >
                    Use Sample Lead
                  </button>
                </div>
              </div>
            </div>

            <div className="simulator-telemetry-preview">
              <div className="telemetry-item">
                <span>Latency</span>
                <strong>114ms</strong>
              </div>
              <div className="telemetry-item">
                <span>Audio Engine</span>
                <strong>Web Audio + Neural TTS</strong>
              </div>
              <div className="telemetry-item">
                <span>Carrier Mode</span>
                <strong>Full Duplex SIP</strong>
              </div>
            </div>

            <div className="simulator-actions">
              <button
                type="button"
                className="dash-button dash-button--ghost"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="dash-button dash-button--primary simulator-launch-btn"
                onClick={handleStartCall}
              >
                <PhoneOutlineIcon />
                <span>Initiate AI Voice Call</span>
              </button>
            </div>
          </div>
        )}

        {callState === 'dialing' && (
          <div className="simulator-dialing-view">
            <div className="dialing-ripple">
              <div className="ripple-circle ripple-1" />
              <div className="ripple-circle ripple-2" />
              <div className="ripple-avatar">
                <PhoneOutlineIcon />
              </div>
            </div>
            <h4>Dialing {leadName}…</h4>
            <p>Connecting to {selectedPersona.name} ({selectedPersona.title})</p>
            <span className="dialing-carrier">Twilio Carrier Trunk: Connected</span>
          </div>
        )}

        {callState === 'connected' && (
          <div className="simulator-active-view">
            <div className="active-call-hud">
              <div className="hud-agent-info">
                <div className="hud-avatar">
                  <span className="hud-pulse" />
                  <strong>{selectedPersona.name[0]}</strong>
                </div>
                <div>
                  <h4>{selectedPersona.name} · {selectedPersona.title}</h4>
                  <p>In call with <strong>{leadName}</strong></p>
                </div>
              </div>

              <div className="hud-metrics">
                <div className="call-live-clock">
                  <span className="live-rec-dot" />
                  <strong>{formatTime(duration)}</strong>
                </div>
                <span className="sentiment-live-pill">🔥 96% Intent</span>
              </div>
            </div>

            <div className="waveform-display">
              <div className={`waveform-bars ${isAiSpeaking ? 'is-active' : ''}`}>
                <span /><span /><span /><span /><span /><span /><span /><span />
                <span /><span /><span /><span /><span /><span /><span /><span />
              </div>
              <span className="speaking-status">
                {isAiSpeaking ? `🔊 ${selectedPersona.name} is speaking…` : 'Listening for your response…'}
              </span>
            </div>

            <div className="live-dialogue-box">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`dialogue-bubble dialogue-bubble--${m.sender.toLowerCase()}`}
                >
                  <div className="bubble-speaker">
                    <span>{m.sender === 'AI' ? `${selectedPersona.name} (AI)` : 'You (Lead)'}</span>
                    <time>{m.time}</time>
                  </div>
                  <p>{m.text}</p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="quick-replies-tray">
              <span className="quick-replies-label">Suggested Replies:</span>
              <button
                type="button"
                className="reply-chip"
                onClick={() => handleUserSend('What is your pricing and volume discounts?')}
              >
                “What is your pricing?”
              </button>
              <button
                type="button"
                className="reply-chip"
                onClick={() => handleUserSend('Can we book a live demonstration this week?')}
              >
                “Can we book a live demo?”
              </button>
              <button
                type="button"
                className="reply-chip"
                onClick={() => handleUserSend('I am busy right now, please call me tomorrow at 2 PM.')}
              >
                “Call me tomorrow at 2 PM”
              </button>
            </div>

            <div className="simulator-input-bar">
              <input
                type="text"
                value={userReply}
                onChange={(e) => setUserReply(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUserSend()}
                placeholder={isListeningUser ? 'Listening… speak into your microphone' : 'Type or speak what the lead says…'}
                className={`simulator-chat-input ${isListeningUser ? 'ring-2 ring-red-400 bg-red-50/40' : ''}`}
              />
              <button
                type="button"
                className={`simulator-mic-btn ${isListeningUser ? 'is-active' : ''}`}
                onClick={handleToggleMic}
                title={isListeningUser ? 'Listening… click to stop & send' : 'Speak into microphone'}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              </button>
              <button
                type="button"
                className="simulator-send-btn"
                onClick={() => handleUserSend()}
                disabled={!userReply.trim()}
              >
                Send
              </button>
              <button
                type="button"
                className="simulator-hangup-btn"
                onClick={handleEndCall}
              >
                Hang Up
              </button>
            </div>
          </div>
        )}

        {callState === 'ended' && (
          <div className="simulator-summary-view">
            <div className="summary-banner">
              <span className="summary-check">✓</span>
              <h4>Call Completed Successfully</h4>
              <p>Total duration: {formatTime(duration)} · High-resolution AI transcript generated</p>
            </div>

            <div className="summary-cards-grid">
              <div className="summary-card">
                <span className="card-kicker">Call Sentiment</span>
                <strong>Positive (96% Intent Score)</strong>
                <p>Lead engaged enthusiastically with pricing and scheduling hooks.</p>
              </div>

              <div className="summary-card">
                <span className="card-kicker">CRM Action Item</span>
                <strong>Calendar Invite Dispatched</strong>
                <p>Lead added to qualified pipeline with $48,000 estimated deal value.</p>
              </div>

              <div className="summary-card">
                <span className="card-kicker">Voice Engine Performance</span>
                <strong>114ms Latency · 0 Packet Drops</strong>
                <p>Synthesized natural inflection with zero robot cadence artifacts.</p>
              </div>
            </div>

            <div className="summary-actions">
              <button
                type="button"
                className="dash-button dash-button--ghost"
                onClick={() => {
                  setCallState('idle')
                  setMessages([])
                }}
              >
                Test Another Persona
              </button>
              <button
                type="button"
                className="dash-button dash-button--primary"
                onClick={() => {
                  onNotice(`Call log for ${leadName} exported to CRM pipeline.`)
                  onClose()
                }}
              >
                <SparkIcon />
                <span>Save to CRM &amp; Close</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
