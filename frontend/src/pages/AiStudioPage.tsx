import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../components/dashboard/DashboardLayout'
import {
  CheckCircleIcon,
  CopyIcon,
  HeadsetIcon,
  PauseIcon,
  PlayIcon,
  SendIcon,
  TrashIcon,
  WhatsAppIcon,
} from '../components/dashboard/DashboardIcons'
import { ArrowRightIcon, SparkIcon } from '../components/icons'
import { Toast } from '../components/dashboard/Toast'
import { speakAgentLine, stopAgentSpeech } from '../lib/audioVoice'
import { usePageTitle } from '../lib/usePageTitle'

type SimpleTab = 'generator' | 'voices' | 'test-chat'
type ToneOption = 'Urgent VIP' | 'Friendly & Warm' | 'Professional B2B' | 'Short & Punchy'

interface VoiceOption {
  id: string
  name: string
  role: string
  accent: string
  gender: string
  avatarColor: string
  sampleText: string
  badge?: string
}

interface ChatMessage {
  id: string
  sender: 'user' | 'agent'
  text: string
  timestamp: string
}

const VOICES: VoiceOption[] = [
  {
    id: 'elena',
    name: 'Elena Vance',
    role: 'Consultative B2B Closer',
    accent: 'US West Coast',
    gender: 'Female',
    avatarColor: 'from-emerald-500 to-teal-600',
    badge: 'Popular',
    sampleText: 'Hi Sarah, Elena here with CallWave! I noticed you were exploring our WhatsApp automation fleet. Quick question: are you looking to automate lead follow-ups or boost demo bookings?',
  },
  {
    id: 'marcus',
    name: 'Marcus Kane',
    role: 'High-Energy Sales Closer',
    accent: 'US East Coast',
    gender: 'Male',
    avatarColor: 'from-amber-500 to-orange-600',
    badge: 'High Conversion',
    sampleText: 'Hey there! Marcus from CallWave. Look, you have only a few hours left on that VIP unlock voucher. I can apply your 20% discount right now—want me to lock it in?',
  },
  {
    id: 'aria',
    name: 'Aria Sterling',
    role: 'Luxury & VIP Concierge',
    accent: 'British RP',
    gender: 'Female',
    avatarColor: 'from-purple-500 to-indigo-600',
    sampleText: 'Good afternoon. Aria here from the private desk. It is a pleasure to connect. I have prepared your customized itinerary and would be delighted to schedule a private walkthrough.',
  },
  {
    id: 'david',
    name: 'David Chen',
    role: 'Technical Solutions Architect',
    accent: 'Neutral International',
    gender: 'Male',
    avatarColor: 'from-blue-500 to-cyan-600',
    sampleText: 'Hello Sarah, David Chen with engineering. Our WhatsApp messaging fleet supports direct CRM sync with sub-100ms response time. Would you like a quick walkthrough?',
  },
]

const QUICK_PROMPTS = [
  { label: '🛒 Cart Abandonment', text: 'Customer left $350 items in cart. Give them 20% off code VIP20 expiring tonight.' },
  { label: '⚡ Flash Sale Promo', text: 'Announce 48-hour weekend flash sale with code FLASH30 and free shipping.' },
  { label: '📅 VIP Demo Invitation', text: 'Invite high-intent B2B lead to a 15-minute product demo with personal meeting link.' },
  { label: '👋 Re-engage Inactive Lead', text: 'Gentle follow-up asking if they still need help automating their WhatsApp customer replies.' },
]

export function AiStudioPage() {
  usePageTitle('AI Studio | CallWave')
  const navigate = useNavigate()

  // State: Active Tab
  const [activeTab, setActiveTab] = useState<SimpleTab>('generator')

  // Toast
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null)
  const notify = useCallback((message: string) => {
    setToast({ id: Date.now(), message })
  }, [])
  const closeToast = useCallback(() => setToast(null), [])

  // State: Voice Model
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('elena')
  const activeVoice = useMemo(
    () => VOICES.find((v) => v.id === selectedVoiceId) || VOICES[0],
    [selectedVoiceId],
  )
  const [voiceRate, setVoiceRate] = useState<number>(1.0)
  const [isPlayingVoice, setIsPlayingVoice] = useState<boolean>(false)
  const [testSpeechText, setTestSpeechText] = useState<string>(activeVoice.sampleText)

  // State: Generator
  const [promptInput, setPromptInput] = useState<string>(
    'Customer left items in cart valued at $420. Offer 20% discount code VIP40 expiring at midnight.',
  )
  const [selectedTone, setSelectedTone] = useState<ToneOption>('Urgent VIP')
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [generatedMessage, setGeneratedMessage] = useState<string>(
    'Hey {{first_name}}! ⚡ Marcus here from CallWave. You left items in your cart ($420). I just unlocked an exclusive 20% discount with code [{{discount_code}}] valid until midnight. Want me to apply it for you now?',
  )

  // State: Chat Sandbox
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'agent',
      text: 'Hi Sarah! Elena here from CallWave. Noticed you were checking out our WhatsApp sales automation. What is your team looking to improve most right now?',
      timestamp: '10:45 AM',
    },
  ])
  const [chatInput, setChatInput] = useState<string>('')
  const [isAgentTyping, setIsAgentTyping] = useState<boolean>(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Sync test text when voice changes
  useEffect(() => {
    setTestSpeechText(activeVoice.sampleText)
  }, [activeVoice])

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      stopAgentSpeech()
    }
  }, [])

  // Auto scroll chat
  useEffect(() => {
    if (activeTab === 'test-chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages, isAgentTyping, activeTab])

  // Speech helper
  const handleToggleSpeech = (textToPlay: string) => {
    if (isPlayingVoice) {
      stopAgentSpeech()
      setIsPlayingVoice(false)
      return
    }

    setIsPlayingVoice(true)
    speakAgentLine(textToPlay, {
      voiceRate,
      onEnd: () => setIsPlayingVoice(false),
      onError: () => setIsPlayingVoice(false),
    })
  }

  // Generate Message Handler
  const handleGenerate = () => {
    if (!promptInput.trim()) return
    setIsGenerating(true)
    notify('AI is crafting high-converting WhatsApp message...')

    setTimeout(() => {
      let output = ''
      if (selectedTone === 'Urgent VIP') {
        output = `⚡ {{first_name}}, urgent heads up! Your reserved 20% code [{{discount_code}}] expires at 11:59 PM tonight. Tap below to claim your spot before rates return to normal:`
      } else if (selectedTone === 'Friendly & Warm') {
        output = `Hi {{first_name}}! 😊 Hope you are having a wonderful day. Noticed you were looking at our setup yesterday. I can activate code [{{discount_code}}] for 20% off if you would like to test it today. Let me know!`
      } else if (selectedTone === 'Short & Punchy') {
        output = `Hey {{first_name}}! 20% off code [{{discount_code}}] is active for your cart until midnight. Tap to claim now: {{link}}`
      } else {
        output = `Hello {{first_name}}, this is ${activeVoice.name} with CallWave. I noticed you were exploring our outreach fleet for {{company}}. We have authorized code [{{discount_code}}] for your trial. Should I send over the activation details?`
      }

      setGeneratedMessage(output)
      setIsGenerating(false)
      notify('WhatsApp message generated successfully!')
    }, 700)
  }

  // Chat send handler
  const handleSendChat = (messageText?: string) => {
    const text = messageText || chatInput
    if (!text.trim()) return

    const newMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setChatMessages((prev) => [...prev, newMsg])
    if (!messageText) setChatInput('')
    setIsAgentTyping(true)

    setTimeout(() => {
      let reply = `Thanks for reaching out! CallWave connects directly to your WhatsApp Business number with sub-100ms response times. Would you like to test a live 5-minute pilot?`

      if (text.toLowerCase().includes('discount') || text.toLowerCase().includes('price')) {
        reply = `We can definitely set up a 20% discount on your first 3 months with code VIP40! Should I apply it to your account right now?`
      } else if (text.toLowerCase().includes('call') || text.toLowerCase().includes('phone')) {
        reply = `I can arrange a quick 10-minute walkthrough with our team today, or send a detailed video tour straight to your WhatsApp. Which do you prefer?`
      }

      const agentReply: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      setChatMessages((prev) => [...prev, agentReply])
      setIsAgentTyping(false)
    }, 800)
  }

  return (
    <DashboardLayout
      search=""
      activeNav="ai-studio"
      searchPlaceholder="Search AI tools..."
      onSearchChange={() => {}}
      onNotice={notify}
      onNewCampaign={() => navigate('/campaigns')}
    >
      <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6">
        {/* Clean, Premium Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Studio</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                CallWave Neural AI
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Generate persuasive WhatsApp messages, customize agent tones, and test realistic voice synthesis.
            </p>
          </div>

          {/* Quick Active Voice Selector */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500">Active Voice:</span>
            <select
              value={selectedVoiceId}
              onChange={(e) => setSelectedVoiceId(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
            >
              {VOICES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.role.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3 Main Focused Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'generator'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <WhatsAppIcon className="w-4 h-4" />
            <span>WhatsApp Copy Generator</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('voices')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'voices'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <HeadsetIcon className="w-4 h-4" />
            <span>AI Voice &amp; Audio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('test-chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'test-chat'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <SparkIcon className="w-4 h-4" />
            <span>Test Chat</span>
          </button>
        </div>

        {/* TAB 1: WhatsApp Message Generator (MAIN FEATURE) */}
        {activeTab === 'generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 Columns: Input & Controls */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-stripe space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  1. What do you want to offer or say?
                </label>
                <textarea
                  rows={3}
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="Describe your offer, discount, or follow-up in simple words..."
                  className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 leading-relaxed"
                />

                {/* Quick Pre-fill Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {QUICK_PROMPTS.map((qp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPromptInput(qp.text)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-[11px] font-medium text-slate-600 transition cursor-pointer"
                    >
                      {qp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  2. Select Persuasion Tone:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Urgent VIP', 'Friendly & Warm', 'Professional B2B', 'Short & Punchy'] as ToneOption[]).map(
                    (tone) => (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => setSelectedTone(tone)}
                        className={`p-2 rounded-xl text-xs font-bold transition border cursor-pointer text-center ${
                          selectedTone === tone
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {tone}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isGenerating || !promptInput.trim()}
                  onClick={handleGenerate}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 transition cursor-pointer disabled:opacity-60 active:scale-99"
                >
                  <SparkIcon className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? 'Generating WhatsApp Message...' : 'Generate WhatsApp Copy'}</span>
                </button>
              </div>

              {/* Tips */}
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 space-y-1 border border-slate-100">
                <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Auto-Formatted for WhatsApp Compliance</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Automatically inserts variables like <code className="text-emerald-700 font-bold">&#123;&#123;first_name&#125;&#125;</code> and <code className="text-emerald-700 font-bold">&#123;&#123;discount_code&#125;&#125;</code> for instant campaign personalization.
                </p>
              </div>
            </div>

            {/* Right 5 Columns: Realistic WhatsApp Phone Preview */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-stripe space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Live WhatsApp Preview
                </h3>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  ~{generatedMessage.length} characters
                </span>
              </div>

              {/* WhatsApp Bubble Container */}
              <div
                className="p-4 rounded-2xl min-h-[220px] flex flex-col justify-between"
                style={{
                  backgroundColor: '#efeae2',
                  backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                }}
              >
                {/* Simulated Bubble */}
                <div className="bg-white rounded-2xl rounded-tl-xs p-3.5 shadow-xs text-slate-800 space-y-2 border border-slate-200/60 max-w-[95%]">
                  <p className="text-xs leading-relaxed whitespace-pre-wrap font-sans">
                    {generatedMessage
                      .replace('{{first_name}}', 'Sarah')
                      .replace('{{discount_code}}', 'VIP40')
                      .replace('{{company}}', 'Aura Tech')
                      .replace('{{link}}', 'callwave.ai/vip40')}
                  </p>

                  <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400">
                    <span>10:45 AM</span>
                    <span className="text-sky-500 font-bold">✓✓</span>
                  </div>
                </div>

                {/* Bubble Action Buttons */}
                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => handleToggleSpeech(generatedMessage.replace(/\{\{.*?\}\}/g, ''))}
                    className="flex-1 py-2 bg-white/90 hover:bg-white text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs border border-slate-300/80 cursor-pointer"
                  >
                    {isPlayingVoice ? (
                      <>
                        <PauseIcon className="w-3.5 h-3.5 text-rose-600" />
                        <span>Stop Voice</span>
                      </>
                    ) : (
                      <>
                        <PlayIcon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Listen Aloud</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedMessage)
                      notify('Copied message to clipboard!')
                    }}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <CopyIcon className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </button>
                </div>
              </div>

              {/* Push to Campaigns CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/campaigns')}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Use This Message in New Campaign</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI Voice & Audio (MAIN FEATURE) */}
        {activeTab === 'voices' && (
          <div className="space-y-6">
            {/* Quick Test Voice Bar */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-stripe space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Live Voice Synthesizer ({activeVoice.name})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Test how this AI voice speaks any custom sentence or customer script.
                  </p>
                </div>

                {/* Speed Toggle */}
                <div className="flex items-center gap-2 text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-500">Speed:</span>
                  {[0.9, 1.0, 1.15].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setVoiceRate(rate)}
                      className={`px-2 py-0.5 rounded-md font-bold transition ${
                        voiceRate === rate ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={testSpeechText}
                  onChange={(e) => setTestSpeechText(e.target.value)}
                  placeholder="Type anything for the agent to say..."
                  className="flex-1 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 outline-none focus:border-emerald-500"
                />

                <button
                  type="button"
                  onClick={() => handleToggleSpeech(testSpeechText)}
                  className={`px-6 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs ${
                    isPlayingVoice
                      ? 'bg-rose-500 hover:bg-rose-600 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {isPlayingVoice ? (
                    <>
                      <PauseIcon className="w-4 h-4" />
                      <span>Stop Speech</span>
                    </>
                  ) : (
                    <>
                      <PlayIcon className="w-4 h-4" />
                      <span>Speak Aloud</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Voice Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {VOICES.map((voice) => {
                const isSelected = voice.id === selectedVoiceId
                return (
                  <div
                    key={voice.id}
                    onClick={() => setSelectedVoiceId(voice.id)}
                    className={`p-5 rounded-2xl border transition cursor-pointer relative ${
                      isSelected
                        ? 'bg-emerald-50/50 border-emerald-500 shadow-sm ring-1 ring-emerald-500/20'
                        : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${voice.avatarColor} text-white flex items-center justify-center font-extrabold text-base shadow-2xs`}
                        >
                          {voice.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-extrabold text-slate-900">{voice.name}</h4>
                            {voice.badge && (
                              <span className="px-2 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                {voice.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">{voice.role} • {voice.accent}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedVoiceId(voice.id)
                          handleToggleSpeech(voice.sampleText)
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <PlayIcon className="w-3 h-3" />
                        <span>Sample</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2 italic">
                      &quot;{voice.sampleText}&quot;
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB 3: Test Chat Sandbox (MAIN FEATURE) */}
        {activeTab === 'test-chat' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-stripe flex flex-col h-[520px] overflow-hidden">
            {/* Top Bar */}
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-extrabold text-slate-800">
                  Chatting with {activeVoice.name} ({activeVoice.role})
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setChatMessages([
                    {
                      id: 'msg-1',
                      sender: 'agent',
                      text: `Hi Sarah! ${activeVoice.name} here from CallWave. How can I help you today?`,
                      timestamp: '10:45 AM',
                    },
                  ])
                  notify('Chat cleared.')
                }}
                className="text-xs font-semibold text-slate-400 hover:text-rose-600 transition cursor-pointer flex items-center gap-1"
              >
                <TrashIcon className="w-3 h-3" />
                <span>Clear Chat</span>
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3.5 bg-[#fbfcfc]">
              {chatMessages.map((m) => {
                const isAgent = m.sender === 'agent'
                return (
                  <div key={m.id} className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}>
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                      <span className="font-bold text-slate-600">{isAgent ? activeVoice.name : 'You (Lead)'}</span>
                      <span>• {m.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-2xs ${
                        isAgent
                          ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                          : 'bg-emerald-600 text-white rounded-tr-xs font-medium'
                      }`}
                    >
                      <p>{m.text}</p>

                      {isAgent && (
                        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => handleToggleSpeech(m.text)}
                            className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <HeadsetIcon className="w-3 h-3" />
                            <span>{isPlayingVoice ? 'Stop' : 'Listen'}</span>
                          </button>
                          <span className="text-[10px] text-slate-400">AI Response</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {isAgentTyping && (
                <div className="text-xs text-slate-400 italic flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>{activeVoice.name} is typing...</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Quick Objection Chips */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-1.5">
              <span className="text-[11px] text-slate-400 font-semibold self-center">Quick Test:</span>
              {[
                'Can I get a discount for 5,000 messages?',
                'Can someone call me on WhatsApp right now?',
                'How does your AI voice work?',
              ].map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendChat(q)}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-800 text-[11px] text-slate-600 rounded-lg border border-slate-200 transition cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder={`Type a test message to ${activeVoice.name}...`}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => handleSendChat()}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <span>Send</span>
                <SendIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast Alert */}
      {toast && <Toast message={toast.message} onClose={closeToast} />}
    </DashboardLayout>
  )
}
