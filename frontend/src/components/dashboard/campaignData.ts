export type CampaignStatus = 'Active' | 'Paused' | 'Draft' | 'Completed' | 'Scheduled'

export type Campaign = {
  id: string
  name: string
  channel: string
  meta: string
  status: CampaignStatus
  progress: number
  connectRate: string
  contacts: number
  aiPersonalized: boolean
  description?: string
  agentName?: string
  agentVoice?: string
  targetAudience?: string
  dialedContacts?: number
  connectedContacts?: number
  bookedCount?: number
  callsPerMinute?: number
  schedule?: string
  scriptSnippet?: string
  avgDuration?: string
  sentimentScore?: number
  budgetSpent?: string
  createdDate?: string
  channelType?: 'ai-voice' | 'voice-sms' | 'whatsapp-voice' | 'inbound-ai'
}

export type Audience = {
  id: string
  label: string
  detail: string
  contacts: number
}

export type LiveCall = {
  id: string
  leadName: string
  leadRole: string
  company: string
  location: string
  agentName: string
  agentModel: string
  durationSeconds: number
  status: 'Live' | 'Wrapping up' | 'Completed'
  sentiment: 'High Intent' | 'Interested' | 'Inquiring' | 'Meeting Booked'
  intentScore: number
  topic: string
  speechLine: string
  transcript: { speaker: 'AI' | 'Lead'; text: string; time: string }[]
}

export type PriorityLead = {
  id: string
  name: string
  company: string
  role: string
  dealValue: string
  score: number
  intent: 'High' | 'Warm' | 'Urgent'
  phone: string
  lastActivity: string
  note: string
}

export type CallTranscriptItem = {
  id: string
  contactName: string
  company: string
  agentName: string
  duration: string
  timeAgo: string
  sentiment: 'Positive' | 'Neutral' | 'Meeting Booked' | 'Callback'
  summary: string
  actionItem: string
}

export const CAMPAIGNS: Campaign[] = [
  {
    id: 'q4-reactivation',
    name: 'Q4 Reactivation & Renewal',
    channel: 'WhatsApp Bulk + AI',
    meta: 'Existing customers · Oct 14',
    status: 'Active',
    progress: 68,
    connectRate: '72.4%',
    contacts: 2480,
    dialedContacts: 1686,
    connectedContacts: 1220,
    bookedCount: 184,
    callsPerMinute: 24,
    agentName: 'Aria',
    agentVoice: 'ElevenLabs Turbo · Aria (Executive Closer)',
    targetAudience: 'Inactive Enterprise Accounts (6+ mo)',
    schedule: 'Mon - Fri, 9:00 AM - 5:30 PM EST',
    scriptSnippet:
      'Hi {{first_name}}, Aria here from CallWave. Noticed your enterprise license renewal is coming up. I can lock in your grandfathered tier if we review before Friday.',
    avgDuration: '2m 38s',
    sentimentScore: 88,
    budgetSpent: '$640 / $1,200',
    createdDate: 'Oct 14, 2026',
    channelType: 'ai-voice',
    aiPersonalized: true,
    description:
      'High-priority renewal campaign targeting enterprise accounts due for Q4 license renewal with personalized ROI incentives.',
  },
  {
    id: 'whitefield-launch',
    name: 'Whitefield Property Launch',
    channel: 'WhatsApp Bulk',
    meta: 'Real estate leads · Oct 12',
    status: 'Active',
    progress: 42,
    connectRate: '61.8%',
    contacts: 1260,
    dialedContacts: 529,
    connectedContacts: 327,
    bookedCount: 52,
    callsPerMinute: 16,
    agentName: 'Maya',
    agentVoice: 'Cartesia Sonic · Maya (Property Specialist)',
    targetAudience: 'High-Net-Worth Bangalore Investors',
    schedule: 'Tue - Sun, 10:00 AM - 7:00 PM IST',
    scriptSnippet:
      'Hello {{first_name}}, Maya following up from Prestige Luxe. We have released exclusive corner penthouse show flats for this weekend. Can I reserve your VIP pass?',
    avgDuration: '3m 15s',
    sentimentScore: 92,
    budgetSpent: '$320 / $800',
    createdDate: 'Oct 12, 2026',
    channelType: 'ai-voice',
    aiPersonalized: true,
    description:
      'VIP property tour invitations for pre-qualified HNIs interested in 3BHK/4BHK luxury penthouses.',
  },
  {
    id: 'fintech-saas-outreach',
    name: 'FinTech CFO Pipeline',
    channel: 'WhatsApp Broadcast',
    meta: 'High-ACV Leads · Oct 18',
    status: 'Active',
    progress: 54,
    connectRate: '68.9%',
    contacts: 1820,
    dialedContacts: 982,
    connectedContacts: 677,
    bookedCount: 96,
    callsPerMinute: 20,
    agentName: 'Liam',
    agentVoice: 'OpenAI Realtime · Liam (Fintech Specialist)',
    targetAudience: 'Series B+ FinTech CFOs & Controllers',
    schedule: 'Mon - Thu, 8:30 AM - 4:00 PM GMT',
    scriptSnippet:
      'Good day {{first_name}}. Liam calling from CallWave Banking. We help fintech finance teams automate payment confirmations with zero-retention SOC2 compliance.',
    avgDuration: '1m 58s',
    sentimentScore: 84,
    budgetSpent: '$490 / $1,000',
    createdDate: 'Oct 18, 2026',
    channelType: 'voice-sms',
    aiPersonalized: true,
    description:
      'Direct-to-CFO outreach demonstrating banking compliance, ephemeral audio storage, and automated receivables.',
  },
  {
    id: 'winback',
    name: 'Customer Win-back & Churn Rescue',
    channel: 'WhatsApp Multi-Sender',
    meta: 'Lapsed customers · Oct 09',
    status: 'Paused',
    progress: 81,
    connectRate: '58.2%',
    contacts: 3640,
    dialedContacts: 2948,
    connectedContacts: 1715,
    bookedCount: 210,
    callsPerMinute: 12,
    agentName: 'Aria',
    agentVoice: 'ElevenLabs Turbo · Aria (Executive Closer)',
    targetAudience: 'Past Customers with Cancelled Subs',
    schedule: 'Mon - Fri, 11:00 AM - 6:00 PM EST',
    scriptSnippet:
      'Hi {{first_name}}, it has been a while! We rolled out sub-120ms latency and 4.2 voice models. We added 1,000 complimentary credits to your account to test.',
    avgDuration: '2m 12s',
    sentimentScore: 76,
    budgetSpent: '$780 / $950',
    createdDate: 'Oct 09, 2026',
    channelType: 'whatsapp-voice',
    aiPersonalized: false,
    description:
      'Omnichannel reactivation offering churned accounts complimentary trial credits and showcasing v4.2 voice speeds.',
  },
  {
    id: 'enterprise-followup',
    name: 'Enterprise Demo Follow-up',
    channel: 'WhatsApp Outreach',
    meta: 'Sales qualified · Oct 06',
    status: 'Completed',
    progress: 100,
    connectRate: '76.5%',
    contacts: 860,
    dialedContacts: 860,
    connectedContacts: 658,
    bookedCount: 142,
    callsPerMinute: 18,
    agentName: 'Liam',
    agentVoice: 'OpenAI Realtime · Liam (Fintech Specialist)',
    targetAudience: 'Attended Keynote or Inbound Web Demo',
    schedule: 'Completed on Oct 06, 2026',
    scriptSnippet:
      'Hello {{first_name}}, thank you for attending our live AI calling keynote. Wanted to see if you have any questions before engineering provisions your trial sandbox.',
    avgDuration: '3m 04s',
    sentimentScore: 94,
    budgetSpent: '$410 / $500',
    createdDate: 'Oct 06, 2026',
    channelType: 'ai-voice',
    aiPersonalized: false,
    description:
      'Follow-up sequence after the AI voice launch event, qualifying tier-1 enterprise prospects.',
  },
  {
    id: 'healthcare-recall',
    name: 'Clinic Care & Appointment Reminders',
    channel: 'WhatsApp Broadcast',
    meta: 'Outpatient clinic · Oct 19',
    status: 'Active',
    progress: 34,
    connectRate: '78.2%',
    contacts: 1450,
    dialedContacts: 493,
    connectedContacts: 385,
    bookedCount: 310,
    callsPerMinute: 28,
    agentName: 'Maya',
    agentVoice: 'Cartesia Sonic · Maya (Care & Advisory)',
    targetAudience: 'Patients with Upcoming Doctor Consults',
    schedule: 'Mon - Sat, 8:00 AM - 12:00 PM EST',
    scriptSnippet:
      'Hi {{first_name}}, this is Maya with City Care Clinic confirming your appointment with Dr. Rao for tomorrow. Press 1 or say yes to confirm.',
    avgDuration: '1m 24s',
    sentimentScore: 96,
    budgetSpent: '$190 / $600',
    createdDate: 'Oct 19, 2026',
    channelType: 'voice-sms',
    aiPersonalized: true,
    description:
      'Automated patient appointment confirmation reducing clinic no-show rates from 24% to under 4%.',
  },
  {
    id: 'automotive-vip',
    name: 'Automotive Annual Service Club',
    channel: 'Voice + AI',
    meta: 'Dealership VIPs · Oct 20',
    status: 'Scheduled',
    progress: 0,
    connectRate: '—',
    contacts: 2100,
    dialedContacts: 0,
    connectedContacts: 0,
    bookedCount: 0,
    callsPerMinute: 20,
    agentName: 'Aria',
    agentVoice: 'ElevenLabs Turbo · Aria (Executive Closer)',
    targetAudience: 'EV & Luxury Car Owners (Year 2 Service)',
    schedule: 'Starts Tomorrow 10:00 AM EST',
    scriptSnippet:
      'Hello {{first_name}}, calling from Premier Motors regarding your annual complimentary vehicle inspection and software update package.',
    avgDuration: '—',
    sentimentScore: 0,
    budgetSpent: '$0 / $750',
    createdDate: 'Oct 20, 2026',
    channelType: 'ai-voice',
    aiPersonalized: true,
    description:
      'Automated concierge service bookings for premier EV warranty maintenance and battery diagnostics.',
  },
  {
    id: 'inbound-reception-ai',
    name: 'After-Hours Overflow Inbound AI',
    channel: 'AI voice',
    meta: 'Live hotline · Oct 15',
    status: 'Active',
    progress: 62,
    connectRate: '88.6%',
    contacts: 3200,
    dialedContacts: 1984,
    connectedContacts: 1758,
    bookedCount: 420,
    callsPerMinute: 30,
    agentName: 'Aria',
    agentVoice: 'ElevenLabs Turbo · Aria (Natural Closer)',
    targetAudience: 'Live Inbound Hotline Overflow',
    schedule: 'Daily 24/7 (Instant SIP Pickup)',
    scriptSnippet:
      'Thank you for calling CallWave support. I can answer inquiries, transfer to engineering, or book a morning consultation immediately.',
    avgDuration: '2m 18s',
    sentimentScore: 90,
    budgetSpent: '$820 / $1,500',
    createdDate: 'Oct 15, 2026',
    channelType: 'ai-voice',
    aiPersonalized: true,
    description:
      'Instantaneous inbound call answering with zero hold time, routing high-priority buyers to tier-1 reps.',
  },
]


export const AUDIENCES: Audience[] = [
  { id: 'warm-leads', label: 'Warm leads', detail: '1,248 contacts', contacts: 1248 },
  {
    id: 'reactivation',
    label: 'Q4 reactivation list',
    detail: '2,480 contacts',
    contacts: 2480,
  },
  { id: 'all-contacts', label: 'All contacts', detail: '24,860 contacts', contacts: 24860 },
  { id: 'enterprise-cfo', label: 'Enterprise CFOs (Verified)', detail: '890 contacts', contacts: 890 },
]

export const CRM_STAGES = [
  { id: 'new', label: 'New leads', count: 1248, value: '$62.4k', width: 100 },
  { id: 'contacted', label: 'Contacted', count: 842, value: '$48.8k', width: 70 },
  { id: 'qualified', label: 'Qualified', count: 386, value: '$41.2k', width: 46 },
  { id: 'won', label: 'Won this month', count: 128, value: '$31.8k', width: 28 },
]

export const HOT_LEADS: PriorityLead[] = [
  {
    id: 'rahul',
    name: 'Rahul Mehta',
    company: 'Acme Cloud Studios',
    role: 'VP Engineering',
    dealValue: '$48,000',
    score: 96,
    intent: 'High',
    phone: '+1 (555) 392-1049',
    lastActivity: 'Engaged with AI call · 18 min ago',
    note: 'Requested quote for 120 AI agent seats. Ready for pricing sign-off.',
  },
  {
    id: 'ananya',
    name: 'Ananya Deshmukh',
    company: 'Skyline Real Estate Ventures',
    role: 'Managing Partner',
    dealValue: '$75,000',
    score: 94,
    intent: 'Urgent',
    phone: '+91 98450 12890',
    lastActivity: 'Requested brochure on WhatsApp · 1h ago',
    note: 'Looking to book 3BHK Whitefield site visit this Saturday 11 AM.',
  },
  {
    id: 'marcus',
    name: 'Marcus Sterling',
    company: 'Vertex Capital Partners',
    role: 'Chief Investment Officer',
    dealValue: '$112,000',
    score: 91,
    intent: 'Warm',
    phone: '+44 20 7946 0912',
    lastActivity: 'Discussed SOC2 & Latency · 3h ago',
    note: 'Needs security audit whitepaper before scheduling technical trial.',
  },
  {
    id: 'priya',
    name: 'Priya Sharma',
    company: 'Prestige Luxe Realty',
    role: 'Lead Investor',
    dealValue: '$34,500',
    score: 89,
    intent: 'Warm',
    phone: '+91 97112 44021',
    lastActivity: 'Call completed · 4h ago',
    note: 'AI successfully booked discovery call with territory sales director.',
  },
]

export const LIVE_CALLS: LiveCall[] = [
  {
    id: 'call-101',
    leadName: 'Vikram Mehta',
    leadRole: 'VP Operations',
    company: 'TechCorp Global',
    location: 'Bengaluru, IN',
    agentName: 'Aria',
    agentModel: 'Voice Engine 4.2 · Natural Closer',
    durationSeconds: 154,
    status: 'Live',
    sentiment: 'High Intent',
    intentScore: 96,
    topic: 'Enterprise Volume Pricing & Twilio Trunking',
    speechLine:
      'Hi Vikram, I noticed you were exploring our 50-seat automated tier. I can lock in the custom 20% annual discount if we initiate your sandbox today.',
    transcript: [
      { speaker: 'AI', text: 'Good afternoon Vikram! This is Aria from CallWave. Am I speaking with the VP of Operations?', time: '0:03' },
      { speaker: 'Lead', text: 'Yes, Aria speaking. We are currently evaluating AI dialer alternatives.', time: '0:12' },
      { speaker: 'AI', text: 'Fantastic. We have native sub-120ms latency and direct carrier trunking. Are you looking to scale outbound or customer service?', time: '0:22' },
      { speaker: 'Lead', text: 'Outbound sales qualification primarily. Our reps spend 3 hours daily just leaving voicemails.', time: '0:41' },
      { speaker: 'AI', text: 'Our voice agents filter out voicemails automatically and only bridge live human connections. Would you like a 15-minute live demo with engineering?', time: '1:02' },
      { speaker: 'Lead', text: 'That would be great. Can you check Friday 3 PM?', time: '1:28' },
    ],
  },
  {
    id: 'call-102',
    leadName: 'Ananya Deshmukh',
    leadRole: 'Managing Director',
    company: 'Skyline Ventures',
    location: 'Mumbai, IN',
    agentName: 'Maya',
    agentModel: 'Voice Engine 4.2 · Property Specialist',
    durationSeconds: 78,
    status: 'Live',
    sentiment: 'Interested',
    intentScore: 88,
    topic: '3BHK Whitefield Premium Site Visit',
    speechLine:
      'Ananya, our phase two launch has just three corner penthouses left with sunset valley views. Would you like me to reserve a VIP site visit for Saturday?',
    transcript: [
      { speaker: 'AI', text: 'Hello Ananya! This is Maya following up on your inquiry for Whitefield luxury residences.', time: '0:04' },
      { speaker: 'Lead', text: 'Hi Maya, I got the floor plan preview. Are the 3BHK units ready to move in?', time: '0:18' },
      { speaker: 'AI', text: 'Phase 1 is ready for handover, and Phase 2 will be completed by next quarter. We have exclusive show homes open this weekend.', time: '0:36' },
      { speaker: 'Lead', text: 'Can I visit this Saturday around 11:30 AM with my family?', time: '0:55' },
    ],
  },
  {
    id: 'call-103',
    leadName: 'Marcus Sterling',
    leadRole: 'Chief Financial Officer',
    company: 'Vertex Capital',
    location: 'London, UK',
    agentName: 'Liam',
    agentModel: 'Voice Engine 4.2 · Executive Analyst',
    durationSeconds: 46,
    status: 'Live',
    sentiment: 'Inquiring',
    intentScore: 82,
    topic: 'SOC2 Type II & Audio Data Residency',
    speechLine:
      'Marcus, all our voice streams can be encrypted end-to-end with local UK/EU data residency and zero LLM retention.',
    transcript: [
      { speaker: 'AI', text: 'Good morning Mr. Sterling. Liam here from CallWave regarding enterprise banking security compliance.', time: '0:02' },
      { speaker: 'Lead', text: 'Yes, Liam. Before we proceed to any trial, where is audio recorded and stored?', time: '0:15' },
      { speaker: 'AI', text: 'We offer zero-data-retention mode where real-time transcription processes ephemeral audio with SOC2 Type II and HIPAA compliance.', time: '0:32' },
    ],
  },
  {
    id: 'call-104',
    leadName: 'Elena Rostova',
    leadRole: 'Head of Growth',
    company: 'Apex Logistics',
    location: 'Dubai, UAE',
    agentName: 'Aria',
    agentModel: 'Voice Engine 4.2 · Natural Closer',
    durationSeconds: 192,
    status: 'Completed',
    sentiment: 'Meeting Booked',
    intentScore: 99,
    topic: 'Multi-lingual Arabic & English Outreach',
    speechLine:
      'Call completed with positive outcome. Cal.com meeting invite dispatched for Tuesday 2 PM GST.',
    transcript: [
      { speaker: 'AI', text: 'Marhaba Elena! Confirming your demo meeting for Tuesday at 2 PM Gulf Standard Time.', time: '0:05' },
      { speaker: 'Lead', text: 'Thank you Aria, invite accepted. Look forward to seeing the Arabic voice model in action.', time: '0:20' },
    ],
  },
]

export const CALL_TRANSCRIPTS: CallTranscriptItem[] = [
  {
    id: 'tr-1',
    contactName: 'Vikram Mehta',
    company: 'TechCorp Global',
    agentName: 'Aria (Sales Closer)',
    duration: '2m 34s',
    timeAgo: 'Just now',
    sentiment: 'Meeting Booked',
    summary: 'Lead expressed strong interest in replacing manual outbound reps with 50 autonomous voice agents. Key requirement is Twilio SIP integration.',
    actionItem: 'Calendar invite sent for Friday 3 PM · Added deal to CRM with $48k value',
  },
  {
    id: 'tr-2',
    contactName: 'Priya Sharma',
    company: 'Prestige Luxe',
    agentName: 'Maya (Property Specialist)',
    duration: '3m 15s',
    timeAgo: '24m ago',
    sentiment: 'Meeting Booked',
    summary: 'Confirmed budget of $450k for 3BHK Whitefield luxury flat. Interested in payment plans and corner units.',
    actionItem: 'WhatsApp brochure dispatched · Site visit locked for Saturday 11 AM',
  },
  {
    id: 'tr-3',
    contactName: 'Rajesh Patel',
    company: 'Omicron Logistics',
    agentName: 'Liam (Fintech AI)',
    duration: '1m 42s',
    timeAgo: '1h ago',
    sentiment: 'Callback',
    summary: 'Requested callback after board meeting on Thursday. Wants to understand API webhooks for automated trigger calling.',
    actionItem: 'Scheduled automated AI reminder call for Thursday 10:30 AM',
  },
  {
    id: 'tr-4',
    contactName: 'Sarah Jenkins',
    company: 'Elevate Health Inc',
    agentName: 'Aria (Closer)',
    duration: '2m 10s',
    timeAgo: '2h ago',
    sentiment: 'Positive',
    summary: 'Patient appointment confirmation campaign. Expressed high satisfaction with natural voice cadence and zero robot-sounding artifacts.',
    actionItem: 'Shared HIPAA compliance security packet and pilot agreement',
  },
]

export type ContactStatus =
  | 'Not Contacted'
  | 'In Campaign'
  | 'Call Completed'
  | 'Meeting Booked'
  | 'Voicemail'
  | 'Do Not Call'

export type CrmStage = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Won'

export type Contact = {
  id: string
  name: string
  email: string
  phone: string
  company: string
  role: string
  location: string
  timezone: string
  score: number
  intent: 'High' | 'Warm' | 'Urgent' | 'Cold'
  dealValue: string
  segment: string
  status: ContactStatus
  activeCampaign?: string
  lastContacted?: string
  lastOutcome?: string
  tags: string[]
  crmStage: CrmStage
  aiSummary?: string
  notes?: string
}

export const CONTACTS: Contact[] = [
  {
    id: 'c-1',
    name: 'Rahul Mehta',
    email: 'rahul.mehta@acmecloud.io',
    phone: '+1 (555) 392-1049',
    company: 'Acme Cloud Studios',
    role: 'VP Engineering',
    location: 'San Francisco, CA',
    timezone: 'PST (UTC-8)',
    score: 96,
    intent: 'High',
    dealValue: '$48,000',
    segment: 'Warm Leads',
    status: 'Meeting Booked',
    activeCampaign: 'Q4 Reactivation & Renewal',
    lastContacted: '18 min ago',
    lastOutcome: 'Booked 45-minute technical pilot trial for Friday',
    tags: ['Enterprise', 'High ACV', 'Cloud SDR'],
    crmStage: 'Proposal',
    aiSummary:
      'Wants to replace legacy human dialers with 120 AI agent seats. Emphasized sub-120ms latency and Twilio SIP compatibility.',
    notes: 'Key decision maker. Budget already approved by VP Sales.',
  },
  {
    id: 'c-2',
    name: 'Ananya Deshmukh',
    email: 'ananya@skylinerealty.in',
    phone: '+91 98450 12890',
    company: 'Skyline Ventures',
    role: 'Managing Partner',
    location: 'Mumbai, IN',
    timezone: 'IST (UTC+5:30)',
    score: 94,
    intent: 'Urgent',
    dealValue: '$75,000',
    segment: 'Luxury Real Estate',
    status: 'Meeting Booked',
    activeCampaign: 'Whitefield Property Launch',
    lastContacted: '1 hour ago',
    lastOutcome: 'Confirmed VIP site visit for Saturday 11:30 AM',
    tags: ['HNI Investor', 'Penthouse', 'Direct Buyer'],
    crmStage: 'Qualified',
    aiSummary:
      'Interested in 3BHK corner units with garden view. Requested WhatsApp floor plan and pre-launch pricing breakdown.',
    notes: 'Family visit scheduled this weekend. High likelihood of immediate booking token.',
  },
  {
    id: 'c-3',
    name: 'Marcus Sterling',
    email: 'm.sterling@vertexcap.co.uk',
    phone: '+44 20 7946 0912',
    company: 'Vertex Capital Partners',
    role: 'Chief Investment Officer',
    location: 'London, UK',
    timezone: 'GMT (UTC+0)',
    score: 91,
    intent: 'Warm',
    dealValue: '$112,000',
    segment: 'Enterprise CFO',
    status: 'Call Completed',
    activeCampaign: 'FinTech CFO Pipeline',
    lastContacted: '3 hours ago',
    lastOutcome: 'Call duration 2m 45s · Requested security compliance audit',
    tags: ['Banking', 'FinTech', 'SOC2 Compliant'],
    crmStage: 'Contacted',
    aiSummary:
      'Reviewed automated debt collection and payment reminders. Mandated zero-data retention and UK GDPR compliance.',
    notes: 'Security whitepaper dispatched. Awaiting confirmation from internal infosec.',
  },
  {
    id: 'c-4',
    name: 'Vikram Mehta',
    email: 'vikram.m@techcorp.com',
    phone: '+91 98200 44102',
    company: 'TechCorp Global',
    role: 'VP Operations',
    location: 'Bengaluru, IN',
    timezone: 'IST (UTC+5:30)',
    score: 98,
    intent: 'High',
    dealValue: '$64,000',
    segment: 'Warm Leads',
    status: 'In Campaign',
    activeCampaign: 'Q4 Reactivation & Renewal',
    lastContacted: '4 hours ago',
    lastOutcome: 'Live conversation completed with positive sentiment (96/100)',
    tags: ['Scale Tier', 'Outbound Sales', 'Twilio Trunk'],
    crmStage: 'Proposal',
    aiSummary:
      'Currently has 30 human reps spending 3 hours daily on voicemails. Seeking immediate pilot to automate SDR qualification.',
    notes: 'Prepared 50-seat pilot quote with custom discount tier.',
  },
  {
    id: 'c-5',
    name: 'Elena Rostova',
    email: 'e.rostova@apexlogistics.ae',
    phone: '+971 4 392 8100',
    company: 'Apex Logistics Global',
    role: 'Head of Growth',
    location: 'Dubai, UAE',
    timezone: 'GST (UTC+4)',
    score: 89,
    intent: 'Warm',
    dealValue: '$55,000',
    segment: 'Enterprise CFO',
    status: 'Meeting Booked',
    activeCampaign: 'After-Hours Overflow Inbound AI',
    lastContacted: '5 hours ago',
    lastOutcome: 'Cal.com invitation sent for Tuesday 2 PM GST',
    tags: ['Multi-lingual', 'Arabic Voice', 'Enterprise'],
    crmStage: 'Qualified',
    aiSummary:
      'Impressed by multilingual English and Arabic switching capability during test call demo.',
    notes: 'Meeting locked in with solutions architect team.',
  },
  {
    id: 'c-6',
    name: 'Sarah Jenkins',
    email: 'sjenkins@elevatehealth.org',
    phone: '+1 (555) 720-3341',
    company: 'Elevate Health Inc',
    role: 'Director of Patient Services',
    location: 'Boston, MA',
    timezone: 'EST (UTC-5)',
    score: 87,
    intent: 'Warm',
    dealValue: '$38,500',
    segment: 'Healthcare',
    status: 'Call Completed',
    activeCampaign: 'Clinic Care & Appointment Reminders',
    lastContacted: 'Yesterday',
    lastOutcome: 'Completed patient notification trial batch (340 calls)',
    tags: ['HIPAA', 'Clinical', 'Auto-Recall'],
    crmStage: 'Qualified',
    aiSummary:
      'Achieved 82% appointment confirmation rate on first trial run. No patient complaints regarding synthetic speech.',
    notes: 'Reviewing pilot SLA terms and BAA agreement.',
  },
  {
    id: 'c-7',
    name: 'David Kim',
    email: 'david.kim@hyperdrive.ai',
    phone: '+1 (415) 890-2134',
    company: 'HyperDrive Motors',
    role: 'VP Customer Experience',
    location: 'San Jose, CA',
    timezone: 'PST (UTC-8)',
    score: 82,
    intent: 'Warm',
    dealValue: '$90,000',
    segment: 'Automotive VIP',
    status: 'In Campaign',
    activeCampaign: 'Automotive Annual Service Club',
    lastContacted: 'Yesterday',
    lastOutcome: 'Automated concierge call scheduled for today 10 AM',
    tags: ['EV VIP', 'Warranty', 'Service Concierge'],
    crmStage: 'New',
    aiSummary:
      'Looking to automate annual warranty recall and EV battery maintenance booking calls.',
    notes: 'Pilot batch queued for 2,100 luxury EV owners.',
  },
  {
    id: 'c-8',
    name: 'Rajesh Patel',
    email: 'rajesh@omicronlogistics.in',
    phone: '+91 97123 99801',
    company: 'Omicron Logistics',
    role: 'Chief Operating Officer',
    location: 'Ahmedabad, IN',
    timezone: 'IST (UTC+5:30)',
    score: 79,
    intent: 'Warm',
    dealValue: '$32,000',
    segment: 'Q4 Reactivation',
    status: 'Voicemail',
    activeCampaign: 'Customer Win-back & Churn Rescue',
    lastContacted: '2 days ago',
    lastOutcome: 'Left smart automated voice drop message with callback link',
    tags: ['Reactivation', 'Logistics', 'Voice Drop'],
    crmStage: 'Contacted',
    aiSummary:
      'Past customer who paused service during ERP migration. Ready to test 4.2 voice engine models.',
    notes: 'Follow-up callback reminder set for Thursday 10:30 AM.',
  },
  {
    id: 'c-9',
    name: 'Samantha Vance',
    email: 'svance@vancemedia.com',
    phone: '+1 (212) 480-9923',
    company: 'Vance Digital Media',
    role: 'Founder & CEO',
    location: 'New York, NY',
    timezone: 'EST (UTC-5)',
    score: 65,
    intent: 'Cold',
    dealValue: '$24,000',
    segment: 'All Contacts',
    status: 'Not Contacted',
    tags: ['Agency', 'Inbound Form', 'Cold Lead'],
    crmStage: 'New',
    aiSummary:
      'Submitted contact form requesting information on custom voice cloning for brand podcasts and ad campaigns.',
    notes: 'Added to general nurture queue.',
  },
  {
    id: 'c-10',
    name: 'Christian Dubois',
    email: 'c.dubois@luxuryliving.fr',
    phone: '+33 1 42 68 55 00',
    company: 'Dubois Asset Advisory',
    role: 'Senior Portfolio Director',
    location: 'Paris, FR',
    timezone: 'CET (UTC+1)',
    score: 88,
    intent: 'Warm',
    dealValue: '$82,000',
    segment: 'Luxury Real Estate',
    status: 'Call Completed',
    activeCampaign: 'Whitefield Property Launch',
    lastContacted: '3 days ago',
    lastOutcome: 'Call duration 3m 12s · Requested translated investor prospectus',
    tags: ['HNW Global', 'French / English', 'Real Estate'],
    crmStage: 'Qualified',
    aiSummary:
      'Exploring off-market commercial and luxury residential holdings for European family office.',
    notes: 'PDF prospectus sent. Next check-in scheduled for next Monday.',
  },
  {
    id: 'c-11',
    name: 'Amitabh Sen',
    email: 'amitabh.sen@apexcapital.in',
    phone: '+91 98110 33451',
    company: 'Apex Capital Advisors',
    role: 'Managing Director',
    location: 'New Delhi, IN',
    timezone: 'IST (UTC+5:30)',
    score: 95,
    intent: 'High',
    dealValue: '$120,000',
    segment: 'Enterprise CFO',
    status: 'Meeting Booked',
    activeCampaign: 'FinTech CFO Pipeline',
    lastContacted: 'Just now',
    lastOutcome: 'Call successfully transferred to enterprise account executive',
    tags: ['VIP Account', 'High ACV', 'Direct Dial'],
    crmStage: 'Proposal',
    aiSummary:
      'Approved commercial scope for 250 enterprise AI lines. Final contract under legal review.',
    notes: 'Contract signing anticipated by end of month.',
  },
  {
    id: 'c-12',
    name: 'Jessica Morales',
    email: 'jessica@strideconsulting.com',
    phone: '+1 (312) 555-0198',
    company: 'Stride Management Group',
    role: 'Operations Lead',
    location: 'Chicago, IL',
    timezone: 'CST (UTC-6)',
    score: 42,
    intent: 'Cold',
    dealValue: '$15,000',
    segment: 'All Contacts',
    status: 'Do Not Call',
    tags: ['Opted Out', 'DNC TCPA', 'Unsubscribed'],
    crmStage: 'New',
    aiSummary:
      'Contact requested removal from automated outbound calling list. Instantly tagged with global DNC suppression.',
    notes: 'Blocked from all future campaign queues.',
  },
]


