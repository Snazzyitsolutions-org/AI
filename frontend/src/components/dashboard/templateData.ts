export type TemplateCategory = 'Marketing' | 'Utility' | 'Authentication'

export type TemplateStatus = 'Approved' | 'Pending' | 'Rejected' | 'Draft'

export type TemplateHeaderType = 'none' | 'text' | 'image' | 'video' | 'document'

export type TemplateButtonType = 'quick-reply' | 'url' | 'phone'

export type TemplateButton = {
  type: TemplateButtonType
  label: string
  value?: string
}

export type WhatsAppTemplate = {
  id: string
  name: string
  category: TemplateCategory
  status: TemplateStatus
  language: string
  headerType: TemplateHeaderType
  headerText?: string
  body: string
  footer?: string
  buttons: TemplateButton[]
  usageCount: number
  createdAt: string
  updatedAt: string
  rejectionReason?: string
}

export type TemplateDraftInput = {
  name: string
  category: TemplateCategory
  language: string
  headerType: TemplateHeaderType
  headerText: string
  body: string
  footer: string
  buttons: TemplateButton[]
  submitForReview: boolean
}

export type TemplateFormInitial = Omit<TemplateDraftInput, 'submitForReview'> & {
  submitForReview?: boolean
}

export type TemplateBlueprint = {
  id: string
  name: string
  title: string
  description: string
  category: TemplateCategory
  language: string
  headerType: TemplateHeaderType
  headerText?: string
  body: string
  footer?: string
  buttons: TemplateButton[]
  tag?: string
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  'Marketing',
  'Utility',
  'Authentication',
]

export const TEMPLATE_STATUSES: TemplateStatus[] = [
  'Approved',
  'Pending',
  'Rejected',
  'Draft',
]

export const TEMPLATE_LANGUAGES = [
  { code: 'en_US', label: 'English (US)' },
  { code: 'en_GB', label: 'English (UK)' },
  { code: 'hi_IN', label: 'Hindi' },
  { code: 'es_ES', label: 'Spanish' },
  { code: 'ar_AE', label: 'Arabic' },
  { code: 'pt_BR', label: 'Portuguese (BR)' },
] as const

export const TEMPLATE_HEADER_TYPES: { value: TemplateHeaderType; label: string }[] = [
  { value: 'none', label: 'No header' },
  { value: 'text', label: 'Text header' },
  { value: 'image', label: 'Image header' },
  { value: 'video', label: 'Video header' },
  { value: 'document', label: 'Document header' },
]

export function getLanguageLabel(code: string) {
  return TEMPLATE_LANGUAGES.find((language) => language.code === code)?.label ?? code
}

export function extractVariableNumbers(...texts: (string | undefined)[]) {
  const found = new Set<string>()

  texts.forEach((text) => {
    if (!text) return
    const matches = text.matchAll(/\{\{\s*(\d+)\s*\}\}/g)
    for (const match of matches) {
      found.add(match[1])
    }
  })

  return [...found].sort((a, b) => Number(a) - Number(b))
}

export function extractVariables(...texts: (string | undefined)[]) {
  return extractVariableNumbers(...texts).map((number) => `{{${number}}}`)
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

export function formatTemplateDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return dateFormatter.format(date)
}

export function getTemplateStatusTone(status: TemplateStatus) {
  switch (status) {
    case 'Approved':
      return 'active'
    case 'Pending':
      return 'pending'
    case 'Rejected':
      return 'rejected'
    case 'Draft':
      return 'draft'
    default:
      return 'draft'
  }
}

export function slugifyTemplateName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 64)
}

const TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'tmpl-festive-sale',
    name: 'festive_sale_announcement',
    category: 'Marketing',
    status: 'Approved',
    language: 'en_US',
    headerType: 'text',
    headerText: 'Diwali Mega Sale is live',
    body: 'Hi {{1}}, our biggest festive sale is here! Enjoy up to {{2}} off on all premium collections.\n\nUse code {{3}} at checkout. Offer ends {{4}}.',
    footer: 'CallWave Store · Reply STOP to opt out',
    buttons: [
      { type: 'quick-reply', label: 'Shop the sale' },
      { type: 'url', label: 'View offers', value: 'https://example.com/festive' },
    ],
    usageCount: 8420,
    createdAt: '2026-09-18T10:20:00.000Z',
    updatedAt: '2026-10-18T09:15:00.000Z',
  },
  {
    id: 'tmpl-abandoned-cart',
    name: 'abandoned_cart_recovery',
    category: 'Marketing',
    status: 'Approved',
    language: 'en_US',
    headerType: 'none',
    body: 'Hey {{1}}, you left {{2}} in your cart. Complete your order in the next 24 hours and get free shipping on us.',
    footer: 'Secure checkout · 7-day easy returns',
    buttons: [{ type: 'url', label: 'Complete my order', value: 'https://example.com/cart' }],
    usageCount: 6210,
    createdAt: '2026-08-22T06:45:00.000Z',
    updatedAt: '2026-10-14T11:02:00.000Z',
  },
  {
    id: 'tmpl-product-launch',
    name: 'new_product_launch',
    category: 'Marketing',
    status: 'Approved',
    language: 'en_US',
    headerType: 'image',
    body: '{{1}}, meet the all-new {{2}} — lighter, faster and built for everyday magic.\n\nLaunch pricing is live for the first 48 hours.',
    footer: 'Limited launch stock available',
    buttons: [{ type: 'url', label: 'Explore the launch', value: 'https://example.com/new' }],
    usageCount: 3890,
    createdAt: '2026-09-02T08:10:00.000Z',
    updatedAt: '2026-10-20T07:30:00.000Z',
  },
  {
    id: 'tmpl-winback',
    name: 'winback_offer',
    category: 'Marketing',
    status: 'Pending',
    language: 'en_US',
    headerType: 'none',
    body: 'Hi {{1}}, we miss you! Here is 20% off your next order as a welcome-back gift. Use code {{2}} before {{3}}.',
    footer: 'One use per customer',
    buttons: [{ type: 'quick-reply', label: 'Claim 20% off' }],
    usageCount: 0,
    createdAt: '2026-10-20T12:40:00.000Z',
    updatedAt: '2026-10-20T12:40:00.000Z',
  },
  {
    id: 'tmpl-order-confirmation',
    name: 'order_confirmation',
    category: 'Utility',
    status: 'Approved',
    language: 'en_US',
    headerType: 'text',
    headerText: 'Order confirmed',
    body: 'Hi {{1}}, your order {{2}} is confirmed. We will notify you as soon as it ships.\n\nOrder total: {{3}}',
    footer: 'Questions? Just reply to this message.',
    buttons: [{ type: 'quick-reply', label: 'Track my order' }],
    usageCount: 12480,
    createdAt: '2026-04-11T09:00:00.000Z',
    updatedAt: '2026-10-12T14:25:00.000Z',
  },
  {
    id: 'tmpl-shipping-update',
    name: 'shipping_update',
    category: 'Utility',
    status: 'Approved',
    language: 'en_US',
    headerType: 'none',
    body: 'Good news {{1}}! Your order {{2}} has shipped and will arrive by {{3}}. You can follow every step live below.',
    footer: 'CallWave Logistics',
    buttons: [{ type: 'url', label: 'Track shipment', value: 'https://example.com/track' }],
    usageCount: 9870,
    createdAt: '2026-05-04T10:30:00.000Z',
    updatedAt: '2026-10-16T16:10:00.000Z',
  },
  {
    id: 'tmpl-out-for-delivery',
    name: 'out_for_delivery',
    category: 'Utility',
    status: 'Approved',
    language: 'en_US',
    headerType: 'none',
    body: '{{1}}, your order {{2}} is out for delivery today. Please keep your phone handy for the delivery partner.',
    footer: 'No action needed if you are available.',
    buttons: [{ type: 'phone', label: 'Call delivery partner', value: '+14155550132' }],
    usageCount: 7420,
    createdAt: '2026-06-09T07:20:00.000Z',
    updatedAt: '2026-10-19T08:05:00.000Z',
  },
  {
    id: 'tmpl-payment-reminder',
    name: 'payment_reminder',
    category: 'Utility',
    status: 'Pending',
    language: 'en_US',
    headerType: 'none',
    body: 'Hi {{1}}, a quick reminder that payment of {{2}} for invoice {{3}} is due on {{4}}. Pay securely using the button below.',
    footer: 'Ignore this message if you have already paid.',
    buttons: [{ type: 'url', label: 'Pay now', value: 'https://example.com/pay' }],
    usageCount: 0,
    createdAt: '2026-10-21T05:55:00.000Z',
    updatedAt: '2026-10-21T05:55:00.000Z',
  },
  {
    id: 'tmpl-appointment-reminder',
    name: 'appointment_reminder',
    category: 'Utility',
    status: 'Approved',
    language: 'en_US',
    headerType: 'none',
    body: 'Hi {{1}}, this is a reminder for your appointment on {{2}} at {{3}}. Reply RESCHEDULE if you need a different time.',
    footer: 'CallWave Clinic · 24-hour cancellation',
    buttons: [
      { type: 'quick-reply', label: 'Confirm' },
      { type: 'quick-reply', label: 'Reschedule' },
    ],
    usageCount: 5310,
    createdAt: '2026-07-14T11:45:00.000Z',
    updatedAt: '2026-10-11T10:40:00.000Z',
  },
  {
    id: 'tmpl-booking-confirmed',
    name: 'booking_confirmed',
    category: 'Utility',
    status: 'Approved',
    language: 'en_US',
    headerType: 'text',
    headerText: "You're booked",
    body: 'Hi {{1}}, your booking {{2}} is confirmed for {{3}}. We look forward to seeing you!',
    footer: 'Free cancellation up to 24 hours before',
    buttons: [
      { type: 'url', label: 'View booking', value: 'https://example.com/booking' },
      { type: 'quick-reply', label: 'Add to calendar' },
    ],
    usageCount: 4130,
    createdAt: '2026-07-28T09:35:00.000Z',
    updatedAt: '2026-10-09T13:20:00.000Z',
  },
  {
    id: 'tmpl-login-otp',
    name: 'login_otp',
    category: 'Authentication',
    status: 'Approved',
    language: 'en_US',
    headerType: 'none',
    body: '{{1}} is your CallWave verification code. It expires in {{2}} minutes. Never share this code with anyone.',
    footer: 'This code was requested by you.',
    buttons: [],
    usageCount: 21860,
    createdAt: '2026-03-12T04:00:00.000Z',
    updatedAt: '2026-09-30T06:15:00.000Z',
  },
  {
    id: 'tmpl-order-otp',
    name: 'order_otp',
    category: 'Authentication',
    status: 'Approved',
    language: 'en_US',
    headerType: 'none',
    body: 'Use code {{1}} to confirm your order {{2}}. This code is valid for {{3}} minutes.',
    footer: 'If this wasn’t you, contact support immediately.',
    buttons: [],
    usageCount: 15940,
    createdAt: '2026-03-12T04:10:00.000Z',
    updatedAt: '2026-10-02T05:50:00.000Z',
  },
  {
    id: 'tmpl-feedback-request',
    name: 'feedback_request',
    category: 'Marketing',
    status: 'Approved',
    language: 'en_US',
    headerType: 'none',
    body: 'Hi {{1}}, how was your recent experience with {{2}}? Your feedback helps us get better — it takes less than 30 seconds.',
    footer: 'Thanks for being with us',
    buttons: [
      { type: 'quick-reply', label: 'Rate us' },
      { type: 'quick-reply', label: 'Not now' },
    ],
    usageCount: 6840,
    createdAt: '2026-06-20T12:00:00.000Z',
    updatedAt: '2026-10-07T15:35:00.000Z',
  },
  {
    id: 'tmpl-reengagement',
    name: 'reengagement_offer',
    category: 'Marketing',
    status: 'Rejected',
    language: 'en_US',
    headerType: 'none',
    body: 'Hey {{1}}, it has been a while! Come back and enjoy {{2}} off your next purchase with code {{3}}.',
    footer: 'Offer valid for 7 days',
    buttons: [{ type: 'quick-reply', label: 'Unlock my offer' }],
    usageCount: 0,
    createdAt: '2026-10-08T07:10:00.000Z',
    updatedAt: '2026-10-10T09:25:00.000Z',
    rejectionReason:
      'Meta rejected this template because the promotional claim was too aggressive. Soften the language and resubmit.',
  },
  {
    id: 'tmpl-cod-confirmation',
    name: 'cod_confirmation',
    category: 'Utility',
    status: 'Approved',
    language: 'hi_IN',
    headerType: 'none',
    body: 'नमस्ते {{1}}, आपके ऑर्डर {{2}} की पुष्टि के लिए कृपया जवाब दें। डिलीवरी {{3}} को होगी।',
    footer: 'CallWave Store',
    buttons: [{ type: 'quick-reply', label: 'हाँ, पुष्टि करें' }],
    usageCount: 3420,
    createdAt: '2026-08-30T05:25:00.000Z',
    updatedAt: '2026-10-15T07:45:00.000Z',
  },
  {
    id: 'tmpl-subscription-renewal',
    name: 'subscription_renewal',
    category: 'Utility',
    status: 'Draft',
    language: 'en_US',
    headerType: 'none',
    body: 'Hi {{1}}, your {{2}} subscription renews on {{3}} for {{4}}. You can manage your plan anytime.',
    footer: 'Cancel or change your plan up to 24 hours before renewal.',
    buttons: [{ type: 'url', label: 'Manage subscription', value: 'https://example.com/plan' }],
    usageCount: 0,
    createdAt: '2026-10-19T10:05:00.000Z',
    updatedAt: '2026-10-21T11:30:00.000Z',
  },
  {
    id: 'tmpl-catalog-share',
    name: 'catalog_share',
    category: 'Marketing',
    status: 'Draft',
    language: 'en_US',
    headerType: 'document',
    body: 'Hi {{1}}, here is our latest catalogue with {{2}} new arrivals. Take a look and tell us your favourites!',
    footer: 'Prices valid till {{3}}',
    buttons: [{ type: 'url', label: 'Browse catalogue', value: 'https://example.com/catalog' }],
    usageCount: 0,
    createdAt: '2026-10-21T08:20:00.000Z',
    updatedAt: '2026-10-21T08:20:00.000Z',
  },
  {
    id: 'tmpl-holiday-hours',
    name: 'holiday_support_hours',
    category: 'Utility',
    status: 'Pending',
    language: 'en_US',
    headerType: 'text',
    headerText: 'Holiday hours update',
    body: 'Hi {{1}}, our support hours change to {{2}} during the festive week. Replies may take a little longer than usual.',
    footer: 'Thank you for your patience',
    buttons: [],
    usageCount: 0,
    createdAt: '2026-10-20T14:15:00.000Z',
    updatedAt: '2026-10-20T14:15:00.000Z',
  },
  {
    id: 'tmpl-promo-es',
    name: 'descuento_exclusivo',
    category: 'Marketing',
    status: 'Approved',
    language: 'es_ES',
    headerType: 'text',
    headerText: 'Tu descuento exclusivo',
    body: '¡Hola {{1}}! Tu descuento de {{2}} está listo. Usa el código {{3}} antes del {{4}}.',
    footer: 'CallWave Store',
    buttons: [{ type: 'quick-reply', label: 'Ver mi oferta' }],
    usageCount: 2140,
    createdAt: '2026-09-12T09:45:00.000Z',
    updatedAt: '2026-10-13T12:10:00.000Z',
  },
  {
    id: 'tmpl-festive-hinglish',
    name: 'festive_hinglish_offer',
    category: 'Marketing',
    status: 'Approved',
    language: 'hi_IN',
    headerType: 'text',
    headerText: 'Tyohaar ki dhamaka sale 🎉',
    body: 'Hi {{1}}, aapke liye {{2}} off ka special offer! Code {{3}} use karein aur apna favourite pick karein. Offer {{4}} tak valid hai.',
    footer: 'CallWave Store · Reply STOP to opt out',
    buttons: [{ type: 'url', label: 'Shop now', value: 'https://example.com/sale' }],
    usageCount: 5730,
    createdAt: '2026-09-25T07:50:00.000Z',
    updatedAt: '2026-10-17T09:30:00.000Z',
  },
]

export function getSeedTemplates() {
  return TEMPLATES.map((template) => ({ ...template, buttons: [...template.buttons] }))
}

export const TEMPLATE_BLUEPRINTS: TemplateBlueprint[] = [
  {
    id: 'bp-welcome',
    name: 'welcome_message',
    title: 'Welcome new customer',
    description: 'Warm first hello with an onboarding offer and a clear next step.',
    category: 'Marketing',
    language: 'en_US',
    headerType: 'text',
    headerText: 'Welcome to CallWave',
    body: 'Hi {{1}}, welcome aboard! We are thrilled to have you with us. Here is {{2}} off your first order — just use code {{3}} at checkout.',
    footer: 'We are here whenever you need us.',
    buttons: [{ type: 'url', label: 'Start shopping', value: 'https://example.com/welcome' }],
    tag: 'Popular',
  },
  {
    id: 'bp-cart',
    name: 'cart_reminder',
    title: 'Cart recovery',
    description: 'Bring shoppers back with a friendly reminder and free shipping.',
    category: 'Marketing',
    language: 'en_US',
    headerType: 'none',
    body: 'Hi {{1}}, your cart is waiting! Complete your order in the next 24 hours and we will cover the shipping.',
    footer: 'Your items are reserved for a limited time.',
    buttons: [{ type: 'url', label: 'Resume checkout', value: 'https://example.com/cart' }],
    tag: 'High intent',
  },
  {
    id: 'bp-festive',
    name: 'festive_campaign',
    title: 'Festive sale blast',
    description: 'A bold seasonal announcement built for high-volume broadcasts.',
    category: 'Marketing',
    language: 'en_US',
    headerType: 'image',
    body: 'Hi {{1}}, the {{2}} sale starts now! Enjoy up to {{3}} off sitewide with code {{4}}. Hurry, it ends {{5}}.',
    footer: 'Reply STOP to unsubscribe',
    buttons: [
      { type: 'url', label: 'Shop the sale', value: 'https://example.com/sale' },
      { type: 'quick-reply', label: 'Notify me later' },
    ],
    tag: 'Seasonal',
  },
  {
    id: 'bp-launch',
    name: 'product_launch',
    title: 'Product launch',
    description: 'Introduce a new arrival with visuals and early-access pricing.',
    category: 'Marketing',
    language: 'en_US',
    headerType: 'image',
    body: '{{1}}, the wait is over. Meet {{2}} — our newest arrival, designed to make everyday moments feel special. Early-access pricing ends {{3}}.',
    footer: 'While stocks last.',
    buttons: [{ type: 'url', label: 'See the collection', value: 'https://example.com/new' }],
    tag: 'New',
  },
  {
    id: 'bp-winback',
    name: 'customer_winback',
    title: 'Win-back offer',
    description: 'Re-engage quiet customers with a personal welcome-back reward.',
    category: 'Marketing',
    language: 'en_US',
    headerType: 'none',
    body: 'We miss you, {{1}}! Here is a little something to welcome you back: {{2}} off your next order with code {{3}}.',
    footer: 'Valid for the next 7 days.',
    buttons: [{ type: 'quick-reply', label: 'Unlock my reward' }],
    tag: 'Retention',
  },
  {
    id: 'bp-feedback',
    name: 'feedback_request',
    title: 'Feedback request',
    description: 'Collect quick ratings right inside the WhatsApp conversation.',
    category: 'Marketing',
    language: 'en_US',
    headerType: 'none',
    body: 'Hi {{1}}, thanks for choosing {{2}}! How was your experience? Your honest feedback helps us improve.',
    footer: 'It only takes 30 seconds.',
    buttons: [
      { type: 'quick-reply', label: 'Loved it' },
      { type: 'quick-reply', label: 'Could be better' },
    ],
    tag: 'Engagement',
  },
  {
    id: 'bp-order-confirm',
    name: 'order_confirmation',
    title: 'Order confirmation',
    description: 'Reassure buyers instantly with a clear order summary.',
    category: 'Utility',
    language: 'en_US',
    headerType: 'text',
    headerText: 'Order confirmed',
    body: 'Hi {{1}}, thanks for your order! Order {{2}} is confirmed and the total is {{3}}. We will let you know the moment it ships.',
    footer: 'Need help? Just reply here.',
    buttons: [{ type: 'quick-reply', label: 'Track order' }],
    tag: 'Essential',
  },
  {
    id: 'bp-shipping',
    name: 'shipping_update',
    title: 'Shipping update',
    description: 'Share tracking details automatically after dispatch.',
    category: 'Utility',
    language: 'en_US',
    headerType: 'none',
    body: 'Good news {{1}}! Order {{2}} is on its way and should arrive by {{3}}. Follow the live tracking below.',
    footer: 'CallWave Logistics',
    buttons: [{ type: 'url', label: 'Track shipment', value: 'https://example.com/track' }],
    tag: 'Essential',
  },
  {
    id: 'bp-delivery',
    name: 'delivery_confirmation',
    title: 'Delivery confirmation',
    description: 'Close the loop once the order reaches the customer.',
    category: 'Utility',
    language: 'en_US',
    headerType: 'text',
    headerText: 'Delivered',
    body: 'Hi {{1}}, order {{2}} was delivered on {{3}}. We hope you love it! Tap below if anything is not right.',
    footer: '7-day easy returns',
    buttons: [
      { type: 'quick-reply', label: 'All good' },
      { type: 'url', label: 'Report an issue', value: 'https://example.com/support' },
    ],
  },
  {
    id: 'bp-payment',
    name: 'payment_reminder',
    title: 'Payment reminder',
    description: 'A polite nudge with a secure payment link and due date.',
    category: 'Utility',
    language: 'en_US',
    headerType: 'none',
    body: 'Hi {{1}}, this is a gentle reminder that invoice {{2}} for {{3}} is due on {{4}}. You can pay securely below.',
    footer: 'Already paid? Please ignore this message.',
    buttons: [{ type: 'url', label: 'Pay invoice', value: 'https://example.com/pay' }],
    tag: 'Finance',
  },
  {
    id: 'bp-appointment',
    name: 'appointment_reminder',
    title: 'Appointment reminder',
    description: 'Reduce no-shows with confirm and reschedule actions.',
    category: 'Utility',
    language: 'en_US',
    headerType: 'none',
    body: 'Hi {{1}}, your appointment with {{2}} is on {{3}} at {{4}}. Please confirm or reschedule below.',
    footer: 'Please arrive 10 minutes early.',
    buttons: [
      { type: 'quick-reply', label: 'Confirm' },
      { type: 'quick-reply', label: 'Reschedule' },
    ],
    tag: 'Bookings',
  },
  {
    id: 'bp-booking',
    name: 'booking_confirmed',
    title: 'Booking confirmed',
    description: 'A polished confirmation with calendar and booking links.',
    category: 'Utility',
    language: 'en_US',
    headerType: 'text',
    headerText: "You're booked",
    body: 'Hi {{1}}, your booking {{2}} is confirmed for {{3}}. We cannot wait to see you!',
    footer: 'Free cancellation up to 24 hours before.',
    buttons: [
      { type: 'url', label: 'View booking', value: 'https://example.com/booking' },
      { type: 'quick-reply', label: 'Add to calendar' },
    ],
  },
  {
    id: 'bp-login-otp',
    name: 'login_verification',
    title: 'Login verification',
    description: 'Secure one-time passcode with an expiry time.',
    category: 'Authentication',
    language: 'en_US',
    headerType: 'none',
    body: '{{1}} is your verification code for CallWave. It expires in {{2}} minutes. Never share this code with anyone.',
    footer: 'If you did not request this code, please ignore it.',
    buttons: [],
    tag: 'Security',
  },
  {
    id: 'bp-order-otp',
    name: 'order_verification',
    title: 'Order verification',
    description: 'Confirm high-value orders with a short-lived OTP.',
    category: 'Authentication',
    language: 'en_US',
    headerType: 'none',
    body: 'Use code {{1}} to confirm order {{2}}. The code is valid for {{3}} minutes.',
    footer: 'Do not share this code with anyone.',
    buttons: [],
  },
  {
    id: 'bp-cod',
    name: 'cod_confirmation',
    title: 'COD confirmation',
    description: 'Confirm cash-on-delivery orders before dispatch.',
    category: 'Utility',
    language: 'en_US',
    headerType: 'none',
    body: 'Hi {{1}}, please confirm your cash-on-delivery order {{2}} of {{3}}. Reply YES to confirm and we will dispatch it today.',
    footer: 'Unconfirmed orders are cancelled after 24 hours.',
    buttons: [
      { type: 'quick-reply', label: 'Yes, confirm' },
      { type: 'quick-reply', label: 'Cancel order' },
    ],
    tag: 'E-commerce',
  },
  {
    id: 'bp-renewal',
    name: 'subscription_renewal',
    title: 'Subscription renewal',
    description: 'Remind subscribers before the next billing date.',
    category: 'Utility',
    language: 'en_US',
    headerType: 'none',
    body: 'Hi {{1}}, your {{2}} plan renews on {{3}} for {{4}}. You can update or cancel your plan anytime before then.',
    footer: 'Thanks for being a valued subscriber.',
    buttons: [{ type: 'url', label: 'Manage plan', value: 'https://example.com/plan' }],
  },
  {
    id: 'bp-catalog',
    name: 'catalog_share',
    title: 'Catalogue share',
    description: 'Send a PDF catalogue with a personal note.',
    category: 'Marketing',
    language: 'en_US',
    headerType: 'document',
    body: 'Hi {{1}}, our new catalogue is here! Explore {{2}} fresh arrivals and tell us which ones catch your eye.',
    footer: 'Prices valid until {{3}}.',
    buttons: [{ type: 'url', label: 'Browse catalogue', value: 'https://example.com/catalog' }],
  },
  {
    id: 'bp-holiday',
    name: 'holiday_hours',
    title: 'Holiday hours',
    description: 'Keep customers informed about festive support timings.',
    category: 'Utility',
    language: 'en_US',
    headerType: 'text',
    headerText: 'Holiday hours',
    body: 'Hi {{1}}, our support hours will be {{2}} during the festive week. We will be back to normal on {{3}}.',
    footer: 'Thanks for your patience!',
    buttons: [],
  },
]
