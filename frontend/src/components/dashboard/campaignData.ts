export type CampaignStatus = 'Active' | 'Paused' | 'Draft' | 'Completed'

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
}

export type Audience = {
  id: string
  label: string
  detail: string
  contacts: number
}

export const CAMPAIGNS: Campaign[] = [
  {
    id: 'q4-reactivation',
    name: 'Q4 Reactivation',
    channel: 'Voice + AI',
    meta: 'Existing customers · Oct 14',
    status: 'Active',
    progress: 68,
    connectRate: '72.4%',
    contacts: 2480,
    aiPersonalized: true,
  },
  {
    id: 'whitefield-launch',
    name: 'Whitefield Property Launch',
    channel: 'AI voice',
    meta: 'Real estate leads · Oct 12',
    status: 'Active',
    progress: 42,
    connectRate: '61.8%',
    contacts: 1260,
    aiPersonalized: true,
  },
  {
    id: 'winback',
    name: 'Customer Win-back',
    channel: 'WhatsApp + voice',
    meta: 'Lapsed customers · Oct 09',
    status: 'Paused',
    progress: 81,
    connectRate: '58.2%',
    contacts: 3640,
    aiPersonalized: false,
  },
  {
    id: 'enterprise-followup',
    name: 'Enterprise Demo Follow-up',
    channel: 'Voice',
    meta: 'Sales qualified · Oct 06',
    status: 'Completed',
    progress: 100,
    connectRate: '76.5%',
    contacts: 860,
    aiPersonalized: false,
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
]

export const CRM_STAGES = [
  { id: 'new', label: 'New leads', count: 1248, value: '$62.4k', width: 100 },
  { id: 'contacted', label: 'Contacted', count: 842, value: '$48.8k', width: 70 },
  { id: 'qualified', label: 'Qualified', count: 386, value: '$41.2k', width: 46 },
  { id: 'won', label: 'Won this month', count: 128, value: '$31.8k', width: 28 },
]

export const HOT_LEADS = [
  {
    id: 'rahul',
    name: 'Rahul Mehta',
    company: 'Acme Studios',
    initials: 'RM',
    score: 92,
    note: 'Opened 3 emails · 2h ago',
  },
  {
    id: 'ananya',
    name: 'Ananya Rao',
    company: 'Bright Labs',
    initials: 'AR',
    score: 88,
    note: 'Missed call · 4h ago',
  },
]
