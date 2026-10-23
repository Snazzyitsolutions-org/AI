import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { DashboardLayout } from '../components/dashboard/DashboardLayout'
import { Toast } from '../components/dashboard/Toast'
import { usePageTitle } from '../lib/usePageTitle'
import { WhatsAppEmojiPicker } from '../components/common/WhatsAppEmojiPicker'
import { WhatsAppVoiceWavePlayer } from '../components/common/WhatsAppVoiceWavePlayer'
import { CONTACTS, type Contact } from '../components/dashboard/campaignData'
import {
  VoiceRecorderController,
  createSimulatedVoiceNote,
  requestMicrophonePermission,
} from '../lib/voiceRecorder'
import { stopAgentSpeech } from '../lib/audioVoice'
import { ScheduleMessageModal, type ScheduledMessageItem } from '../components/dashboard/ScheduleMessageModal'
import { TemplateSelectorModal } from '../components/dashboard/TemplateSelectorModal'
import { AiCopilotModal } from '../components/dashboard/AiCopilotModal'

type MessageStatus = 'sent' | 'delivered' | 'read'

interface PollOption {
  text: string
  votes: number
}

interface Message {
  id: string
  sender: 'contact' | 'agent'
  text: string
  time: string
  status?: MessageStatus
  type?: 'text' | 'audio' | 'action' | 'image' | 'document' | 'contact' | 'poll' | 'catalog'
  audioDuration?: string
  actionButtons?: string[]
  mediaUrl?: string
  fileName?: string
  fileSize?: string
  contactName?: string
  contactPhone?: string
  pollQuestion?: string
  pollOptions?: PollOption[]
}

interface Conversation {
  id: string
  name: string
  company: string
  phone: string
  avatar: string
  color: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  online: boolean
  lastSeen?: string
  leadScore: number
  leadStage: string
  tags: string[]
  messages: Message[]
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    name: 'Aarav Sharma',
    company: 'TechCorp India',
    phone: '+91 98201 44521',
    avatar: 'AS',
    color: 'bg-emerald-600',
    lastMessage: 'Sure, send over the pricing deck and SIP pacing details.',
    lastMessageTime: '11:42 AM',
    unreadCount: 2,
    online: true,
    leadScore: 94,
    leadStage: 'Hot Lead (Demo Scheduled)',
    tags: ['WhatsApp Opt-in', 'High Intent', 'Enterprise'],
    messages: [
      {
        id: 'm1',
        sender: 'contact',
        text: 'Hi CallWave team, I saw your WhatsApp marketing automation demo on LinkedIn. Does it support custom broadcast templates?',
        time: '11:28 AM',
      },
      {
        id: 'm2',
        sender: 'agent',
        text: 'Hello Aarav! Yes, absolutely. CallWave automatically triggers instant personalized WhatsApp broadcast messages with interactive buttons and audio previews.',
        time: '11:30 AM',
        status: 'read',
      },
      {
        id: 'm3',
        sender: 'agent',
        text: 'Here is a quick sample of the personalized voice preview generated for your account:',
        time: '11:31 AM',
        status: 'read',
        type: 'audio',
        audioDuration: '0:19',
      },
      {
        id: 'm4',
        sender: 'contact',
        text: 'That sounds really smooth! Can we schedule a quick walkthrough for 20 agents?',
        time: '11:36 AM',
      },
      {
        id: 'm5',
        sender: 'agent',
        text: 'Certainly! Please select a preferred slot below or reply with your available time:',
        time: '11:38 AM',
        status: 'read',
        type: 'action',
        actionButtons: ['Tomorrow 3:00 PM', 'Thursday 11:30 AM', 'Request Custom Time'],
      },
      {
        id: 'm6',
        sender: 'contact',
        text: 'Sure, send over the pricing deck and WhatsApp template specs.',
        time: '11:42 AM',
      },
    ],
  },
  {
    id: 'conv-2',
    name: 'Priya Patel',
    company: 'RetailDirect Hub',
    phone: '+91 97112 88902',
    avatar: 'PP',
    color: 'bg-teal-600',
    lastMessage: 'The AI WhatsApp campaign demo was amazing! Can we connect our CRM?',
    lastMessageTime: '10:15 AM',
    unreadCount: 0,
    online: true,
    leadScore: 89,
    leadStage: 'Qualified Lead',
    tags: ['Retail', 'HubSpot Integration', 'Warm'],
    messages: [
      {
        id: 'm201',
        sender: 'agent',
        text: 'Hi Priya, thanks for connecting during our bulk launch earlier today.',
        time: '10:02 AM',
        status: 'read',
      },
      {
        id: 'm202',
        sender: 'contact',
        text: 'The AI WhatsApp campaign demo was amazing! Can we connect our CRM?',
        time: '10:15 AM',
      },
    ],
  },
  {
    id: 'conv-3',
    name: 'Vikram Mehta',
    company: 'FinEdge Capital',
    phone: '+91 99882 12093',
    avatar: 'VM',
    color: 'bg-indigo-600',
    lastMessage: 'Audio note received (0:24)',
    lastMessageTime: 'Yesterday',
    unreadCount: 1,
    online: false,
    lastSeen: 'yesterday at 6:40 PM',
    leadScore: 92,
    leadStage: 'Negotiation',
    tags: ['BFSI', 'High Volume', 'VIP'],
    messages: [
      {
        id: 'm301',
        sender: 'contact',
        text: 'We are processing over 50,000 monthly inquiries. Does your WhatsApp broadcast guarantee zero ban rates?',
        time: 'Yesterday 5:20 PM',
      },
      {
        id: 'm302',
        sender: 'agent',
        text: 'Yes Vikram, we utilize official Meta WhatsApp Cloud API tier-4 verified numbers with intelligent spintax pacing.',
        time: 'Yesterday 5:25 PM',
        status: 'read',
      },
      {
        id: 'm303',
        sender: 'contact',
        text: 'Understood. Please listen to our compliance requirement voice note:',
        time: 'Yesterday 6:10 PM',
        type: 'audio',
        audioDuration: '0:24',
      },
    ],
  },
  {
    id: 'conv-4',
    name: 'Sneha Reddy',
    company: 'Logix Global',
    phone: '+91 94451 09231',
    avatar: 'SR',
    color: 'bg-amber-600',
    lastMessage: 'Please share the enterprise API documentation link.',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    online: false,
    lastSeen: 'yesterday at 3:12 PM',
    leadScore: 78,
    leadStage: 'Contacted',
    tags: ['Supply Chain', 'API Integration'],
    messages: [
      {
        id: 'm401',
        sender: 'contact',
        text: 'Please share the enterprise API documentation link.',
        time: 'Yesterday 3:10 PM',
      },
    ],
  },
  {
    id: 'conv-5',
    name: 'Rohan Verma',
    company: 'EduWave Learning',
    phone: '+91 98103 76214',
    avatar: 'RV',
    color: 'bg-rose-600',
    lastMessage: 'Thank you! The voice campaign generated 42 new inquiries.',
    lastMessageTime: 'Monday',
    unreadCount: 0,
    online: false,
    lastSeen: 'Monday at 8:05 PM',
    leadScore: 96,
    leadStage: 'Customer (Renewal)',
    tags: ['EdTech', 'Customer', 'WhatsApp Broadcaster'],
    messages: [
      {
        id: 'm501',
        sender: 'contact',
        text: 'Thank you! The voice campaign generated 42 new inquiries.',
        time: 'Monday 7:55 PM',
      },
    ],
  },
]

export function InboxPage() {
  usePageTitle('WhatsApp Inbox • CallWave')

  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS)
  const [selectedId, setSelectedId] = useState<string>('conv-1')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'high-intent'>('all')
  const [inputText, setInputText] = useState('')
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [crmPanelOpen, setCrmPanelOpen] = useState(false)
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null)

  // Auto-Reply toggle (default ON matching reference image)
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(true)

  // Schedule, Template & AI Copilot Modals state
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessageItem[]>([])
  const [templateModalOpen, setTemplateModalOpen] = useState(false)
  const [aiCopilotModalOpen, setAiCopilotModalOpen] = useState(false)

  // Voice recording state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false)
  const [isSimulatedVoice, setIsSimulatedVoice] = useState(false)
  const [showMicHelpModal, setShowMicHelpModal] = useState(false)
  const [voiceDuration, setVoiceDuration] = useState(0)
  const [voiceFormattedDuration, setVoiceFormattedDuration] = useState('0:00')
  const [voiceAudioLevels, setVoiceAudioLevels] = useState<number[]>([20, 35, 60, 45, 80, 50, 25, 75, 40, 65, 30, 55, 70, 35])
  const [voiceTranscript, setVoiceTranscript] = useState('')
  const voiceControllerRef = useRef<VoiceRecorderController | null>(null)
  const activeAudioElementRef = useRef<HTMLAudioElement | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const attachmentButtonRef = useRef<HTMLButtonElement>(null)
  const attachmentMenuRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const activeConversation = conversations.find((c) => c.id === selectedId) || conversations[0]
  const activeScheduledMessage = scheduledMessages.find(
    (s) => s.convId === selectedId || s.phone === activeConversation.phone
  )

  // New Chat Panel & Contact Selector state
  const [newChatDrawerOpen, setNewChatDrawerOpen] = useState(false)
  const [newChatSearchQuery, setNewChatSearchQuery] = useState('')
  const [showCustomContactForm, setShowCustomContactForm] = useState(false)
  const [newContactName, setNewContactName] = useState('')
  const [newContactPhone, setNewContactPhone] = useState('')
  const [newContactCompany, setNewContactCompany] = useState('')
  const [newContactInitialMessage, setNewContactInitialMessage] = useState('')

  // Attachment Extra Modals: Contact Card & Poll
  const [shareContactModalOpen, setShareContactModalOpen] = useState(false)
  const [shareContactSearch, setShareContactSearch] = useState('')
  const [createPollModalOpen, setCreatePollModalOpen] = useState(false)
  const [pollQuestionInput, setPollQuestionInput] = useState('')
  const [pollOptionInputs, setPollOptionInputs] = useState<string[]>(['', ''])

  // Filtered CRM contacts for New Chat
  const filteredCrmContacts = useMemo(() => {
    if (!newChatSearchQuery.trim()) return CONTACTS
    const q = newChatSearchQuery.toLowerCase()
    return CONTACTS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q)
    )
  }, [newChatSearchQuery])

  // Filtered CRM contacts for Contact Card sharing modal
  const filteredShareContacts = useMemo(() => {
    if (!shareContactSearch.trim()) return CONTACTS
    const q = shareContactSearch.toLowerCase()
    return CONTACTS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.phone.includes(q)
    )
  }, [shareContactSearch])

  // Stop recording and audio on unmount
  useEffect(() => {
    return () => {
      if (voiceControllerRef.current) {
        voiceControllerRef.current.cancel()
        voiceControllerRef.current = null
      }
      if (activeAudioElementRef.current) {
        activeAudioElementRef.current.pause()
        activeAudioElementRef.current = null
      }
      stopAgentSpeech()
    }
  }, [])

  const handleSelectEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji)
    setTimeout(() => inputRef.current?.focus(), 10)
  }

  const notify = useCallback((message: string) => {
    setToast({ id: Date.now(), message })
  }, [])

  const closeToast = useCallback(() => setToast(null), [])

  // Auto-scroll to bottom of active chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConversation?.messages, isTyping])

  // Dismiss attachment menu on outside click or Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        attachmentMenuRef.current &&
        !attachmentMenuRef.current.contains(event.target as Node) &&
        !attachmentButtonRef.current?.contains(event.target as Node)
      ) {
        setAttachmentMenuOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setAttachmentMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Mark conversation as read upon selection
  const handleSelectConversation = (id: string) => {
    setSelectedId(id)
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    )
  }

  // Start chat with a CRM contact from New Chat drawer
  const handleStartChatWithContact = (contact: Contact) => {
    const existing = conversations.find(
      (c) =>
        c.phone.replace(/\D/g, '') === contact.phone.replace(/\D/g, '') ||
        c.name.toLowerCase() === contact.name.toLowerCase()
    )

    if (existing) {
      setSelectedId(existing.id)
      setNewChatDrawerOpen(false)
      setShowCustomContactForm(false)
      notify(`Switched to active chat with ${contact.name}`)
      setTimeout(() => inputRef.current?.focus(), 100)
      return
    }

    const initials = contact.name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      name: contact.name,
      company: contact.company || 'CRM Account',
      phone: contact.phone,
      avatar: initials || 'CW',
      color: 'bg-emerald-600',
      lastMessage: `Hi ${contact.name.split(' ')[0]}, thanks for connecting with CallWave.`,
      lastMessageTime: 'Just now',
      unreadCount: 0,
      online: true,
      leadScore: contact.score || 85,
      leadStage: contact.crmStage || 'New',
      tags: contact.tags || ['CRM Contact', 'WhatsApp Opt-in'],
      messages: [
        {
          id: `m_${Date.now()}`,
          sender: 'agent',
          text: `Hi ${contact.name.split(' ')[0]}, this is CallWave team connecting regarding ${contact.company}. How can we assist you with voice & messaging automation today?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'delivered',
          type: 'text',
        },
      ],
    }

    setConversations((prev) => [newConv, ...prev])
    setSelectedId(newConv.id)
    setNewChatDrawerOpen(false)
    setShowCustomContactForm(false)
    notify(`Started new WhatsApp chat with ${contact.name}!`)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  // Start chat with a custom entered phone number
  const handleCreateDirectChat = (e: React.FormEvent) => {
    e.preventDefault()
    const name = newContactName.trim()
    const phone = newContactPhone.trim()
    if (!name || !phone) {
      notify('Please enter both contact name and phone number.')
      return
    }

    const company = newContactCompany.trim() || 'WhatsApp Lead'
    const greeting =
      newContactInitialMessage.trim() ||
      `Hello ${name.split(' ')[0]}! Welcome to CallWave. How can our AI voice & messaging platform help you today?`

    const existing = conversations.find(
      (c) =>
        c.phone.replace(/\D/g, '') === phone.replace(/\D/g, '') ||
        c.name.toLowerCase() === name.toLowerCase()
    )

    if (existing) {
      setSelectedId(existing.id)
      setNewChatDrawerOpen(false)
      setShowCustomContactForm(false)
      setNewContactName('')
      setNewContactPhone('')
      setNewContactCompany('')
      setNewContactInitialMessage('')
      notify(`Switched to active chat with ${name}`)
      setTimeout(() => inputRef.current?.focus(), 100)
      return
    }

    const initials = name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      name,
      company,
      phone,
      avatar: initials || 'CW',
      color: 'bg-emerald-600',
      lastMessage: greeting,
      lastMessageTime: 'Just now',
      unreadCount: 0,
      online: true,
      leadScore: 82,
      leadStage: 'New Lead',
      tags: ['Direct Inbound', 'WhatsApp'],
      messages: [
        {
          id: `m_${Date.now()}`,
          sender: 'agent',
          text: greeting,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'delivered',
          type: 'text',
        },
      ],
    }

    setConversations((prev) => [newConv, ...prev])
    setSelectedId(newConv.id)
    setNewChatDrawerOpen(false)
    setShowCustomContactForm(false)
    setNewContactName('')
    setNewContactPhone('')
    setNewContactCompany('')
    setNewContactInitialMessage('')
    notify(`Started new WhatsApp chat with ${name}!`)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  // Handle sharing contact card
  const handleShareContactCard = (contact: Contact) => {
    const now = new Date()
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const contactMsg: Message = {
      id: `m_${Date.now()}`,
      sender: 'agent',
      text: `Contact Card: ${contact.name}`,
      time: timeStr,
      status: 'sent',
      type: 'contact',
      contactName: contact.name,
      contactPhone: contact.phone,
    }
    sendAnyMessage(contactMsg, 'contact card')
    setShareContactModalOpen(false)
    setShareContactSearch('')
    notify(`Shared ${contact.name}'s contact card!`)
  }

  // Handle sending poll
  const handleSendPoll = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pollQuestionInput.trim()) {
      notify('Please enter a poll question.')
      return
    }
    const validOptions = pollOptionInputs
      .map((opt) => opt.trim())
      .filter((opt) => opt.length > 0)
    if (validOptions.length < 2) {
      notify('Please enter at least 2 poll options.')
      return
    }

    const now = new Date()
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const pollMsg: Message = {
      id: `m_${Date.now()}`,
      sender: 'agent',
      text: `📊 Poll: ${pollQuestionInput.trim()}`,
      time: timeStr,
      status: 'sent',
      type: 'poll',
      pollQuestion: pollQuestionInput.trim(),
      pollOptions: validOptions.map((opt) => ({ text: opt, votes: 0 })),
    }
    sendAnyMessage(pollMsg, 'poll')
    setCreatePollModalOpen(false)
    setPollQuestionInput('')
    setPollOptionInputs(['', ''])
    notify('WhatsApp poll created and sent!')
  }

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (activeFilter === 'unread') return c.unreadCount > 0
    if (activeFilter === 'high-intent') return c.leadScore >= 90
    return true
  })

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Unified send message helper supporting text, image, doc, poll, contact
  const sendAnyMessage = (newMessage: Message, autoReplyContext?: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === selectedId) {
          const previewText =
            newMessage.type === 'image'
              ? '📷 Photo'
              : newMessage.type === 'document'
                ? `📄 ${newMessage.fileName || 'Document'}`
                : newMessage.type === 'contact'
                  ? `👤 ${newMessage.contactName}`
                  : newMessage.type === 'poll'
                    ? `📊 ${newMessage.pollQuestion}`
                    : newMessage.type === 'catalog'
                      ? '🛍️ Product Catalog'
                      : newMessage.text

          return {
            ...c,
            lastMessage: previewText,
            lastMessageTime: newMessage.time,
            messages: [...c.messages, newMessage],
          }
        }
        return c
      })
    )

    setInputText('')
    setEmojiPickerOpen(false)
    setAttachmentMenuOpen(false)

    // Simulate Message Delivery: sent -> delivered -> read
    setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === selectedId) {
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === newMessage.id ? { ...m, status: 'delivered' as MessageStatus } : m
              ),
            }
          }
          return c
        })
      )
    }, 500)

    setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === selectedId) {
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === newMessage.id ? { ...m, status: 'read' as MessageStatus } : m
              ),
            }
          }
          return c
        })
      )
    }, 1100)

    // Simulate incoming AI response after 1.8s (only if Auto-Reply is active)
    if (autoReplyEnabled) {
      setTimeout(() => {
        setIsTyping(true)
      }, 1200)

      setTimeout(() => {
        setIsTyping(false)
        const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        const autoReplyText = getSimulatedReply(
          autoReplyContext || newMessage.text || newMessage.fileName || '',
          activeConversation.name
        )

        const replyMsg: Message = {
          id: `reply_${Date.now()}`,
          sender: 'contact',
          text: autoReplyText,
          time: replyTime,
        }

        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === selectedId) {
              return {
                ...c,
                lastMessage: autoReplyText,
                lastMessageTime: replyTime,
                messages: [...c.messages, replyMsg],
              }
            }
            return c
          })
        )
      }, 2800)
    }
  }

  // Send WhatsApp Product Catalog
  const handleSendCatalog = () => {
    const now = new Date()
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const catalogMsg: Message = {
      id: `m_catalog_${Date.now()}`,
      sender: 'agent',
      text: `CallWave Official WhatsApp Automation Suite Catalog`,
      time: timeStr,
      status: 'sent',
      type: 'catalog',
      actionButtons: ['Browse Full Catalog 🛍️', 'Get 14-Day Free Pilot'],
    }
    sendAnyMessage(catalogMsg, 'product catalog')
    notify(`Sent WhatsApp Product Catalog to ${activeConversation.name}`)
  }

  // Schedule Message confirmation handler
  const handleScheduleMessage = (item: ScheduledMessageItem) => {
    item.convId = selectedId
    setScheduledMessages((prev) => [item, ...prev])
    notify(`📅 Message scheduled for ${item.contactName} on ${item.scheduledDate} at ${item.scheduledTime}!`)
  }

  // Cancel scheduled message handler
  const handleCancelScheduled = (id: string) => {
    setScheduledMessages((prev) => prev.filter((s) => s.id !== id))
    notify('Scheduled message cancelled.')
  }

  // Toggle Auto-Reply handler
  const handleToggleAutoReply = () => {
    setAutoReplyEnabled((prev) => {
      const next = !prev
      if (next) {
        notify('🤖 AI Copilot Auto-Reply enabled. Incoming messages will be answered autonomously.')
      } else {
        notify('⏸️ AI Auto-Reply paused. Manual agent takeover active.')
      }
      return next
    })
  }

  // Handle sending standard text message
  const handleSendMessage = (textToSend?: string) => {
    const content = (textToSend || inputText).trim()
    if (!content) return

    const now = new Date()
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const newMessage: Message = {
      id: `m_${Date.now()}`,
      sender: 'agent',
      text: content,
      time: timeStr,
      status: 'sent',
      type: 'text',
    }

    sendAnyMessage(newMessage)
  }

  // Handle opening file picker for image/video or document
  const handleTriggerUpload = (acceptString: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = acceptString
      fileInputRef.current.click()
    }
    setAttachmentMenuOpen(false)
  }

  // Handle selected file from device
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const now = new Date()
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = () => {
        const imgMsg: Message = {
          id: `m_${Date.now()}`,
          sender: 'agent',
          text: inputText.trim() || file.name,
          time: timeStr,
          status: 'sent',
          type: 'image',
          mediaUrl: reader.result as string,
          fileName: file.name,
          fileSize: formatFileSize(file.size),
        }
        sendAnyMessage(imgMsg, 'photo')
        notify(`Sent image: ${file.name}`)
      }
      reader.readAsDataURL(file)
    } else {
      const docMsg: Message = {
        id: `m_${Date.now()}`,
        sender: 'agent',
        text: inputText.trim() || file.name,
        time: timeStr,
        status: 'sent',
        type: 'document',
        fileName: file.name,
        fileSize: formatFileSize(file.size),
      }
      sendAnyMessage(docMsg, 'document')
      notify(`Sent document: ${file.name}`)
    }

    e.target.value = ''
  }



  // Handle voting in poll
  const handleVotePoll = (messageId: string, optionIndex: number) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === selectedId) {
          return {
            ...c,
            messages: c.messages.map((m) => {
              if (m.id === messageId && m.pollOptions) {
                const updated = m.pollOptions.map((opt, i) =>
                  i === optionIndex ? { ...opt, votes: opt.votes + 1 } : opt
                )
                return { ...m, pollOptions: updated }
              }
              return m
            }),
          }
        }
        return c
      })
    )
    notify('Your vote was registered on the poll!')
  }

  // Generate smart simulated reply
  const getSimulatedReply = (query: string, name: string) => {
    const q = query.toLowerCase()
    if (q.includes('voice') || q.includes('audio') || q.includes('note') || q.includes('mic') || q.includes('recording')) {
      return `Voice note received! I listened to your audio note. The sound quality is crystal clear. Let's proceed with the proposal!`
    }
    if (q.includes('price') || q.includes('deck') || q.includes('rate') || q.includes('catalog')) {
      return `Thanks for sending the pricing deck! The WhatsApp broadcast rates look very solid. Can we test a pilot batch of 500 WhatsApp broadcasts tomorrow?`
    }
    if (q.includes('photo') || q.includes('image') || q.includes('media') || q.includes('png') || q.includes('jpg')) {
      return `Got the image! The template visual and preview looks crisp. Let's move forward with this design.`
    }
    if (q.includes('document') || q.includes('pdf')) {
      return `Received the document! Reviewing the enterprise compliance details now.`
    }
    if (q.includes('contact')) {
      return `Thanks for sharing the contact! I have reached out directly to the sales desk.`
    }
    if (q.includes('poll')) {
      return `Just voted on the poll! Looking forward to the results.`
    }
    if (q.includes('demo') || q.includes('schedule') || q.includes('meeting') || q.includes('tomorrow')) {
      return `Sounds great! Tomorrow at 3:00 PM works perfectly for our operations team. Looking forward to it.`
    }
    return `Thank you, ${name.split(' ')[0]} here. We have noted this and our team will get back to you in a few minutes!`
  }


  // Start voice recording
  const handleStartVoiceRecording = async () => {
    setEmojiPickerOpen(false)
    setAttachmentMenuOpen(false)

    if (activeAudioElementRef.current) {
      activeAudioElementRef.current.pause()
      activeAudioElementRef.current = null
    }
    stopAgentSpeech()
    setPlayingAudioId(null)

    const controller = new VoiceRecorderController({
      onTick: (sec, formatted) => {
        setVoiceDuration(sec)
        setVoiceFormattedDuration(formatted)
      },
      onLevels: (levels) => {
        setVoiceAudioLevels(levels)
      },
      onTranscript: (t) => {
        setVoiceTranscript(t)
      },
    })

    voiceControllerRef.current = controller

    const result = await controller.start()
    setIsRecordingVoice(true)
    setIsSimulatedVoice(result.isSimulated)
    setVoiceDuration(0)
    setVoiceFormattedDuration('0:00')

    if (result.isSimulated) {
      notify('Demo Audio Active. (Mic is blocked in browser - click "Unblock Mic" to allow real mic).')
    } else {
      notify('Microphone active! Recording WhatsApp voice note…')
    }
  }

  // Explicitly prompt/retry browser microphone permission
  const handleRequestMicPermission = async () => {
    const res = await requestMicrophonePermission()
    if (res.granted) {
      notify('Microphone unblocked successfully!')
      setShowMicHelpModal(false)
      if (isRecordingVoice) {
        handleCancelVoiceRecording()
        setTimeout(() => handleStartVoiceRecording(), 150)
      }
    } else {
      setShowMicHelpModal(true)
    }
  }

  // Cancel & discard voice recording
  const handleCancelVoiceRecording = () => {
    if (voiceControllerRef.current) {
      voiceControllerRef.current.cancel()
      voiceControllerRef.current = null
    }
    setIsRecordingVoice(false)
    setVoiceDuration(0)
    setVoiceFormattedDuration('0:00')
    setVoiceTranscript('')
    notify('Voice note discarded.')
  }

  // Send voice note
  const handleSendVoiceRecording = async () => {
    const now = new Date()
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    let recordingResult: { audioUrl: string; formattedDuration: string; transcript: string }

    if (voiceControllerRef.current && voiceControllerRef.current.isRecording) {
      try {
        const result = await voiceControllerRef.current.stop()
        recordingResult = {
          audioUrl: result.audioUrl,
          formattedDuration: result.formattedDuration,
          transcript: result.transcript,
        }
      } catch (err) {
        console.warn('Failed stopping recorder, falling back to simulated:', err)
        const sim = await createSimulatedVoiceNote(Math.max(2, voiceDuration))
        recordingResult = {
          audioUrl: sim.audioUrl,
          formattedDuration: sim.formattedDuration,
          transcript: sim.transcript,
        }
      }
    } else {
      const sim = await createSimulatedVoiceNote(Math.max(2, voiceDuration))
      recordingResult = {
        audioUrl: sim.audioUrl,
        formattedDuration: sim.formattedDuration,
        transcript: voiceTranscript || sim.transcript,
      }
    }

    voiceControllerRef.current = null
    setIsRecordingVoice(false)

    const voiceMsg: Message = {
      id: `m_${Date.now()}`,
      sender: 'agent',
      text: recordingResult.transcript
        ? `Voice note: "${recordingResult.transcript}"`
        : 'Voice note',
      time: timeStr,
      status: 'sent',
      type: 'audio',
      audioDuration: recordingResult.formattedDuration,
      mediaUrl: recordingResult.audioUrl,
    }

    sendAnyMessage(voiceMsg, 'voice note')
    notify('WhatsApp voice note sent successfully!')
  }

  // Convert recognized speech to text inside input
  const handleInsertTranscriptAsText = () => {
    if (voiceTranscript) {
      setInputText(voiceTranscript)
    }
    handleCancelVoiceRecording()
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  return (
    <DashboardLayout
      search={searchQuery}
      activeNav="inbox"
      onSearchChange={setSearchQuery}
      onNotice={notify}
      onNewCampaign={() => notify('Launching new campaign…')}
    >
      <div className="w-full h-full flex flex-1 overflow-hidden bg-white inbox-scroll-container">
        {/* =========================================================
            LEFT COLUMN: Conversations List (WhatsApp Web Style)
           ========================================================= */}
        <aside className="w-full sm:w-80 md:w-96 flex flex-col border-r border-[#e9edef] bg-white flex-shrink-0 h-full min-h-0 relative">
          {newChatDrawerOpen ? (
            /* =========================================================
               WHATSAPP "NEW CHAT" DRAWER PANEL (Authentic WhatsApp Web)
               ========================================================= */
            <div className="flex flex-col h-full bg-white select-none animate-in slide-in-from-left duration-200 min-h-0">
              {/* Header */}
              <div className="h-28 bg-[#008069] text-white px-5 pb-3 flex flex-col justify-end flex-shrink-0 shadow-sm">
                <div className="flex items-center gap-5">
                  <button
                    type="button"
                    onClick={() => {
                      setNewChatDrawerOpen(false)
                      setShowCustomContactForm(false)
                    }}
                    className="p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-white"
                    title="Back to chats"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </button>
                  <div>
                    <h3 className="text-lg font-bold leading-tight">New chat</h3>
                    <p className="text-[11px] text-white/80">Message CRM contacts or any phone number</p>
                  </div>
                </div>
              </div>

              {/* Search Box */}
              <div className="p-2.5 bg-white border-b border-[#f0f2f5] flex-shrink-0">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f0f2f5] rounded-lg">
                  <svg className="w-4 h-4 text-[#54656f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search name, phone, or company..."
                    value={newChatSearchQuery}
                    onChange={(e) => setNewChatSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-xs text-ink placeholder-[#667781] outline-none"
                    autoFocus
                  />
                  {newChatSearchQuery && (
                    <button
                      onClick={() => setNewChatSearchQuery('')}
                      className="text-[#667781] hover:text-ink text-xs font-bold cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Direct Phone Number / New Contact Expander */}
              <div className="border-b border-[#f0f2f5] bg-white flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCustomContactForm((prev) => !prev)}
                  className="w-full flex items-center gap-3.5 px-4 py-3 hover:bg-[#f0f2f5] transition-colors cursor-pointer text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-[#00a884] text-white flex items-center justify-center shadow-xs flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-ink">New contact / Direct number</h4>
                    <p className="text-[11px] text-[#667781] truncate">Message any new WhatsApp number directly</p>
                  </div>
                  <svg
                    className={`w-4 h-4 text-[#54656f] transition-transform ${showCustomContactForm ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showCustomContactForm && (
                  <form
                    onSubmit={handleCreateDirectChat}
                    className="px-4 pb-4 pt-1 space-y-2.5 bg-[#f9fafb] border-t border-[#f0f2f5] animate-in fade-in duration-150"
                  >
                    <div>
                      <label className="block text-[10.5px] font-semibold text-[#54656f] mb-1">
                        Contact Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Vikram Sharma"
                        value={newContactName}
                        onChange={(e) => setNewContactName(e.target.value)}
                        required
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#d1d7db] rounded-lg focus:border-whatsapp-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-semibold text-[#54656f] mb-1">
                        WhatsApp Phone Number *
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. +91 98200 12345"
                        value={newContactPhone}
                        onChange={(e) => setNewContactPhone(e.target.value)}
                        required
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#d1d7db] rounded-lg focus:border-whatsapp-600 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-semibold text-[#54656f] mb-1">
                        Company / Account (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Reliance Retail"
                        value={newContactCompany}
                        onChange={(e) => setNewContactCompany(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#d1d7db] rounded-lg focus:border-whatsapp-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-semibold text-[#54656f] mb-1">
                        Opening Message (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Hi Vikram, connecting from CallWave..."
                        value={newContactInitialMessage}
                        onChange={(e) => setNewContactInitialMessage(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#d1d7db] rounded-lg focus:border-whatsapp-600 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="submit"
                        className="flex-1 py-2 px-3 bg-[#008069] hover:bg-[#00705c] text-white text-xs font-bold rounded-lg transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Start WhatsApp Chat
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCustomContactForm(false)}
                        className="py-2 px-3 bg-white hover:bg-black/5 text-[#54656f] text-xs font-semibold rounded-lg border border-[#d1d7db] transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* CRM Contacts Section Title */}
              <div className="px-4 py-2 bg-[#f0f2f5] flex items-center justify-between text-[10.5px] font-bold text-[#54656f] uppercase tracking-wider flex-shrink-0">
                <span>CallWave CRM Contacts</span>
                <span className="text-[10px] font-semibold text-[#8696a0]">{filteredCrmContacts.length} available</span>
              </div>

              {/* CRM Contacts List */}
              <div className="flex-1 overflow-y-auto divide-y divide-[#f5f6f6] no-scrollbar">
                {filteredCrmContacts.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#8696a0]">
                    No CRM contacts match "{newChatSearchQuery}".
                  </div>
                ) : (
                  filteredCrmContacts.map((contact) => {
                    const isAlreadyInChats = conversations.some(
                      (c) =>
                        c.name.toLowerCase() === contact.name.toLowerCase() ||
                        c.phone.replace(/\D/g, '') === contact.phone.replace(/\D/g, '')
                    )
                    const initials = contact.name
                      .split(' ')
                      .map((p) => p[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()

                    return (
                      <div
                        key={contact.id}
                        onClick={() => handleStartChatWithContact(contact)}
                        className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-[#f0f2f5] transition-colors cursor-pointer select-none group"
                      >
                        <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform">
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-ink truncate group-hover:text-whatsapp-700 transition-colors">
                              {contact.name}
                            </h4>
                            {isAlreadyInChats ? (
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                Active Chat
                              </span>
                            ) : (
                              <span className="text-[9px] font-semibold text-whatsapp-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                Start Chat →
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-[#667781] truncate">
                            <span className="truncate">{contact.company}</span>
                            <span>•</span>
                            <span className="font-mono text-[10px]">{contact.phone}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          ) : (
            /* =========================================================
               STANDARD CONVERSATIONS LIST
               ========================================================= */
            <>
              {/* Left Header */}
              <div className="h-16 px-4 flex items-center justify-between bg-[#f0f2f5] border-b border-[#e9edef] flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-whatsapp-600 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                    CW
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-ink leading-tight">CallWave Inbox</h4>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                        Cloud API
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-whatsapp-500 animate-pulse" />
                      <span className="text-[10px] text-whatsapp-700 font-medium">Live Webhook</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[#54656f]">
                  <button
                    type="button"
                    className={`p-2 rounded-full transition-colors cursor-pointer ${newChatDrawerOpen ? 'bg-[#e2e7ea] text-whatsapp-700' : 'hover:bg-[#e2e7ea]'
                      }`}
                    title="New chat"
                    onClick={() => {
                      setNewChatDrawerOpen(true)
                      setShowCustomContactForm(false)
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="p-2 hover:bg-[#e2e7ea] rounded-full transition-colors cursor-pointer"
                    title="Filter unread"
                    onClick={() => setActiveFilter((prev) => (prev === 'unread' ? 'all' : 'unread'))}
                  >
                    <svg
                      className={`w-5 h-5 ${activeFilter === 'unread' ? 'text-whatsapp-600' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 4h18M6 9h12M9 14h6M11 19h2" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* WhatsApp Search Bar & Filter Chips */}
              <div className="p-2.5 bg-white border-b border-[#f0f2f5] space-y-2 flex-shrink-0">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f0f2f5] rounded-lg">
                  <svg className="w-4 h-4 text-[#54656f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search or start new chat"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-xs text-ink placeholder-[#667781] outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-[#667781] hover:text-ink text-xs font-bold cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Quick Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-3 py-1 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer ${activeFilter === 'all'
                        ? 'bg-whatsapp-100 text-whatsapp-800 border border-whatsapp-300 font-bold'
                        : 'bg-[#f0f2f5] text-[#54656f] hover:bg-[#e9edef]'
                      }`}
                  >
                    All Chats
                  </button>
                  <button
                    onClick={() => setActiveFilter('unread')}
                    className={`px-3 py-1 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer ${activeFilter === 'unread'
                        ? 'bg-whatsapp-100 text-whatsapp-800 border border-whatsapp-300 font-bold'
                        : 'bg-[#f0f2f5] text-[#54656f] hover:bg-[#e9edef]'
                      }`}
                  >
                    Unread ({conversations.filter((c) => c.unreadCount > 0).length})
                  </button>
                  <button
                    onClick={() => setActiveFilter('high-intent')}
                    className={`px-3 py-1 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer ${activeFilter === 'high-intent'
                        ? 'bg-whatsapp-100 text-whatsapp-800 border border-whatsapp-300 font-bold'
                        : 'bg-[#f0f2f5] text-[#54656f] hover:bg-[#e9edef]'
                      }`}
                  >
                    🔥 High Intent
                  </button>
                </div>
              </div>

              {/* Conversation List Rows */}
              <div className="flex-1 overflow-y-auto divide-y divide-[#f5f6f6] no-scrollbar">
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted">
                    No WhatsApp conversations match your filter.
                  </div>
                ) : (
                  filteredConversations.map((c) => {
                    const isSelected = c.id === selectedId
                    return (
                      <div
                        key={c.id}
                        onClick={() => handleSelectConversation(c.id)}
                        className={`flex items-center gap-3 px-3.5 py-3 transition-colors cursor-pointer select-none ${isSelected ? 'bg-[#f0f2f5]' : 'hover:bg-[#f5f6f6]'
                          }`}
                      >
                        {/* Contact Avatar with Online Beacon */}
                        <div className="relative flex-shrink-0">
                          <div
                            className={`w-12 h-12 rounded-full ${c.color} flex items-center justify-center text-white font-bold text-sm shadow-sm`}
                          >
                            {c.avatar}
                          </div>
                          {c.online && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-whatsapp-500 border-2 border-white rounded-full" />
                          )}
                        </div>

                        {/* Content Preview */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <h4 className="text-xs font-bold text-ink truncate flex items-center gap-1.5">
                              <span>{c.name}</span>
                              {c.leadScore >= 90 && (
                                <span className="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 font-bold rounded">
                                  Hot
                                </span>
                              )}
                            </h4>
                            <span
                              className={`text-[10px] whitespace-nowrap font-medium ${c.unreadCount > 0 ? 'text-whatsapp-600 font-bold' : 'text-[#667781]'
                                }`}
                            >
                              {c.lastMessageTime}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <p className="text-[11.5px] text-[#667781] truncate pr-2">
                              {c.lastMessage}
                            </p>
                            {c.unreadCount > 0 && (
                              <span className="flex-shrink-0 px-1.5 py-0.5 min-w-[18px] text-center text-[10px] font-bold bg-whatsapp-500 text-white rounded-full">
                                {c.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </>
          )}
        </aside>

        {/* =========================================================
              CENTER: Active WhatsApp Chat Box
             ========================================================= */}
        <main className="flex-1 flex flex-col min-w-0 h-full min-h-0 bg-[#efeae2] relative overflow-hidden">
          {/* WhatsApp Signature Doodle Wallpaper Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30 bg-repeat"
            style={{
              backgroundImage: `radial-gradient(#128c7e 0.5px, transparent 0.5px)`,
              backgroundSize: '16px 16px',
            }}
          />

          {/* Chat Top Header */}
          <div className="relative z-10 h-16 px-4 bg-[#f0f2f5] border-b border-[#e9edef] flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-full ${activeConversation.color} flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0`}
              >
                {activeConversation.avatar}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-ink truncate">
                    {activeConversation.name}
                  </h3>
                  <svg className="w-3.5 h-3.5 text-whatsapp-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <p className="text-[11px] text-[#667781] truncate">
                  {isTyping ? (
                    <span className="text-whatsapp-700 font-semibold animate-pulse">typing…</span>
                  ) : activeConversation.online ? (
                    <span className="text-whatsapp-700 font-medium">online</span>
                  ) : (
                    <span>{activeConversation.lastSeen || 'offline'}</span>
                  )}
                </p>
              </div>
            </div>

            {/* Chat Actions */}
            <div className="flex items-center gap-1 text-[#54656f]">
              {/* CRM Panel Toggle */}
              <button
                type="button"
                onClick={() => setCrmPanelOpen((prev) => !prev)}
                className={`p-2 rounded-full hover:bg-[#e2e7ea] transition-colors cursor-pointer ${crmPanelOpen ? 'text-whatsapp-700 bg-[#e2e7ea]' : ''
                  }`}
                title="Toggle Contact CRM Info"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 no-scrollbar">
            {/* Security Banner */}
            <div className="flex justify-center my-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ffeecd] border border-[#f0dfb6] rounded-lg text-[10.5px] text-[#54656f] max-w-md text-center shadow-xs">
                <svg className="w-3.5 h-3.5 text-[#e59b20] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                </svg>
                <span>
                  Messages are end-to-end encrypted. No one outside of this chat can read them.
                </span>
              </div>
            </div>

            {/* Date Pill */}
            <div className="flex justify-center my-3">
              <span className="px-3 py-1 bg-white/85 text-[#54656f] text-[10.5px] font-semibold rounded-md shadow-xs">
                TODAY
              </span>
            </div>

            {/* Messages Flow */}
            {activeConversation.messages.map((m) => {
              const isOut = m.sender === 'agent'

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isOut ? 'items-end' : 'items-start'} max-w-full`}
                >
                  <div
                    className={`relative max-w-[85%] sm:max-w-[70%] px-3.5 py-2 rounded-lg text-[13px] leading-relaxed shadow-xs ${isOut
                        ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-none'
                        : 'bg-white text-[#111b21] rounded-tl-none'
                      }`}
                  >
                    {/* Image Message Type */}
                    {m.type === 'image' && (
                      <div className="space-y-1.5 max-w-sm">
                        {m.mediaUrl && (
                          <img
                            src={m.mediaUrl}
                            alt={m.fileName || 'Attached image'}
                            className="rounded-lg max-h-72 w-full object-cover shadow-2xs cursor-pointer hover:opacity-95 transition-opacity"
                            onClick={() => {
                              const w = window.open('')
                              w?.document.write(`<img src="${m.mediaUrl}" style="max-width:100%"/>`)
                            }}
                          />
                        )}
                        {m.text && m.text !== m.fileName && (
                          <p className="text-[13px] text-[#111b21]">{m.text}</p>
                        )}
                      </div>
                    )}

                    {/* Document Message Type */}
                    {m.type === 'document' && (
                      <div className="space-y-1.5 w-72 max-w-full">
                        <div className="flex items-center gap-3 p-2.5 bg-black/[0.04] rounded-lg border border-black/[0.08]">
                          <div className="w-10 h-10 rounded-lg bg-rose-500 text-white flex items-center justify-center flex-shrink-0 font-bold text-xs uppercase shadow-xs">
                            {m.fileName?.split('.').pop() || 'PDF'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-bold text-ink truncate" title={m.fileName}>
                              {m.fileName || 'Document.pdf'}
                            </h5>
                            <p className="text-[10px] text-[#667781] font-medium">
                              {m.fileSize || '1.8 MB'} • Document
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => notify(`Opening ${m.fileName || 'document'}…`)}
                            className="p-1.5 hover:bg-white rounded-full text-[#54656f] hover:text-ink transition-colors cursor-pointer"
                            title="Download document"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>
                        </div>
                        {m.text && m.text !== m.fileName && (
                          <p className="text-[13px] text-[#111b21]">{m.text}</p>
                        )}
                      </div>
                    )}

                    {/* Contact Card Message Type */}
                    {m.type === 'contact' && (
                      <div className="w-64 max-w-full space-y-2">
                        <div className="flex items-center gap-3 p-2.5 bg-black/[0.04] rounded-lg border border-black/[0.08]">
                          <div className="w-10 h-10 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
                            {m.contactName ? m.contactName.charAt(0) : 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-bold text-ink truncate">{m.contactName}</h5>
                            <p className="text-[10.5px] text-whatsapp-700 font-semibold">{m.contactPhone}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setInputText(`Hi ${m.contactName?.split(' ')[0]}, `)
                            notify(`Drafting message to ${m.contactName}`)
                          }}
                          className="w-full py-1.5 text-center text-xs font-bold text-whatsapp-700 hover:text-whatsapp-800 bg-white hover:bg-whatsapp-50 border border-whatsapp-500/30 rounded-lg transition-colors cursor-pointer"
                        >
                          Message Contact
                        </button>
                      </div>
                    )}

                    {/* Poll Message Type */}
                    {m.type === 'poll' && (
                      <div className="w-72 max-w-full space-y-2.5">
                        <div className="flex items-start gap-2">
                          <span className="text-base">📊</span>
                          <h4 className="text-xs font-bold text-ink leading-snug">{m.pollQuestion}</h4>
                        </div>
                        <div className="space-y-1.5">
                          {m.pollOptions?.map((opt, oIdx) => {
                            const totalVotes = m.pollOptions?.reduce((acc, curr) => acc + curr.votes, 0) || 1
                            const pct = Math.round((opt.votes / totalVotes) * 100)
                            return (
                              <button
                                key={oIdx}
                                type="button"
                                onClick={() => handleVotePoll(m.id, oIdx)}
                                className="w-full text-left p-2 rounded-lg bg-white hover:bg-whatsapp-50/60 border border-black/10 transition-colors cursor-pointer group"
                              >
                                <div className="flex items-center justify-between text-xs font-medium text-ink mb-1">
                                  <span className="group-hover:text-whatsapp-700 transition-colors truncate pr-2">{opt.text}</span>
                                  <span className="text-[10px] font-bold text-[#667781] flex-shrink-0">{opt.votes} ({pct}%)</span>
                                </div>
                                <div className="w-full h-1.5 bg-[#f0f2f5] rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-whatsapp-500 rounded-full transition-all duration-300"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* WhatsApp Product Catalog Card Type */}
                    {m.type === 'catalog' && (
                      <div className="w-72 sm:w-80 max-w-full space-y-2">
                        <div className="rounded-xl overflow-hidden border border-black/10 bg-white shadow-xs">
                          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-3 text-white">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-[10px]">
                                WhatsApp Catalog
                              </span>
                              <span>🛍️ Meta Verified</span>
                            </div>
                            <h4 className="text-sm font-extrabold mt-1.5">CallWave Automation Suite</h4>
                            <p className="text-[11px] text-white/90">Official Business Solutions & Plans</p>
                          </div>
                          <div className="p-3 space-y-2 text-xs divide-y divide-slate-100">
                            <div className="pt-1 flex justify-between items-center">
                              <div>
                                <div className="font-bold text-slate-900">AI Voice & WhatsApp Copilot</div>
                                <div className="text-[10px] text-slate-500">Autonomous voice calls & chat auto-reply</div>
                              </div>
                              <span className="font-bold text-emerald-700 text-xs">₹4,999/mo</span>
                            </div>
                            <div className="pt-2 flex justify-between items-center">
                              <div>
                                <div className="font-bold text-slate-900">Meta Tier-4 High-Throughput Broadcaster</div>
                                <div className="text-[10px] text-slate-500">100k+ daily broadcasts with zero bans</div>
                              </div>
                              <span className="font-bold text-emerald-700 text-xs">₹9,999/mo</span>
                            </div>
                            <div className="pt-2 flex justify-between items-center">
                              <div>
                                <div className="font-bold text-slate-900">HubSpot & CRM Live Bi-directional Sync</div>
                                <div className="text-[10px] text-slate-500">Instant lead capture and deal pipelines</div>
                              </div>
                              <span className="font-bold text-emerald-700 text-xs">₹2,999/mo</span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => notify('Opening WhatsApp Interactive Product Catalog…')}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>🛍️</span>
                          <span>View Full Catalog in WhatsApp</span>
                        </button>
                      </div>
                    )}

                    {/* Audio Note Message Type with Real Progressive Wave & Scrubbing */}
                    {m.type === 'audio' && (
                      <WhatsAppVoiceWavePlayer
                        id={m.id}
                        mediaUrl={m.mediaUrl}
                        text={m.text}
                        audioDuration={m.audioDuration}
                        isOutgoing={isOut}
                        activePlayingId={playingAudioId}
                        onPlayStateChange={setPlayingAudioId}
                        onNotify={notify}
                      />
                    )}

                    {/* Standard Text Message Type */}
                    {(!m.type || m.type === 'text' || m.type === 'action') && (
                      <div>{m.text}</div>
                    )}

                    {/* Action Buttons inside message */}
                    {m.actionButtons && (
                      <div className="mt-2.5 pt-2 border-t border-black/10 flex flex-wrap gap-1.5">
                        {m.actionButtons.map((btn, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(btn)}
                            className="px-2.5 py-1 bg-white hover:bg-[#f0f2f5] border border-whatsapp-500/30 text-whatsapp-800 text-[11px] font-bold rounded-md shadow-xs transition-colors cursor-pointer"
                          >
                            {btn}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Timestamp & Delivery Status */}
                    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-[#667781]">
                      <span>{m.time}</span>
                      {isOut && (
                        <span title={m.status}>
                          {m.status === 'read' ? (
                            <svg className="w-3.5 h-3.5 text-[#53bdeb]" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0l7-7zm-4.208 7-.896-.897.707-.707.543.543 6.646-6.647a.5.5 0 0 1 .708.708l-7.708 7.707v-.007z" />
                            </svg>
                          ) : m.status === 'delivered' ? (
                            <svg className="w-3.5 h-3.5 text-[#8696a0]" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0l7-7zm-4.208 7-.896-.897.707-.707.543.543 6.646-6.647a.5.5 0 0 1 .708.708l-7.708 7.707v-.007z" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3 text-[#8696a0]" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z" />
                            </svg>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Typing Indicator Bubble */}
            {isTyping && (
              <div className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-lg rounded-tl-none w-20 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8696a0] animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#8696a0] animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#8696a0] animate-bounce" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Scheduled Message Banner if scheduled for this contact */}
          {activeScheduledMessage && (
            <div className="relative z-10 px-4 py-2 bg-whatsapp-50 border-t border-whatsapp-300 flex items-center justify-between text-xs text-whatsapp-800 animate-in fade-in">
              <div className="flex items-center gap-2 truncate pr-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                <span className="font-bold text-ink flex-shrink-0">📅 Scheduled Message:</span>
                <span className="truncate text-[#54656f] italic">
                  "{activeScheduledMessage.text}"
                </span>
                <span className="text-[11px] text-whatsapp-700 font-mono px-2 py-0.5 rounded bg-white border border-whatsapp-300 flex-shrink-0">
                  {activeScheduledMessage.presetLabel}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCancelScheduled(activeScheduledMessage.id)}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 underline cursor-pointer flex-shrink-0 ml-2"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Hidden File Input for Real Attachments */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelected}
          />

          {/* =========================================================
                WHATSAPP CHAT SUITE: 3-ROW DARK MODERN TOOLBAR
               ========================================================= */}
          <div className="relative z-10 px-3 py-3 sm:px-4 bg-transparent border-t border-[#e9edef] space-y-3">
            {/* WhatsApp Emoji Picker Drawer */}
            {emojiPickerOpen && (
              <WhatsAppEmojiPicker
                onSelectEmoji={handleSelectEmoji}
                onClose={() => setEmojiPickerOpen(false)}
              />
            )}

            {/* TOP ROW: Schedule, Template, Auto-Reply, Generate with AI */}
            <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
              {/* Left: Schedule & Template */}
              <div className="flex items-center gap-2">
                {/* Schedule Button */}
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg border border-whatsapp-500/40 bg-white hover:bg-whatsapp-50 hover:border-whatsapp-600/70 text-whatsapp-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                  title="Schedule a WhatsApp message"
                >
                  <svg className="w-3.5 h-3.5 text-whatsapp-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Schedule</span>
                </button>

                {/* Template Button */}
                <button
                  type="button"
                  onClick={() => setTemplateModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg border border-whatsapp-500/40 bg-white hover:bg-whatsapp-50 hover:border-whatsapp-600/70 text-whatsapp-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                  title="Browse Meta Approved WhatsApp Templates"
                >
                  <svg className="w-3.5 h-3.5 text-whatsapp-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Template</span>
                </button>
              </div>

              {/* Right: Auto-Reply Switch + Generate with AI */}
              <div className="flex items-center gap-3">
                {/* Auto-Reply Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#54656f]">Auto-Reply</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={autoReplyEnabled}
                    onClick={handleToggleAutoReply}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${autoReplyEnabled ? 'bg-whatsapp-500 justify-end' : 'bg-[#cbd5d9] justify-start'
                      }`}
                    title={
                      autoReplyEnabled
                        ? 'AI Auto-Reply is active (Click to pause)'
                        : 'AI Auto-Reply is paused (Click to activate)'
                    }
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-xs transition-transform" />
                  </button>
                </div>

                {/* Generate with AI Button */}
                <button
                  type="button"
                  onClick={() => setAiCopilotModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#008069] hover:bg-[#00705c] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                  title="Generate personalized reply with AI"
                >
                  <span className="text-xs">✨</span>
                  <span>Generate with AI</span>
                </button>
              </div>
            </div>

            {/* BOTTOM ROW: Combined input bar with icons (+, 📎, 😊, 🎤, ✈️) */}
            {isRecordingVoice ? (
              /* Voice Recording Active View */
              <div className="flex items-center justify-between px-3 py-2 bg-white border border-rose-300 rounded-full shadow-inner animate-in fade-in duration-150">
                <button
                  type="button"
                  onClick={handleCancelVoiceRecording}
                  className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer flex-shrink-0"
                  title="Discard Voice Note"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>

                <div className="flex items-center gap-2.5 flex-1 px-3 min-w-0">
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-red-400">{voiceFormattedDuration}</span>
                  </div>

                  <div className="flex items-center gap-0.5 h-6 flex-1 max-w-[130px] sm:max-w-[180px]">
                    {voiceAudioLevels.map((lvl, idx) => (
                      <span
                        key={idx}
                        className="w-1 bg-red-400 rounded-full transition-all duration-75"
                        style={{ height: `${Math.max(4, Math.min(22, lvl * 0.22))}px` }}
                      />
                    ))}
                  </div>

                  {isSimulatedVoice ? (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-bold text-[10px] rounded-md border border-amber-200 hidden sm:inline">
                        ⚡ Demo Mic
                      </span>
                      <button
                        type="button"
                        onClick={handleRequestMicPermission}
                        className="px-2 py-0.5 bg-[#008069] hover:bg-[#00705c] text-white font-bold text-[10px] rounded-md transition-colors cursor-pointer"
                      >
                        Unblock
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="px-2 py-0.5 bg-whatsapp-50 text-whatsapp-700 font-bold text-[10px] rounded-md border border-whatsapp-300 hidden sm:inline">
                        🎙️ Live Mic
                      </span>
                      {voiceTranscript && (
                        <div className="flex items-center gap-1 truncate max-w-[150px]">
                          <span className="text-[11px] text-[#54656f] italic truncate max-w-[90px]">
                            “{voiceTranscript}”
                          </span>
                          <button
                            type="button"
                            onClick={handleInsertTranscriptAsText}
                            className="text-[10px] underline text-whatsapp-700 font-bold hover:text-whatsapp-600 cursor-pointer flex-shrink-0"
                            title="Type spoken text into input box"
                          >
                            Type text
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSendVoiceRecording}
                  className="w-9 h-9 bg-whatsapp-500 hover:bg-whatsapp-600 text-white rounded-full flex items-center justify-center transition-transform active:scale-95 cursor-pointer shadow-md flex-shrink-0"
                  title="Send Voice Note"
                >
                  <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            ) : (
              /* Normal 5-Icon Unified Input Bar */
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="flex items-center gap-2"
              >
                {/* 1) Plus (+) Attachment Menu Button */}
                <div className="relative">
                  {attachmentMenuOpen && (
                    <div
                      ref={attachmentMenuRef}
                      className="absolute bottom-full mb-3 left-0 z-50 bg-white border border-[#d1d7db] rounded-2xl shadow-2xl p-2 min-w-[220px] flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-150 select-none text-[#111b21]"
                      style={{
                        boxShadow: '0 14px 40px -4px rgba(11, 20, 26, 0.28), 0 0 0 1px rgba(11, 20, 26, 0.06)',
                      }}
                    >
                      {/* Document */}
                      <button
                        type="button"
                        onClick={() => handleTriggerUpload('.pdf,.doc,.docx,.txt,.csv,.xlsx,.zip')}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#f0f2f5] rounded-xl transition-colors text-left cursor-pointer group"
                      >
                        <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-500 border border-indigo-200 flex items-center justify-center shadow-xs flex-shrink-0">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-ink">Document</div>
                          <div className="text-[10px] text-[#667781] truncate">PDF, Word, Excel, CSV</div>
                        </div>
                      </button>

                      {/* Photos & Videos */}
                      <button
                        type="button"
                        onClick={() => handleTriggerUpload('image/*,video/*')}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#f0f2f5] rounded-xl transition-colors text-left cursor-pointer group"
                      >
                        <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-500 border border-blue-200 flex items-center justify-center shadow-xs flex-shrink-0">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-ink">Photos &amp; videos</div>
                          <div className="text-[10px] text-[#667781] truncate">Upload images or clips</div>
                        </div>
                      </button>

                      {/* Contact Card */}
                      <button
                        type="button"
                        onClick={() => {
                          setAttachmentMenuOpen(false)
                          setShareContactModalOpen(true)
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#f0f2f5] rounded-xl transition-colors text-left cursor-pointer group"
                      >
                        <div className="w-9 h-9 rounded-full bg-cyan-50 text-cyan-600 border border-cyan-200 flex items-center justify-center shadow-xs flex-shrink-0">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-ink">Contact Card</div>
                          <div className="text-[10px] text-[#667781] truncate">Share CRM contact info</div>
                        </div>
                      </button>

                      {/* Quick Poll */}
                      <button
                        type="button"
                        onClick={() => {
                          setAttachmentMenuOpen(false)
                          setCreatePollModalOpen(true)
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#f0f2f5] rounded-xl transition-colors text-left cursor-pointer group"
                      >
                        <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-500 border border-amber-200 flex items-center justify-center shadow-xs flex-shrink-0">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-ink">Quick Poll</div>
                          <div className="text-[10px] text-[#667781] truncate">Ask question with voting</div>
                        </div>
                      </button>

                      {/* Product Catalog */}
                      <button
                        type="button"
                        onClick={() => {
                          setAttachmentMenuOpen(false)
                          handleSendCatalog()
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#f0f2f5] rounded-xl transition-colors text-left cursor-pointer group"
                      >
                        <div className="w-9 h-9 rounded-full bg-whatsapp-50 text-whatsapp-600 border border-whatsapp-300 flex items-center justify-center shadow-xs flex-shrink-0">
                          <span className="text-base">🛍️</span>
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-ink">Product Catalog</div>
                          <div className="text-[10px] text-[#667781] truncate">Send WhatsApp Catalog Card</div>
                        </div>
                      </button>
                    </div>
                  )}

                  <button
                    ref={attachmentButtonRef}
                    type="button"
                    onClick={() => {
                      setAttachmentMenuOpen((prev) => !prev)
                      setEmojiPickerOpen(false)
                    }}
                    className={`p-2 rounded-full transition-all cursor-pointer ${attachmentMenuOpen
                        ? 'text-whatsapp-700 bg-whatsapp-100 rotate-45'
                        : 'text-[#54656f] hover:text-ink hover:bg-[#e2e7ea]'
                      }`}
                    title="Add attachment (Photos, Docs, Contact, Poll, Catalog)"
                  >
                    <svg className="w-5 h-5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {/* 2) Paperclip (📎) Direct Upload Button */}
                <button
                  type="button"
                  onClick={() => handleTriggerUpload('image/*,video/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.zip')}
                  className="p-2 text-[#54656f] hover:text-ink hover:bg-[#e2e7ea] rounded-full transition-colors cursor-pointer flex-shrink-0"
                  title="Direct File / Media Attachment"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>

                {/* 3) Unified Input Bar with Inside (😊, 🎤) */}
                <div className="flex-1 flex items-center bg-white border border-[#d1d7db] hover:border-[#b9c2c8] focus-within:border-whatsapp-500/70 focus-within:ring-2 focus-within:ring-whatsapp-500/15 rounded-full px-4 py-2 transition-all shadow-inner min-w-0">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Type a WhatsApp message, photo, video or emoji..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 bg-transparent text-xs sm:text-sm text-[#111b21] placeholder:text-[#8696a0] outline-none border-none min-w-0 pr-2"
                  />

                  {/* Inside Right: 😊 Emoji Button */}
                  <button
                    type="button"
                    onClick={() => setEmojiPickerOpen((prev) => !prev)}
                    className={`p-1 text-[#54656f] hover:text-amber-500 transition-colors cursor-pointer flex-shrink-0 ${emojiPickerOpen ? 'text-amber-500' : ''
                      }`}
                    title="WhatsApp Emojis"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>

                  {/* Inside Right: 🎤 Microphone Button */}
                  <button
                    type="button"
                    onClick={handleStartVoiceRecording}
                    className="p-1 text-[#54656f] hover:text-whatsapp-600 transition-colors cursor-pointer flex-shrink-0 ml-1"
                    title="Record WhatsApp Voice Note"
                  >
                    <svg className="w-5 h-5 hover:scale-105 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                    </svg>
                  </button>
                </div>

                {/* 4) Airplane (✈️) Send Button */}
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-whatsapp-500 hover:bg-whatsapp-600 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer shadow-md flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Send WhatsApp Message"
                >
                  <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </form>
            )}
          </div>
        </main>

        {/* =========================================================
              RIGHT COLUMN: Collapsible Contact CRM Details (Wati style)
             ========================================================= */}
        {crmPanelOpen && (
          <aside className="w-72 xl:w-80 border-l border-[#e9edef] bg-white flex flex-col h-full min-h-0 overflow-y-auto no-scrollbar hidden lg:flex flex-shrink-0">
            <div className="h-16 px-4 bg-[#f0f2f5] border-b border-[#e9edef] flex items-center justify-between">
              <h4 className="text-xs font-bold text-ink">Contact Details</h4>
              <button
                type="button"
                onClick={() => setCrmPanelOpen(false)}
                className="p-1.5 text-[#54656f] hover:text-ink rounded-full cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 flex flex-col items-center text-center border-b border-[#f0f2f5]">
              <div
                className={`w-20 h-20 rounded-full ${activeConversation.color} flex items-center justify-center text-white font-extrabold text-xl shadow-md mb-3`}
              >
                {activeConversation.avatar}
              </div>
              <h3 className="text-base font-extrabold text-ink">{activeConversation.name}</h3>
              <p className="text-xs text-[#54656f] font-medium">{activeConversation.company}</p>
              <p className="text-xs text-whatsapp-700 font-bold mt-1">{activeConversation.phone}</p>

              {/* Lead Score Indicator */}
              <div className="w-full mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Lead Quality Score
                  </span>
                  <span className="text-xs font-extrabold text-emerald-950">
                    {activeConversation.leadStage}
                  </span>
                </div>
                <span className="text-lg font-black text-whatsapp-700 font-mono">
                  {activeConversation.leadScore}/100
                </span>
              </div>
            </div>

            {/* Tags Section */}
            <div className="p-4 border-b border-[#f0f2f5]">
              <h5 className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">
                CRM Labels &amp; Tags
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {activeConversation.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-whatsapp-50 border border-whatsapp-200 text-whatsapp-800 text-[10.5px] font-semibold rounded-md"
                  >
                    {tag}
                  </span>
                ))}
                <button
                  type="button"
                  onClick={() => notify('Adding custom WhatsApp CRM tag…')}
                  className="px-2 py-0.5 border border-dashed border-[#8696a0] text-[#54656f] hover:text-ink text-[10.5px] font-medium rounded-md cursor-pointer"
                >
                  + Add Tag
                </button>
              </div>
            </div>

            {/* CRM Actions */}
            <div className="p-4 space-y-2">
              <h5 className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">
                Quick Actions
              </h5>
              <button
                type="button"
                onClick={() => notify(`Dispatching WhatsApp template to ${activeConversation.name}…`)}
                className="w-full py-2 px-3 bg-whatsapp-600 hover:bg-whatsapp-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
                <span>Send WhatsApp Template</span>
              </button>
              <button
                type="button"
                onClick={() => notify('Exporting WhatsApp chat transcript as PDF…')}
                className="w-full py-2 px-3 bg-[#f0f2f5] hover:bg-[#e2e7ea] text-ink text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4 text-[#54656f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export Chat Transcript</span>
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* Microphone Permission Guide Modal */}
      {showMicHelpModal && (
        <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowMicHelpModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-black/10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                  🎙️
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink">Enable Microphone in Browser</h3>
                  <p className="text-xs text-[#54656f]">Chrome / Edge has blocked microphone access</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMicHelpModal(false)}
                className="text-[#667781] hover:text-ink font-bold text-2xl leading-none p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#3b4a54] bg-[#f0f2f5] p-4 rounded-xl mb-5">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-whatsapp-600 text-white flex items-center justify-center font-bold flex-shrink-0 text-[10px]">1</span>
                <p>Look at the address bar at the top of your browser (next to <strong>localhost:5174</strong>).</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-whatsapp-600 text-white flex items-center justify-center font-bold flex-shrink-0 text-[10px]">2</span>
                <p>Click the <strong>🔒 Padlock icon</strong> or <strong>🎛️ Tune icon</strong> on the left side of the URL.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-whatsapp-600 text-white flex items-center justify-center font-bold flex-shrink-0 text-[10px]">3</span>
                <p>Under <strong>Microphone</strong>, switch from <em>Block</em> to <strong>Allow</strong> (or Reset permission).</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-whatsapp-600 text-white flex items-center justify-center font-bold flex-shrink-0 text-[10px]">4</span>
                <p>Click the <strong>"Retry Microphone"</strong> button below!</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowMicHelpModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#54656f] hover:text-ink cursor-pointer"
              >
                Continue in Demo Mode
              </button>
              <button
                type="button"
                onClick={handleRequestMicPermission}
                className="px-4 py-2 bg-whatsapp-600 hover:bg-whatsapp-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
              >
                Retry Microphone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Contact Card Modal */}
      {shareContactModalOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => e.target === e.currentTarget && setShareContactModalOpen(false)}
        >
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border border-black/10 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0f2f5]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-sm">
                  👤
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink">Share Contact Card</h3>
                  <p className="text-[11px] text-[#667781]">Send a CRM contact directly to WhatsApp chat</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShareContactModalOpen(false)}
                className="text-[#667781] hover:text-ink text-xl font-bold cursor-pointer leading-none p-1"
              >
                ×
              </button>
            </div>

            <div className="py-3">
              <input
                type="text"
                placeholder="Search contact name or phone..."
                value={shareContactSearch}
                onChange={(e) => setShareContactSearch(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#f0f2f5] rounded-lg outline-none placeholder-[#667781] focus:ring-1 focus:ring-whatsapp-600"
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[#f5f6f6] no-scrollbar">
              {filteredShareContacts.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#8696a0]">
                  No contacts found.
                </div>
              ) : (
                filteredShareContacts.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleShareContactCard(c)}
                    className="flex items-center gap-3 p-2.5 hover:bg-[#f0f2f5] rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs flex-shrink-0">
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-ink truncate group-hover:text-whatsapp-700 transition-colors">
                        {c.name}
                      </h4>
                      <p className="text-[10.5px] text-[#667781] truncate">{c.company} • {c.phone}</p>
                    </div>
                    <button
                      type="button"
                      className="px-2.5 py-1 bg-whatsapp-50 text-whatsapp-700 hover:bg-whatsapp-600 hover:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                    >
                      Send
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Quick Poll Modal */}
      {createPollModalOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => e.target === e.currentTarget && setCreatePollModalOpen(false)}
        >
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border border-black/10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0f2f5]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                  📊
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink">Create WhatsApp Poll</h3>
                  <p className="text-[11px] text-[#667781]">Interactive multi-choice question for this chat</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCreatePollModalOpen(false)}
                className="text-[#667781] hover:text-ink text-xl font-bold cursor-pointer leading-none p-1"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSendPoll} className="space-y-3.5 pt-3">
              <div>
                <label className="block text-[11px] font-bold text-[#54656f] mb-1">
                  Poll Question *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Which demo slot works best for your team?"
                  value={pollQuestionInput}
                  onChange={(e) => setPollQuestionInput(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-[#f0f2f5] rounded-lg outline-none placeholder-[#667781] focus:ring-1 focus:ring-whatsapp-600"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-[#54656f]">
                  Options (Minimum 2)
                </label>
                {pollOptionInputs.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs text-[#8696a0] font-mono w-4 text-center">{idx + 1}.</span>
                    <input
                      type="text"
                      placeholder={`Option ${idx + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const next = [...pollOptionInputs]
                        next[idx] = e.target.value
                        setPollOptionInputs(next)
                      }}
                      className="flex-1 px-3 py-1.5 text-xs bg-[#f0f2f5] rounded-lg outline-none placeholder-[#667781] focus:ring-1 focus:ring-whatsapp-600"
                    />
                    {pollOptionInputs.length > 2 && (
                      <button
                        type="button"
                        onClick={() => {
                          setPollOptionInputs(pollOptionInputs.filter((_, i) => i !== idx))
                        }}
                        className="text-red-500 hover:text-red-700 text-sm font-bold p-1 cursor-pointer"
                        title="Remove option"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}

                {pollOptionInputs.length < 5 && (
                  <button
                    type="button"
                    onClick={() => setPollOptionInputs([...pollOptionInputs, ''])}
                    className="text-xs text-whatsapp-700 hover:text-whatsapp-800 font-bold flex items-center gap-1 pt-1 cursor-pointer"
                  >
                    <span>+ Add Option</span>
                  </button>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#f0f2f5]">
                <button
                  type="button"
                  onClick={() => setCreatePollModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#54656f] hover:text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#008069] hover:bg-[#00705c] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Send Poll</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Message Modal */}
      <ScheduleMessageModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        contactName={activeConversation.name}
        contactPhone={activeConversation.phone}
        initialText={inputText}
        onSchedule={handleScheduleMessage}
      />

      {/* Meta WhatsApp Templates Modal */}
      <TemplateSelectorModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        contactName={activeConversation.name}
        companyName={activeConversation.company}
        onSelectTemplate={(formatted) => {
          setInputText(formatted)
          setTimeout(() => inputRef.current?.focus(), 50)
        }}
        onSendDirectly={(formatted, buttons) => {
          const now = new Date()
          const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          const tmplMsg: Message = {
            id: `m_tmpl_${Date.now()}`,
            sender: 'agent',
            text: formatted,
            time: timeStr,
            status: 'sent',
            type: buttons && buttons.length > 0 ? 'action' : 'text',
            actionButtons: buttons,
          }
          sendAnyMessage(tmplMsg, 'template message')
          notify('Meta approved template sent to WhatsApp!')
        }}
      />

      {/* AI Copilot Response Generator Modal */}
      <AiCopilotModal
        isOpen={aiCopilotModalOpen}
        onClose={() => setAiCopilotModalOpen(false)}
        contactName={activeConversation.name}
        companyName={activeConversation.company}
        leadStage={activeConversation.leadStage}
        onInsertInChat={(draft) => {
          setInputText(draft)
          setTimeout(() => inputRef.current?.focus(), 50)
        }}
        onSendNow={(draft) => {
          handleSendMessage(draft)
          notify('AI generated reply sent!')
        }}
      />

      {toast && <Toast key={toast.id} message={toast.message} onClose={closeToast} />}
    </DashboardLayout>
  )
}
