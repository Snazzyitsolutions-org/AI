export type DealStage = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Won' | 'Lost'

export type DealPriority = 'High' | 'Medium' | 'Low'

export type DealSource =
  | 'AI Voice Call'
  | 'WhatsApp Inbound'
  | 'Campaign'
  | 'Website'
  | 'Referral'
  | 'Manual'

export type DealActivityType = 'call' | 'whatsapp' | 'meeting' | 'email' | 'note' | 'stage'

export type DealActivity = {
  id: string
  type: DealActivityType
  title: string
  detail: string
  time: string
}

export type Deal = {
  id: string
  name: string
  contactName: string
  role: string
  company: string
  email: string
  phone: string
  value: number
  stage: DealStage
  priority: DealPriority
  probability: number
  owner: string
  source: DealSource
  closeDate: string
  createdAt: string
  nextStep: string
  tags: string[]
  score: number
  notes: string
  lostReason?: string
  activity: DealActivity[]
}

export const DEAL_OWNERS = ['Neha Kapoor', 'Aarav Shah', 'Rohan Verma', 'Aria (AI SDR)'] as const

export const DEAL_STAGES: { id: DealStage; label: string }[] = [
  { id: 'New', label: 'New' },
  { id: 'Contacted', label: 'Contacted' },
  { id: 'Qualified', label: 'Qualified' },
  { id: 'Proposal', label: 'Proposal' },
  { id: 'Won', label: 'Won' },
  { id: 'Lost', label: 'Lost' },
]

export const STAGE_PROBABILITY: Record<DealStage, number> = {
  New: 10,
  Contacted: 25,
  Qualified: 50,
  Proposal: 75,
  Won: 100,
  Lost: 0,
}

export function getInitials(name: string): string {
  return name
    .replace(/\([^)]*\)/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatCompactCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}k`
  }
  return `$${value.toLocaleString('en-US')}`
}

export const DEALS: Deal[] = [
  {
    id: 'deal-rahul-acme',
    name: 'Enterprise AI Agent Rollout',
    contactName: 'Rahul Mehta',
    role: 'VP Engineering',
    company: 'Acme Cloud Studios',
    email: 'rahul.mehta@acmecloud.io',
    phone: '+1 (555) 392-1049',
    value: 48000,
    stage: 'Proposal',
    priority: 'High',
    probability: 75,
    owner: 'Neha Kapoor',
    source: 'AI Voice Call',
    closeDate: '2026-11-06',
    createdAt: '2026-09-28',
    nextStep: 'Send the 120-seat proposal with the 20% annual discount.',
    tags: ['Enterprise', '120 seats', 'High ACV'],
    score: 96,
    notes: 'Budget already approved by VP Sales. Legal is reviewing the data-retention clause.',
    activity: [
      {
        id: 'rahul-act-1',
        type: 'call',
        title: 'Discovery call completed',
        detail: 'Aria qualified 120 agent seats. Latency and Twilio SIP compatibility are the key buying criteria.',
        time: '18 min ago',
      },
      {
        id: 'rahul-act-2',
        type: 'meeting',
        title: 'Technical pilot booked',
        detail: '45-minute engineering session locked for Friday at 3:00 PM.',
        time: 'Yesterday',
      },
      {
        id: 'rahul-act-3',
        type: 'stage',
        title: 'Moved to Proposal',
        detail: 'Pricing draft requested after the security review passed.',
        time: '2 days ago',
      },
    ],
  },
  {
    id: 'deal-ananya-skyline',
    name: 'Whitefield Penthouse Reservation',
    contactName: 'Ananya Deshmukh',
    role: 'Managing Partner',
    company: 'Skyline Ventures',
    email: 'ananya@skylinerealty.in',
    phone: '+91 98450 12890',
    value: 75000,
    stage: 'Qualified',
    priority: 'High',
    probability: 50,
    owner: 'Aarav Shah',
    source: 'WhatsApp Inbound',
    closeDate: '2026-11-12',
    createdAt: '2026-10-02',
    nextStep: 'Confirm the family site visit and share the payment plan.',
    tags: ['HNI Investor', '3BHK', 'Direct Buyer'],
    score: 94,
    notes: 'Family visit scheduled this weekend. High likelihood of an immediate booking token.',
    activity: [
      {
        id: 'ananya-act-1',
        type: 'whatsapp',
        title: 'Brochure opened on WhatsApp',
        detail: 'Shared the corner-unit floor plan and pre-launch pricing breakdown.',
        time: '1 hour ago',
      },
      {
        id: 'ananya-act-2',
        type: 'call',
        title: 'Site visit confirmed',
        detail: 'Maya booked a VIP walkthrough for Saturday at 11:30 AM.',
        time: 'Yesterday',
      },
      {
        id: 'ananya-act-3',
        type: 'stage',
        title: 'Moved to Qualified',
        detail: 'Budget and timeline verified during the inbound WhatsApp conversation.',
        time: '3 days ago',
      },
    ],
  },
  {
    id: 'deal-marcus-vertex',
    name: 'Zero-Retention Voice Platform',
    contactName: 'Marcus Sterling',
    role: 'Chief Investment Officer',
    company: 'Vertex Capital Partners',
    email: 'm.sterling@vertexcap.co.uk',
    phone: '+44 20 7946 0912',
    value: 112000,
    stage: 'Contacted',
    priority: 'High',
    probability: 25,
    owner: 'Neha Kapoor',
    source: 'Campaign',
    closeDate: '2026-12-04',
    createdAt: '2026-09-19',
    nextStep: 'Share the SOC2 Type II whitepaper with the infosec team.',
    tags: ['Banking', 'SOC2', 'UK GDPR'],
    score: 91,
    notes: 'Security whitepaper dispatched. Awaiting confirmation from internal infosec.',
    activity: [
      {
        id: 'marcus-act-1',
        type: 'email',
        title: 'Security packet sent',
        detail: 'Sent SOC2 Type II, UK data residency, and zero LLM retention documentation.',
        time: '3 hours ago',
      },
      {
        id: 'marcus-act-2',
        type: 'call',
        title: 'Compliance call completed',
        detail: 'Liam walked through ephemeral audio processing and local data residency.',
        time: '2 days ago',
      },
    ],
  },
  {
    id: 'deal-vikram-techcorp',
    name: '50-Seat SDR Automation Pilot',
    contactName: 'Vikram Mehta',
    role: 'VP Operations',
    company: 'TechCorp Global',
    email: 'vikram.m@techcorp.com',
    phone: '+91 98200 44102',
    value: 64000,
    stage: 'Proposal',
    priority: 'High',
    probability: 75,
    owner: 'Rohan Verma',
    source: 'AI Voice Call',
    closeDate: '2026-10-21',
    createdAt: '2026-09-30',
    nextStep: 'Finalize the 50-seat pilot quote with the custom discount tier.',
    tags: ['Scale Tier', 'Outbound Sales', 'Twilio Trunk'],
    score: 98,
    notes: 'Prepared the 50-seat pilot quote. Needs sign-off from finance before Friday.',
    activity: [
      {
        id: 'vikram-act-1',
        type: 'meeting',
        title: 'Pilot kickoff held',
        detail: 'Operations team aligned on a two-week SDR qualification pilot.',
        time: '4 hours ago',
      },
      {
        id: 'vikram-act-2',
        type: 'call',
        title: 'Live conversation completed',
        detail: 'Positive sentiment (96/100) with a request for the final commercial terms.',
        time: 'Yesterday',
      },
      {
        id: 'vikram-act-3',
        type: 'stage',
        title: 'Moved to Proposal',
        detail: 'Technical validation cleared by the platform engineering team.',
        time: '4 days ago',
      },
    ],
  },
  {
    id: 'deal-elena-apex',
    name: 'Multilingual Logistics Concierge',
    contactName: 'Elena Rostova',
    role: 'Head of Growth',
    company: 'Apex Logistics Global',
    email: 'e.rostova@apexlogistics.ae',
    phone: '+971 4 392 8100',
    value: 55000,
    stage: 'Qualified',
    priority: 'Medium',
    probability: 50,
    owner: 'Aarav Shah',
    source: 'AI Voice Call',
    closeDate: '2026-11-18',
    createdAt: '2026-10-04',
    nextStep: 'Send the Arabic and English demo recording to the growth team.',
    tags: ['Multi-lingual', 'Arabic Voice', 'Enterprise'],
    score: 89,
    notes: 'Meeting locked in with the solutions architect team for Tuesday at 2 PM GST.',
    activity: [
      {
        id: 'elena-act-1',
        type: 'meeting',
        title: 'Solutions architecture review',
        detail: 'Cal.com invitation accepted for Tuesday at 2:00 PM Gulf Standard Time.',
        time: '5 hours ago',
      },
      {
        id: 'elena-act-2',
        type: 'whatsapp',
        title: 'Demo recording delivered',
        detail: 'Shared a bilingual customer support sample generated with the Arabic voice model.',
        time: 'Yesterday',
      },
    ],
  },
  {
    id: 'deal-sarah-elevate',
    name: 'Clinic Appointment Recall Program',
    contactName: 'Sarah Jenkins',
    role: 'Director of Patient Services',
    company: 'Elevate Health Inc',
    email: 'sjenkins@elevatehealth.org',
    phone: '+1 (555) 720-3341',
    value: 38500,
    stage: 'Qualified',
    priority: 'Medium',
    probability: 50,
    owner: 'Rohan Verma',
    source: 'Referral',
    closeDate: '2026-11-24',
    createdAt: '2026-10-01',
    nextStep: 'Review the BAA and pilot SLA with legal.',
    tags: ['HIPAA', 'Clinical', 'Auto-Recall'],
    score: 87,
    notes: 'Trial achieved an 82% appointment confirmation rate with no patient complaints.',
    activity: [
      {
        id: 'sarah-act-1',
        type: 'email',
        title: 'BAA draft shared',
        detail: 'Legal received the updated business associate agreement and pilot SLA.',
        time: 'Yesterday',
      },
      {
        id: 'sarah-act-2',
        type: 'call',
        title: 'Patient recall trial wrapped',
        detail: 'Completed 340 automated reminder calls with a 4% no-show rate.',
        time: '3 days ago',
      },
    ],
  },
  {
    id: 'deal-david-hyperdrive',
    name: 'EV Service Concierge Automation',
    contactName: 'David Kim',
    role: 'VP Customer Experience',
    company: 'HyperDrive Motors',
    email: 'david.kim@hyperdrive.ai',
    phone: '+1 (415) 890-2134',
    value: 90000,
    stage: 'New',
    priority: 'Medium',
    probability: 10,
    owner: 'Neha Kapoor',
    source: 'Campaign',
    closeDate: '2026-12-15',
    createdAt: '2026-10-20',
    nextStep: 'Book an EV concierge pilot scoping call with the CX team.',
    tags: ['EV VIP', 'Warranty', 'Service Concierge'],
    score: 82,
    notes: 'Pilot batch queued for 2,100 luxury EV owners this month.',
    activity: [
      {
        id: 'david-act-1',
        type: 'note',
        title: 'Campaign lead created',
        detail: 'Automotive Annual Service Club campaign generated this inbound opportunity.',
        time: 'Yesterday',
      },
    ],
  },
  {
    id: 'deal-rajesh-omicron',
    name: 'Churn Rescue Follow-up',
    contactName: 'Rajesh Patel',
    role: 'Chief Operating Officer',
    company: 'Omicron Logistics',
    email: 'rajesh@omicronlogistics.in',
    phone: '+91 97123 99801',
    value: 32000,
    stage: 'Contacted',
    priority: 'Low',
    probability: 25,
    owner: 'Rohan Verma',
    source: 'Campaign',
    closeDate: '2026-12-08',
    createdAt: '2026-10-08',
    nextStep: 'Follow up after the ERP board review on Thursday.',
    tags: ['Reactivation', 'Logistics', 'Voice Drop'],
    score: 79,
    notes: 'Past customer who paused service during an ERP migration. Open to testing the 4.2 voice engine.',
    activity: [
      {
        id: 'rajesh-act-1',
        type: 'call',
        title: 'Smart voice drop delivered',
        detail: 'Left a callback link and logged a reminder for Thursday at 10:30 AM.',
        time: '2 days ago',
      },
      {
        id: 'rajesh-act-2',
        type: 'stage',
        title: 'Moved to Contacted',
        detail: 'Reactivation campaign generated a voicemail callback request.',
        time: '5 days ago',
      },
    ],
  },
  {
    id: 'deal-samantha-vance',
    name: 'Brand Voice Cloning Package',
    contactName: 'Samantha Vance',
    role: 'Founder & CEO',
    company: 'Vance Digital Media',
    email: 'svance@vancemedia.com',
    phone: '+1 (212) 480-9923',
    value: 24000,
    stage: 'New',
    priority: 'Low',
    probability: 10,
    owner: 'Aria (AI SDR)',
    source: 'Website',
    closeDate: '2026-12-20',
    createdAt: '2026-10-21',
    nextStep: 'Qualify the voice-cloning scope for podcast and ad production.',
    tags: ['Agency', 'Voice Cloning', 'Inbound Form'],
    score: 65,
    notes: 'Submitted the website form requesting a custom voice clone for branded podcasts.',
    activity: [
      {
        id: 'samantha-act-1',
        type: 'note',
        title: 'Inbound form received',
        detail: 'Requested a custom voice clone for brand podcasts and advertising campaigns.',
        time: '2 days ago',
      },
    ],
  },
  {
    id: 'deal-christian-dubois',
    name: 'European Family Office Prospectus',
    contactName: 'Christian Dubois',
    role: 'Senior Portfolio Director',
    company: 'Dubois Asset Advisory',
    email: 'c.dubois@luxuryliving.fr',
    phone: '+33 1 42 68 55 00',
    value: 82000,
    stage: 'Qualified',
    priority: 'High',
    probability: 50,
    owner: 'Aarav Shah',
    source: 'WhatsApp Inbound',
    closeDate: '2026-11-09',
    createdAt: '2026-09-25',
    nextStep: 'Share the translated investor prospectus and book a follow-up.',
    tags: ['HNW Global', 'French / English', 'Real Estate'],
    score: 88,
    notes: 'Prospectus sent. Next check-in is scheduled for Monday.',
    activity: [
      {
        id: 'christian-act-1',
        type: 'whatsapp',
        title: 'Translated prospectus sent',
        detail: 'Delivered the French investor prospectus and off-market portfolio summary.',
        time: '3 days ago',
      },
      {
        id: 'christian-act-2',
        type: 'call',
        title: 'Portfolio discovery completed',
        detail: 'Discussed luxury residential holdings and European family office requirements.',
        time: '5 days ago',
      },
    ],
  },
  {
    id: 'deal-amitabh-apex',
    name: '250-Line Enterprise Agreement',
    contactName: 'Amitabh Sen',
    role: 'Managing Director',
    company: 'Apex Capital Advisors',
    email: 'amitabh.sen@apexcapital.in',
    phone: '+91 98110 33451',
    value: 120000,
    stage: 'Proposal',
    priority: 'High',
    probability: 75,
    owner: 'Neha Kapoor',
    source: 'AI Voice Call',
    closeDate: '2026-10-28',
    createdAt: '2026-09-12',
    nextStep: 'Close the legal redlines and lock the signature date.',
    tags: ['VIP Account', 'High ACV', 'Direct Dial'],
    score: 95,
    notes: 'Commercial scope approved for 250 enterprise AI lines. Final contract is under legal review.',
    activity: [
      {
        id: 'amitabh-act-1',
        type: 'email',
        title: 'Legal redlines received',
        detail: 'Counsel returned the agreement with two minor data-processing amendments.',
        time: '6 hours ago',
      },
      {
        id: 'amitabh-act-2',
        type: 'call',
        title: 'Transferred to account executive',
        detail: 'Call successfully handed off to the enterprise AE for commercial close.',
        time: 'Just now',
      },
      {
        id: 'amitabh-act-3',
        type: 'stage',
        title: 'Moved to Proposal',
        detail: 'Pricing and platform scope approved by the managing director.',
        time: '6 days ago',
      },
    ],
  },
  {
    id: 'deal-priya-prestige',
    name: 'Prestige Luxe 3BHK Booking',
    contactName: 'Priya Sharma',
    role: 'Lead Investor',
    company: 'Prestige Luxe Realty',
    email: 'priya.sharma@prestigeluxe.in',
    phone: '+91 97112 44021',
    value: 34500,
    stage: 'Won',
    priority: 'High',
    probability: 100,
    owner: 'Aarav Shah',
    source: 'WhatsApp Inbound',
    closeDate: '2026-10-18',
    createdAt: '2026-09-15',
    nextStep: 'Send the onboarding checklist to the buyer champion.',
    tags: ['HNI Investor', '3BHK', 'Closed Won'],
    score: 89,
    notes: 'Booking token received. Handover documentation is being prepared by the sales coordinator.',
    activity: [
      {
        id: 'priya-act-1',
        type: 'stage',
        title: 'Deal closed won',
        detail: 'Booking token collected after the Saturday site visit.',
        time: '5 days ago',
      },
      {
        id: 'priya-act-2',
        type: 'meeting',
        title: 'Site visit completed',
        detail: 'Family toured the corner penthouse and selected the garden-facing unit.',
        time: '6 days ago',
      },
    ],
  },
  {
    id: 'deal-emma-lumen',
    name: 'Retail Store Ops Voice Assistant',
    contactName: 'Emma Laurent',
    role: 'Head of Store Operations',
    company: 'Lumen Retail Group',
    email: 'emma.laurent@lumenretail.com',
    phone: '+33 1 84 88 22 10',
    value: 46000,
    stage: 'Won',
    priority: 'Medium',
    probability: 100,
    owner: 'Rohan Verma',
    source: 'AI Voice Call',
    closeDate: '2026-10-12',
    createdAt: '2026-08-30',
    nextStep: 'Kick off deployment with the retail operations team.',
    tags: ['Retail', '240 stores', 'Closed Won'],
    score: 84,
    notes: 'Signed a 12-month contract covering 240 stores. Deployment starts next week.',
    activity: [
      {
        id: 'emma-act-1',
        type: 'stage',
        title: 'Contract countersigned',
        detail: 'Finance approved the annual agreement for 240 store locations.',
        time: '11 days ago',
      },
      {
        id: 'emma-act-2',
        type: 'call',
        title: 'Closing call completed',
        detail: 'Confirmed rollout dates and introduced the implementation lead.',
        time: '13 days ago',
      },
    ],
  },
  {
    id: 'deal-daniel-sable',
    name: 'Sable Financial Outbound Pilot',
    contactName: 'Daniel Okafor',
    role: 'Chief Operating Officer',
    company: 'Sable Financial',
    email: 'daniel.okafor@sablefinancial.com',
    phone: '+1 (646) 555-0148',
    value: 27500,
    stage: 'Lost',
    priority: 'Low',
    probability: 0,
    owner: 'Neha Kapoor',
    source: 'Campaign',
    closeDate: '2026-10-08',
    createdAt: '2026-08-22',
    nextStep: 'Revisit in Q1 after the internal build review.',
    tags: ['FinTech', 'In-House Build', 'Nurture'],
    score: 58,
    notes: 'Lost after the security review. Revisit once their in-house dialer pilot concludes.',
    lostReason: 'Chose an in-house dialer after a lengthy security review.',
    activity: [
      {
        id: 'daniel-act-1',
        type: 'stage',
        title: 'Deal marked lost',
        detail: 'Buyer selected an internal build. Added to the Q1 nurture sequence.',
        time: '15 days ago',
      },
      {
        id: 'daniel-act-2',
        type: 'email',
        title: 'Final follow-up sent',
        detail: 'Shared a comparison brief and offered a paid pilot for the next budget cycle.',
        time: '16 days ago',
      },
    ],
  },
  {
    id: 'deal-kevin-orbit',
    name: 'Semiconductor Support Deflection',
    contactName: 'Kevin Zhang',
    role: 'Director of IT',
    company: 'Orbit Semiconductors',
    email: 'kevin.zhang@orbitsemi.com',
    phone: '+1 (408) 555-0173',
    value: 96000,
    stage: 'New',
    priority: 'High',
    probability: 10,
    owner: 'Neha Kapoor',
    source: 'Website',
    closeDate: '2026-12-18',
    createdAt: '2026-10-22',
    nextStep: 'Run technical discovery with the hardware support team.',
    tags: ['Hardware', 'Support Deflection', 'Security Review'],
    score: 86,
    notes: 'Inbound enterprise request. Wants voice AI for tier-1 hardware support triage.',
    activity: [
      {
        id: 'kevin-act-1',
        type: 'note',
        title: 'Inbound demo request received',
        detail: 'Requested a technical discovery session for tier-1 support triage.',
        time: 'Yesterday',
      },
    ],
  },
]
