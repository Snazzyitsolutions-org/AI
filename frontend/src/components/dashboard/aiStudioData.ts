export type AITab = 'voices' | 'persona' | 'templates' | 'playground' | 'knowledge'

export interface VoiceModel {
  id: string
  name: string
  gender: 'Female' | 'Male' | 'Neutral'
  role: string
  accent: string
  language: string
  voiceTag: string
  avatarColor: string
  badge?: string
  latencyMs: number
  conversionLift: string
  description: string
  sampleText: string
  defaultPitch: number
  defaultRate: number
  timbreProfile: {
    warmth: number
    clarity: number
    energy: number
    naturalness: number
  }
}

export interface PersonaPreset {
  id: string
  name: string
  category: 'Sales & Closing' | 'Consultative' | 'Support & VIP' | 'Reactivation'
  badge: string
  description: string
  voiceId: string
  systemPrompt: string
  tone: {
    assertiveness: number // 1 - 5
    empathy: number // 1 - 5
    emojiDensity: number // 1 - 5
    brevity: number // 1 - 5
    escalationThreshold: number // 1 - 5
  }
  openingMessage: string
  guardrails: {
    requireOptOut: boolean
    enforceDiscountCap: boolean
    maxDiscountPercent: number
    blockCompetitorPraise: boolean
    maskPii: boolean
    strictFactualGrounding: boolean
  }
  negativeKeywords: string[]
}

export interface PromptVariable {
  token: string
  label: string
  example: string
  category: 'Contact' | 'Deal' | 'Company'
}

export interface KnowledgeDocument {
  id: string
  name: string
  fileType: 'pdf' | 'csv' | 'docx' | 'url'
  fileSize: string
  uploadDate: string
  chunksCount: number
  syncStatus: 'synced' | 'indexing' | 'error'
  description: string
}

export interface GeneratedVariant {
  id: string
  title: string
  angle: 'Social Proof' | 'Urgency & FOMO' | 'Consultative Value'
  text: string
  charCount: number
  expectedCtrLift: string
  persuasionScore: number
  recommendedFor: string
}

export interface SandboxMessage {
  id: string
  sender: 'user' | 'agent'
  text: string
  timestamp: string
  latencyMs?: number
  audioAvailable?: boolean
}

export const PROMPT_VARIABLES: PromptVariable[] = [
  { token: '{{first_name}}', label: 'First Name', example: 'Sarah', category: 'Contact' },
  { token: '{{last_name}}', label: 'Last Name', example: 'Jenkins', category: 'Contact' },
  { token: '{{company}}', label: 'Company', example: 'Aura Tech', category: 'Contact' },
  { token: '{{phone}}', label: 'Phone', example: '+1 (555) 382-9014', category: 'Contact' },
  { token: '{{cart_value}}', label: 'Cart Value', example: '$420.00', category: 'Deal' },
  { token: '{{product_name}}', label: 'Product Name', example: 'Enterprise WhatsApp Fleet', category: 'Deal' },
  { token: '{{discount_code}}', label: 'Discount Code', example: 'VIP40', category: 'Deal' },
  { token: '{{booking_link}}', label: 'Booking Link', example: 'callwave.ai/meet/elena', category: 'Company' },
  { token: '{{agent_name}}', label: 'Agent Name', example: 'Elena Vance', category: 'Company' },
  { token: '{{last_interaction}}', label: 'Last Interaction', example: 'Cart checkout 2 hours ago', category: 'Contact' },
]

export const VOICE_MODELS: VoiceModel[] = [
  {
    id: 'elena-vance',
    name: 'Elena Vance',
    gender: 'Female',
    role: 'Executive Consultative Closer',
    accent: 'US West Coast (Natural)',
    language: 'English (US)',
    voiceTag: 'v3.8-Neural-Pro',
    avatarColor: 'from-emerald-500 to-teal-600',
    badge: 'Most Popular',
    latencyMs: 88,
    conversionLift: '+41% reply rate',
    description: 'Polished, articulate, and trustworthy tone ideal for B2B tech qualification, enterprise SaaS, and VIP consultative sales.',
    sampleText: 'Hi Sarah, Elena here with CallWave! I noticed you were exploring our autonomous WhatsApp fleet yesterday. Quick question: are you looking to automate your lead follow-ups or boost incoming demo conversions?',
    defaultPitch: 1.02,
    defaultRate: 1.05,
    timbreProfile: { warmth: 92, clarity: 98, energy: 85, naturalness: 97 },
  },
  {
    id: 'marcus-kane',
    name: 'Marcus Kane',
    gender: 'Male',
    role: 'High-Energy Sales Closer',
    accent: 'US East Coast (Dynamic)',
    language: 'English (US)',
    voiceTag: 'v3.8-Neural-Hyper',
    avatarColor: 'from-amber-500 to-orange-600',
    badge: 'High Conversion',
    latencyMs: 94,
    conversionLift: '+38% connect rate',
    description: 'Charismatic, confident cadence with proactive inflection. Perfect for flash-sales, abandoned cart recoveries, and fast-paced closes.',
    sampleText: 'Hey there! Marcus from CallWave. Look, I see you have forty minutes left on that VIP discount voucher. I can lock in the tier right now from my console—want me to apply it before midnight?',
    defaultPitch: 0.95,
    defaultRate: 1.1,
    timbreProfile: { warmth: 84, clarity: 95, energy: 96, naturalness: 94 },
  },
  {
    id: 'aria-sterling',
    name: 'Aria Sterling',
    gender: 'Female',
    role: 'Luxury Concierge & Healthcare',
    accent: 'British RP (Refined)',
    language: 'English (UK)',
    voiceTag: 'v3.8-Neural-Luxe',
    avatarColor: 'from-purple-500 to-indigo-600',
    badge: 'Low Latency',
    latencyMs: 82,
    conversionLift: '+46% CSAT score',
    description: 'Warm, soothing, and deeply empathetic. Engineered for high-ticket real estate, premium clinic consultations, and VIP onboarding.',
    sampleText: 'Good afternoon, Sarah. Aria here from Prestige Concierge. I hope your day is treating you well. I have prepared your customized property itinerary and would love to reserve your private viewing.',
    defaultPitch: 1.06,
    defaultRate: 0.98,
    timbreProfile: { warmth: 99, clarity: 96, energy: 78, naturalness: 98 },
  },
  {
    id: 'david-chen',
    name: 'David Chen',
    gender: 'Male',
    role: 'Solutions Architect & Technical SDR',
    accent: 'Neutral International',
    language: 'English (Global)',
    voiceTag: 'v3.8-Neural-Tech',
    avatarColor: 'from-blue-500 to-cyan-600',
    latencyMs: 102,
    conversionLift: '+34% demo booking',
    description: 'Measured, precise, and analytical. Excels in technical deep dives, API integrations, and developer-centric product walkthroughs.',
    sampleText: 'Hello Sarah, David Chen with CallWave engineering. I saw your webhook setup query on our docs. Our PostgreSQL logical replication has sub-50ms latency. Would you like a 10-minute sandbox walkthrough?',
    defaultPitch: 0.98,
    defaultRate: 1.02,
    timbreProfile: { warmth: 82, clarity: 99, energy: 80, naturalness: 95 },
  },
  {
    id: 'zara-patel',
    name: 'Zara Patel',
    gender: 'Female',
    role: 'Multilingual VIP Sales Advisor',
    accent: 'Indian English & Hinglish Fluent',
    language: 'English / Hindi Blend',
    voiceTag: 'v3.8-Neural-Bilingual',
    avatarColor: 'from-rose-500 to-pink-600',
    badge: 'Bilingual',
    latencyMs: 91,
    conversionLift: '+52% regional pickup',
    description: 'Energetic, natural regional vernacular with authentic conversational warmth. Highly effective in South Asian and Middle Eastern retail and fintech markets.',
    sampleText: 'Hi Sarah ji! Zara here from CallWave VIP Desk. Hope you are having a great week! Aapka festive priority reservation ready hai. Can I send the instant payment link directly to your WhatsApp?',
    defaultPitch: 1.04,
    defaultRate: 1.08,
    timbreProfile: { warmth: 96, clarity: 94, energy: 92, naturalness: 96 },
  },
  {
    id: 'lucas-moreau',
    name: 'Lucas Moreau',
    gender: 'Male',
    role: 'Customer Retention & Renewals',
    accent: 'French-European English',
    language: 'English (EU)',
    voiceTag: 'v3.8-Neural-Pro',
    avatarColor: 'from-teal-500 to-emerald-700',
    latencyMs: 96,
    conversionLift: '+29% churn reduction',
    description: 'Diplomatic, attentive, and problem-solving focus. Specially calibrated for churn risk de-escalation and renewal incentive offers.',
    sampleText: 'Hello Sarah, this is Lucas from customer success. We noticed your team had not activated the automated broadcast quota this month. Let us make sure you get maximum value—can we review your campaign setup together?',
    defaultPitch: 0.96,
    defaultRate: 1.0,
    timbreProfile: { warmth: 91, clarity: 93, energy: 76, naturalness: 93 },
  },
]

export const PERSONA_PRESETS: PersonaPreset[] = [
  {
    id: 'b2b-consultative',
    name: 'Consultative B2B SDR',
    category: 'Consultative',
    badge: 'Recommended',
    description: 'Asks probing questions, quantifies business pains, and aims to book a 15-minute demo on WhatsApp or Google Meet.',
    voiceId: 'elena-vance',
    systemPrompt: `You are Elena Vance, a top-tier Consultative SDR at CallWave.
Your goal is to converse with {{first_name}} from {{company}} on WhatsApp or voice note.
Context:
- Contact Name: {{first_name}} {{last_name}}
- Company: {{company}}
- Recent Activity: {{last_interaction}}

Guidelines:
1. Speak in a warm, executive yet approachable tone.
2. Never send walls of text; keep messages under 3 sentences.
3. Validate their current workflow challenges before pitching.
4. Soft-close towards scheduling a demo link: {{booking_link}}.
5. Always respect opt-out requests immediately.`,
    tone: {
      assertiveness: 3,
      empathy: 5,
      emojiDensity: 2,
      brevity: 4,
      escalationThreshold: 4,
    },
    openingMessage: 'Hi {{first_name}}! Elena here from CallWave. I saw you were looking into scaling WhatsApp outreach for {{company}}. What is your main bottleneck with your current setup?',
    guardrails: {
      requireOptOut: true,
      enforceDiscountCap: true,
      maxDiscountPercent: 15,
      blockCompetitorPraise: true,
      maskPii: true,
      strictFactualGrounding: true,
    },
    negativeKeywords: ['free forever', '100% guarantee', 'spam', 'competitor is bad', 'refund everything'],
  },
  {
    id: 'urgency-closer',
    name: 'Flash-Sale Urgency Closer',
    category: 'Sales & Closing',
    badge: 'High Revenue',
    description: 'Focuses on limited-time discounts, scarcity, and frictionless WhatsApp checkout clicks.',
    voiceId: 'marcus-kane',
    systemPrompt: `You are Marcus Kane, an elite e-commerce and retail sales closer at CallWave.
Your objective is to recover {{first_name}}'s abandoned cart valued at {{cart_value}}.
Context:
- Product: {{product_name}}
- Cart Value: {{cart_value}}
- Exclusive Discount: {{discount_code}}

Guidelines:
1. Generate subtle urgency without being aggressive.
2. Remind them their reserved discount code {{discount_code}} expires in 4 hours.
3. Offer an instant 1-tap checkout link.
4. If they hesitate on price, offer free express shipping within approved limits.`,
    tone: {
      assertiveness: 5,
      empathy: 3,
      emojiDensity: 4,
      brevity: 5,
      escalationThreshold: 3,
    },
    openingMessage: 'Hey {{first_name}}! ⚡ Marcus here. You left your {{product_name}} in checkout. I just unlocked a 20% code [{{discount_code}}] valid until midnight. Want me to apply it to your order?',
    guardrails: {
      requireOptOut: true,
      enforceDiscountCap: true,
      maxDiscountPercent: 25,
      blockCompetitorPraise: true,
      maskPii: true,
      strictFactualGrounding: false,
    },
    negativeKeywords: ['cheaper elsewhere', 'fake discount', 'scam', 'unlimited stock'],
  },
  {
    id: 'luxury-concierge',
    name: 'VIP Real Estate & Luxury Concierge',
    category: 'Support & VIP',
    badge: 'High Ticket',
    description: 'Flawless etiquette, personalized attention to detail, and private invitation appointments.',
    voiceId: 'aria-sterling',
    systemPrompt: `You are Aria Sterling, a private client concierge for luxury properties and high-net-worth investments.
You are communicating with {{first_name}} regarding their inquiry for {{product_name}}.

Guidelines:
1. Use refined, dignified British English phrasing.
2. Emphasize exclusivity, privacy, and tailored architectural highlights.
3. Offer private viewings and digital brochures upon request.
4. Maintain utmost confidentiality and professionalism.`,
    tone: {
      assertiveness: 2,
      empathy: 5,
      emojiDensity: 1,
      brevity: 3,
      escalationThreshold: 5,
    },
    openingMessage: 'Good morning {{first_name}}. Aria here from the private desk. It is a pleasure to connect regarding your interest in {{product_name}}. May I share our curated architectural portfolio with you?',
    guardrails: {
      requireOptOut: true,
      enforceDiscountCap: false,
      maxDiscountPercent: 0,
      blockCompetitorPraise: true,
      maskPii: true,
      strictFactualGrounding: true,
    },
    negativeKeywords: ['cheap', 'bargain', 'discount code', 'clearance', 'hurry up'],
  },
  {
    id: 'churn-recovery',
    name: 'Empathetic Churn & Reactivation',
    category: 'Reactivation',
    badge: 'Retention',
    description: 'Diagnoses why a subscriber paused or left and offers tailored retention incentives with zero pressure.',
    voiceId: 'lucas-moreau',
    systemPrompt: `You are Lucas Moreau, retention specialist at CallWave.
Your goal is to listen to {{first_name}}'s past experience with {{product_name}}, address dissatisfaction, and offer a renewal credit.

Guidelines:
1. Prioritize empathy and listen to any product or service frustration.
2. Acknowledge mistakes sincerely without being defensive.
3. Propose a complimentary consultation or 1-month credit if viable.`,
    tone: {
      assertiveness: 2,
      empathy: 5,
      emojiDensity: 2,
      brevity: 3,
      escalationThreshold: 4,
    },
    openingMessage: 'Hello {{first_name}}, Lucas from CallWave. We noticed you recently paused your subscription. I would love to understand if something fell short of your expectations and see how we can assist.',
    guardrails: {
      requireOptOut: true,
      enforceDiscountCap: true,
      maxDiscountPercent: 30,
      blockCompetitorPraise: false,
      maskPii: true,
      strictFactualGrounding: true,
    },
    negativeKeywords: ['too bad', 'not our fault', 'contract penalty'],
  },
]

export const KNOWLEDGE_DOCUMENTS: KnowledgeDocument[] = [
  {
    id: 'doc-pricing-2026',
    name: 'CallWave_Enterprise_Pricing_Matrix_Q4.pdf',
    fileType: 'pdf',
    fileSize: '412 KB',
    uploadDate: 'Oct 18, 2026',
    chunksCount: 84,
    syncStatus: 'synced',
    description: 'Complete breakdown of conversational minute tiers, Meta WhatsApp conversation fees, and volume discounts up to 500k messages.',
  },
  {
    id: 'doc-refund-policy',
    name: 'Terms_Refund_and_Service_Guarantee.docx',
    fileType: 'docx',
    fileSize: '88 KB',
    uploadDate: 'Oct 20, 2026',
    chunksCount: 32,
    syncStatus: 'synced',
    description: 'Official 14-day SLA guarantee, cancellation procedures, and compliance guidelines for transactional templates.',
  },
  {
    id: 'doc-product-catalog',
    name: 'WhatsApp_Marketing_Product_Catalog_Fall.csv',
    fileType: 'csv',
    fileSize: '1.2 MB',
    uploadDate: 'Oct 22, 2026',
    chunksCount: 310,
    syncStatus: 'synced',
    description: 'Full SKU inventory, feature matrices, WhatsApp verified blue-tick add-ons, and multi-agent routing capabilities.',
  },
  {
    id: 'doc-faq-security',
    name: 'SOC2_HIPAA_GDPR_Security_Architecture.pdf',
    fileType: 'pdf',
    fileSize: '620 KB',
    uploadDate: 'Oct 15, 2026',
    chunksCount: 120,
    syncStatus: 'synced',
    description: 'Data encryption at rest, PostgreSQL column-level hashing, and compliance documentation for enterprise procurement.',
  },
]

export const SEED_SANDBOX_MESSAGES: SandboxMessage[] = [
  {
    id: 'msg-1',
    sender: 'agent',
    text: 'Hi Sarah! Elena here from CallWave. I noticed you were exploring our autonomous WhatsApp voice fleet yesterday. Quick question: are you looking to automate your lead follow-ups or boost demo conversions?',
    timestamp: '10:42 AM',
    latencyMs: 92,
    audioAvailable: true,
  },
  {
    id: 'msg-2',
    sender: 'user',
    text: 'We currently have 3 SDRs manually calling leads from Google Ads, but pickup rate is terrible. Does your AI voice sound robotic on WhatsApp calls?',
    timestamp: '10:43 AM',
  },
  {
    id: 'msg-3',
    sender: 'agent',
    text: 'I completely hear you, Sarah—manual dialing has dropped below 12% pickup across the industry. Our v3.8 Neural engine responds in sub-90ms with realistic breath pauses and inflection, so leads genuinely feel like they are speaking to a top consultant. Tap the audio button above to hear my real-time voice!',
    timestamp: '10:43 AM',
    latencyMs: 84,
    audioAvailable: true,
  },
]

export const RAPID_OBJECTION_PROMPTS = [
  { label: '💰 Is this price negotiable?', text: 'Your enterprise tier looks good, but can we negotiate a discount for 10,000 monthly minutes?' },
  { label: '🤖 Test voice realism', text: 'Can you send me a voice note right now explaining how the WhatsApp integration works?' },
  { label: '🔒 Data privacy & GDPR', text: 'Where is customer phone number data stored? We require GDPR and SOC2 compliance.' },
  { label: '👤 Ask for human agent', text: 'I want to speak directly to your sales manager on a live phone call today.' },
  { label: '⚡ Meta WhatsApp ban risk', text: 'Will our WhatsApp Business number get blocked by Meta if we send 2,000 messages an hour?' },
]
