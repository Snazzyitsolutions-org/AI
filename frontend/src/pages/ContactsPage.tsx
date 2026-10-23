import { useState, useMemo, useCallback } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../components/dashboard/DashboardLayout'
import {
  CONTACTS,
  type Contact,
  type ContactStatus,
  type CrmStage,
} from '../components/dashboard/campaignData'
import { ImportContactsModal } from '../components/dashboard/ImportContactsModal'
import { Toast } from '../components/dashboard/Toast'
import { usePageTitle } from '../lib/usePageTitle'
import {
  SearchIcon,
  PlusIcon,
  UploadIcon,
  DownloadIcon,
  WhatsAppIcon,
  CloseIcon,
  CheckCircleIcon,
  TrashIcon,
  CopyIcon,
  ContactsIcon,
  PipelineIcon,
  SlidersIcon,
  DashboardIcon,
} from '../components/dashboard/DashboardIcons'
import { SparkIcon } from '../components/icons'

const SEGMENT_TABS = [
  { id: 'all', label: 'All Contacts' },
  { id: 'high-intent', label: 'High Intent (80+)' },
  { id: 'enterprise-cfo', label: 'Enterprise CFO' },
  { id: 'warm-leads', label: 'Warm Leads' },
  { id: 'meeting-booked', label: 'Meeting Booked' },
  { id: 'dnc', label: 'Opted Out / Unsub' },
] as const

const CRM_STAGES: CrmStage[] = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won']

export function ContactsPage() {
  usePageTitle('Contacts & Audience CRM · CallWave')
  const navigate = useNavigate()

  const [contacts, setContacts] = useState<Contact[]>(CONTACTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSegment, setSelectedSegment] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedStage, setSelectedStage] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('score-desc')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  // Selection state
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set())

  // Modal / Drawer state
  const [inspectingContact, setInspectingContact] = useState<Contact | null>(null)
  const [inspectingNotes, setInspectingNotes] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  // Toast notification
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null)
  const showToast = useCallback((message: string) => {
    setToast({ id: Date.now(), message })
  }, [])
  const closeToast = useCallback(() => setToast(null), [])

  // New Contact Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    location: 'San Francisco, CA',
    timezone: 'PST (UTC-8)',
    dealValue: '$25,000',
    segment: 'Warm Leads',
    crmStage: 'New' as CrmStage,
    notes: '',
  })

  // Dynamic Segment Counts
  const segmentCounts = useMemo(() => {
    return {
      all: contacts.length,
      'high-intent': contacts.filter((c) => c.score >= 80).length,
      'enterprise-cfo': contacts.filter(
        (c) =>
          c.segment === 'Enterprise CFO' ||
          c.role.toLowerCase().includes('cfo') ||
          c.role.toLowerCase().includes('finance') ||
          c.role.toLowerCase().includes('director'),
      ).length,
      'warm-leads': contacts.filter((c) => c.intent === 'High' || c.intent === 'Warm').length,
      'meeting-booked': contacts.filter((c) => c.status === 'Meeting Booked').length,
      dnc: contacts.filter((c) => c.status === 'Do Not Call').length,
    }
  }, [contacts])

  // Filtered & Sorted Contacts
  const filteredContacts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    return contacts
      .filter((contact) => {
        // Search Filter
        if (q) {
          const matches =
            contact.name.toLowerCase().includes(q) ||
            contact.email.toLowerCase().includes(q) ||
            contact.company.toLowerCase().includes(q) ||
            contact.phone.toLowerCase().includes(q) ||
            contact.role.toLowerCase().includes(q) ||
            contact.tags.some((tag) => tag.toLowerCase().includes(q))
          if (!matches) return false
        }

        // Segment Filter
        if (selectedSegment === 'high-intent' && contact.score < 80) return false
        if (
          selectedSegment === 'enterprise-cfo' &&
          !(
            contact.segment === 'Enterprise CFO' ||
            contact.role.toLowerCase().includes('cfo') ||
            contact.role.toLowerCase().includes('finance') ||
            contact.role.toLowerCase().includes('director')
          )
        )
          return false
        if (
          selectedSegment === 'warm-leads' &&
          !(contact.intent === 'High' || contact.intent === 'Warm')
        )
          return false
        if (selectedSegment === 'meeting-booked' && contact.status !== 'Meeting Booked')
          return false
        if (selectedSegment === 'dnc' && contact.status !== 'Do Not Call') return false

        // Status Filter
        if (selectedStatus !== 'all' && contact.status !== selectedStatus) return false

        // CRM Stage Filter
        if (selectedStage !== 'all' && contact.crmStage !== selectedStage) return false

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'score-desc') return b.score - a.score
        if (sortBy === 'score-asc') return a.score - b.score
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name)
        if (sortBy === 'deal-desc') {
          const valA = parseInt(a.dealValue.replace(/[^0-9]/g, '')) || 0
          const valB = parseInt(b.dealValue.replace(/[^0-9]/g, '')) || 0
          return valB - valA
        }
        return 0
      })
  }, [contacts, searchQuery, selectedSegment, selectedStatus, selectedStage, sortBy])

  // Selection handlers
  const areAllVisibleSelected =
    filteredContacts.length > 0 &&
    filteredContacts.every((c) => selectedContactIds.has(c.id))

  const toggleSelectAll = () => {
    if (areAllVisibleSelected) {
      setSelectedContactIds(new Set())
    } else {
      setSelectedContactIds(new Set(filteredContacts.map((c) => c.id)))
    }
  }

  const toggleSelectOne = (id: string) => {
    setSelectedContactIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Batch Actions
  const handleBatchAssignCampaign = () => {
    const count = selectedContactIds.size
    setContacts((prev) =>
      prev.map((c) =>
        selectedContactIds.has(c.id)
          ? {
              ...c,
              status: 'In Campaign',
              activeCampaign: 'Q4 Reactivation & Renewal',
            }
          : c,
      ),
    )
    showToast(`Assigned ${count} contacts to "Q4 Reactivation & Renewal" campaign`)
    setSelectedContactIds(new Set())
  }

  const handleBatchDnc = () => {
    const count = selectedContactIds.size
    setContacts((prev) =>
      prev.map((c) =>
        selectedContactIds.has(c.id)
          ? {
              ...c,
              status: 'Do Not Call',
              tags: Array.from(new Set([...c.tags, 'WhatsApp Opted Out'])),
            }
          : c,
      ),
    )
    showToast(`Marked ${count} contacts as WhatsApp Opted Out`)
    setSelectedContactIds(new Set())
  }

  const handleBatchDelete = () => {
    const count = selectedContactIds.size
    setContacts((prev) => prev.filter((c) => !selectedContactIds.has(c.id)))
    showToast(`Removed ${count} contacts from audience directory`)
    setSelectedContactIds(new Set())
  }

  const handleBatchDial = () => {
    const count = selectedContactIds.size
    showToast(`Queued batch WhatsApp broadcast for ${count} contacts`)
  }

  // Export to CSV
  const handleExportCsv = (selectedOnly = false) => {
    const targetList = selectedOnly
      ? contacts.filter((c) => selectedContactIds.has(c.id))
      : filteredContacts

    if (targetList.length === 0) {
      showToast('No contacts to export.')
      return
    }

    const headers = [
      'Name',
      'Email',
      'Phone',
      'Company',
      'Role',
      'Location',
      'Timezone',
      'Score',
      'Intent',
      'Deal Value',
      'CRM Stage',
      'Status',
      'Active Campaign',
      'Tags',
    ]

    const rows = targetList.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.email.replace(/"/g, '""')}"`,
      `"${c.phone.replace(/"/g, '""')}"`,
      `"${c.company.replace(/"/g, '""')}"`,
      `"${c.role.replace(/"/g, '""')}"`,
      `"${c.location.replace(/"/g, '""')}"`,
      `"${c.timezone.replace(/"/g, '""')}"`,
      c.score,
      c.intent,
      `"${c.dealValue}"`,
      c.crmStage,
      c.status,
      `"${c.activeCampaign || ''}"`,
      `"${c.tags.join('; ')}"`,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `callwave_contacts_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    showToast(`Exported ${targetList.length} contacts to CSV`)
  }

  // Open Drawer
  const handleOpenDrawer = (contact: Contact) => {
    setInspectingContact(contact)
    setInspectingNotes(contact.notes || '')
  }

  // Save Notes inside Drawer
  const handleSaveNotes = () => {
    if (!inspectingContact) return
    setContacts((prev) =>
      prev.map((c) => (c.id === inspectingContact.id ? { ...c, notes: inspectingNotes } : c)),
    )
    setInspectingContact((prev) => (prev ? { ...prev, notes: inspectingNotes } : null))
    showToast('Contact notes updated successfully')
  }

  // Change CRM Stage
  const handleStageChange = (contactId: string, newStage: CrmStage) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, crmStage: newStage } : c)),
    )
    setInspectingContact((prev) => (prev ? { ...prev, crmStage: newStage } : null))
    showToast(`Updated CRM pipeline stage to "${newStage}"`)
  }

  // Create Single Contact
  const handleCreateContact = (e: FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.phone) {
      showToast('Name and phone number are required')
      return
    }

    const newContact: Contact = {
      id: `c-${Date.now()}`,
      name: formData.name,
      email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: formData.phone,
      company: formData.company || 'Enterprise Corp',
      role: formData.role || 'Decision Maker',
      location: formData.location,
      timezone: formData.timezone,
      score: 75,
      intent: 'Warm',
      dealValue: formData.dealValue,
      segment: formData.segment,
      status: 'Not Contacted',
      tags: ['Manual Add', 'Verified Phone', formData.segment],
      crmStage: formData.crmStage,
      aiSummary: 'Manually enrolled enterprise lead. Initial autonomous qualification pending.',
      notes: formData.notes || 'Added from CallWave Contacts dashboard.',
    }

    setContacts((prev) => [newContact, ...prev])
    setIsAddModalOpen(false)
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      role: '',
      location: 'San Francisco, CA',
      timezone: 'PST (UTC-8)',
      dealValue: '$25,000',
      segment: 'Warm Leads',
      crmStage: 'New',
      notes: '',
    })
    showToast(`Added contact: ${newContact.name} (${newContact.company})`)
  }

  // Copy Phone Helper
  const handleCopyPhone = (phone: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    navigator.clipboard?.writeText(phone)
    showToast(`Copied phone number ${phone} to clipboard`)
  }

  // Import Success Callback
  const handleImportSuccess = (count: number, filename: string) => {
    showToast(`Successfully parsed and verified ${count.toLocaleString()} leads from ${filename}`)
  }

  return (
    <DashboardLayout
      search={searchQuery}
      onSearchChange={setSearchQuery}
      onNotice={showToast}
      onNewCampaign={() => setIsAddModalOpen(true)}
      activeNav="contacts"
    >
      <div className="max-w-[1440px] mx-auto space-y-6 pb-16">
        {/* Simple & Clean Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Contacts</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {contacts.length} leads
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Manage your audience directory, verified WhatsApp numbers, and lead pipeline.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 text-xs font-semibold transition border border-slate-200 shadow-sm cursor-pointer"
              onClick={() => navigate('/inbox')}
              title="Open WhatsApp CRM Inbox"
            >
              <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
              WhatsApp Inbox
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 text-xs font-semibold transition border border-slate-200 shadow-sm cursor-pointer"
              onClick={() => setIsImportModalOpen(true)}
              title="Import lead CSV with automatic phone validation"
            >
              <UploadIcon className="w-4 h-4 text-slate-500" />
              Import CSV
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 text-xs font-semibold transition border border-slate-200 shadow-sm cursor-pointer"
              onClick={() => handleExportCsv(false)}
              title="Export contacts as CSV"
            >
              <DownloadIcon className="w-4 h-4 text-slate-500" />
              Export CSV
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition shadow-sm cursor-pointer active:scale-95"
              onClick={() => setIsAddModalOpen(true)}
            >
              <PlusIcon className="w-4 h-4" />
              Add Contact
            </button>
          </div>
        </div>

        {/* ================= SEGMENT FILTER TABS STRIP ================= */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" role="tablist">
          {SEGMENT_TABS.map((tab) => {
            const count = segmentCounts[tab.id as keyof typeof segmentCounts] ?? 0
            const isActive = selectedSegment === tab.id

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                }`}
                onClick={() => setSelectedSegment(tab.id)}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* ================= TOOLBAR & SEARCH ================= */}
        <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[260px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <SearchIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search by name, company, email, phone, role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-50/80 focus:bg-white text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-800 placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  <CloseIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns & View Mode Toggle */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="appearance-none bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 pl-3 pr-7 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  aria-label="Filter by WhatsApp status"
                >
                  <option value="all">All WhatsApp Statuses</option>
                  <option value="Not Contacted">Not Contacted</option>
                  <option value="In Campaign">In Campaign</option>
                  <option value="Call Completed">Delivered</option>
                  <option value="Meeting Booked">Meeting Booked</option>
                  <option value="Voicemail">Unread</option>
                  <option value="Do Not Call">Opted Out (DNC)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                  <SlidersIcon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="relative">
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="appearance-none bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 pl-3 pr-7 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  aria-label="Filter by CRM stage"
                >
                  <option value="all">All CRM Stages</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Won">Won</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                  <PipelineIcon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 pl-3 pr-6 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  aria-label="Sort contacts"
                >
                  <option value="score-desc">Score: High to Low</option>
                  <option value="score-asc">Score: Low to High</option>
                  <option value="deal-desc">Deal Value: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                  <span className="text-[10px]">▼</span>
                </div>
              </div>

              {/* View Switcher: Table vs Cards */}
              <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'table'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  onClick={() => setViewMode('table')}
                  title="Dense Table View"
                >
                  <span className="text-sm">☰</span> Table
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'cards'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  onClick={() => setViewMode('cards')}
                  title="Grid Cards View"
                >
                  <DashboardIcon className="w-3.5 h-3.5" /> Cards
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= DYNAMIC BATCH SELECTION BAR ================= */}
        {selectedContactIds.size > 0 && (
          <div className="sticky bottom-6 z-30 mx-auto flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#0c3529]/95 text-white p-3.5 px-5 shadow-2xl backdrop-blur-xl border border-emerald-500/30 animate-in fade-in slide-in-from-bottom-4">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-200">
              <CheckCircleIcon className="w-4 h-4 text-[#c8f169]" />
              {selectedContactIds.size} of {filteredContacts.length} contacts selected
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all cursor-pointer active:scale-95"
                onClick={handleBatchAssignCampaign}
              >
                Assign to Campaign
              </button>

              <button
                type="button"
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                onClick={handleBatchDial}
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
                Batch Broadcast
              </button>

              <button
                type="button"
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                onClick={() => handleExportCsv(true)}
              >
                <DownloadIcon className="w-3.5 h-3.5" />
                Export
              </button>

              <button
                type="button"
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all cursor-pointer active:scale-95"
                onClick={handleBatchDnc}
              >
                Mark as DNC
              </button>

              <button
                type="button"
                className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                onClick={handleBatchDelete}
                title="Remove selected contacts"
              >
                <TrashIcon className="w-3.5 h-3.5" />
                Delete
              </button>

              <button
                type="button"
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-300 transition-all cursor-pointer active:scale-95"
                onClick={() => setSelectedContactIds(new Set())}
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* ================= CONTACTS VIEW: TABLE OR CARDS ================= */}
        {filteredContacts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto shadow-2xs">
              <ContactsIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">No matching contacts found</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              No contacts matched your search query &ldquo;{searchQuery}&rdquo;. Try adjusting filters or
              enrolling new leads into the audience directory.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedSegment('all')
                  setSelectedStatus('all')
                  setSelectedStage('all')
                }}
              >
                Reset All Filters
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0c3529] hover:bg-[#124e3c] text-white transition-colors cursor-pointer flex items-center gap-1.5"
                onClick={() => setIsAddModalOpen(true)}
              >
                <PlusIcon className="w-3.5 h-3.5" />
                Add New Contact
              </button>
            </div>
          </div>
        ) : viewMode === 'table' ? (
          /* ================= DENSE ENTERPRISE TABLE ================= */
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs divide-y divide-slate-100">
                <thead className="bg-slate-50/90 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                  <tr>
                    <th className="w-10 px-4 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={areAllVisibleSelected}
                        onChange={toggleSelectAll}
                        aria-label="Select all visible contacts"
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3.5">Contact</th>
                    <th className="px-4 py-3.5">Company &amp; Timezone</th>
                    <th className="px-4 py-3.5">Verified Phone</th>
                    <th className="px-4 py-3.5">Intent &amp; Score</th>
                    <th className="px-4 py-3.5">CRM Stage</th>
                    <th className="px-4 py-3.5">WhatsApp Status</th>
                    <th className="px-4 py-3.5">Deal Value</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredContacts.map((contact) => {
                    const isSelected = selectedContactIds.has(contact.id)
                    const initials = contact.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()

                    // Intent badge color
                    let intentBadge = 'bg-slate-100 text-slate-700 border-slate-200'
                    if (contact.intent === 'High') {
                      intentBadge = 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    } else if (contact.intent === 'Warm') {
                      intentBadge = 'bg-amber-50 text-amber-800 border-amber-200'
                    } else if (contact.intent === 'Urgent') {
                      intentBadge = 'bg-rose-50 text-rose-800 border-rose-200 font-bold'
                    }

                    // Status dot indicator
                    let statusDot = 'bg-slate-400'
                    if (contact.status === 'In Campaign' || contact.status === 'Meeting Booked') {
                      statusDot = 'bg-emerald-500 animate-pulse'
                    } else if (contact.status === 'Call Completed') {
                      statusDot = 'bg-teal-500'
                    } else if (contact.status === 'Do Not Call') {
                      statusDot = 'bg-rose-500'
                    }

                    // CRM Stage pill color
                    let stageBadge = 'bg-slate-100 text-slate-700'
                    if (contact.crmStage === 'Won') stageBadge = 'bg-emerald-100 text-emerald-800 font-bold'
                    else if (contact.crmStage === 'Proposal') stageBadge = 'bg-blue-100 text-blue-800'
                    else if (contact.crmStage === 'Qualified') stageBadge = 'bg-purple-100 text-purple-800'

                    return (
                      <tr
                        key={contact.id}
                        className={`transition-colors cursor-pointer group ${
                          isSelected ? 'bg-emerald-50/60 hover:bg-emerald-50/80' : 'hover:bg-slate-50/80'
                        }`}
                        onClick={() => handleOpenDrawer(contact)}
                      >
                        {/* Checkbox */}
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(contact.id)}
                            aria-label={`Select ${contact.name}`}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                        </td>

                        {/* Contact Info */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0c3529] to-[#1e6650] text-[#c8f169] text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">
                              {initials}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                                {contact.name}
                              </div>
                              <div className="text-[11px] text-slate-500">{contact.role}</div>
                              <div className="text-[10px] text-slate-400">{contact.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Company & Timezone */}
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800">{contact.company}</div>
                          <span className="inline-block mt-0.5 text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {contact.location} · {contact.timezone}
                          </span>
                        </td>

                        {/* Phone */}
                        <td className="px-4 py-3">
                          <div className="font-mono text-xs font-semibold text-slate-800">
                            {contact.phone}
                          </div>
                          <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            <CheckCircleIcon className="w-3 h-3 text-emerald-600" />
                            E.164 Deliverable
                          </span>
                        </td>

                        {/* Intent & Score */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${intentBadge}`}
                            >
                              {contact.score}/100
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">
                              {contact.intent}
                            </span>
                          </div>
                        </td>

                        {/* CRM Stage */}
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${stageBadge}`}>
                            {contact.crmStage}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                            <span className={`h-1.5 w-1.5 rounded-full ${statusDot}`} />
                            {contact.status}
                          </span>
                        </td>

                        {/* Deal Value */}
                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-900 text-xs">
                            {contact.dealValue}
                          </span>
                        </td>

                        {/* Row Actions */}
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold transition-colors border border-emerald-200 cursor-pointer"
                              onClick={() => {
                                navigate('/inbox')
                                showToast(`Opening WhatsApp chat with ${contact.name}…`)
                              }}
                              title={`Chat with ${contact.name} on WhatsApp`}
                            >
                              <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
                              WhatsApp
                            </button>

                            <button
                              type="button"
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                              onClick={(e) => handleCopyPhone(contact.phone, e)}
                              title="Copy phone"
                            >
                              <CopyIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ================= MODERN CARDS GRID VIEW ================= */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContacts.map((contact) => {
              const isSelected = selectedContactIds.has(contact.id)
              const initials = contact.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()

              return (
                <div
                  key={contact.id}
                  className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer hover:shadow-md relative ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20'
                      : 'border-slate-200/80 hover:border-emerald-400/60'
                  }`}
                  onClick={() => handleOpenDrawer(contact)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0c3529] to-[#1e6650] text-[#c8f169] text-sm font-bold flex items-center justify-center shrink-0 shadow-2xs">
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm hover:text-emerald-800 transition-colors">
                          {contact.name}
                        </h3>
                        <p className="text-xs text-slate-500">{contact.role}</p>
                        <p className="text-[11px] font-semibold text-slate-700">{contact.company}</p>
                      </div>
                    </div>

                    <div onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(contact.id)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Phone & Timezone */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-700 font-semibold flex items-center gap-1.5">
                      {contact.phone}
                      <button
                        type="button"
                        className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                        onClick={(e) => handleCopyPhone(contact.phone, e)}
                        title="Copy phone"
                      >
                        <CopyIcon className="w-3 h-3" />
                      </button>
                    </span>
                    <span className="text-[11px] text-slate-500">{contact.location}</span>
                  </div>

                  {/* Intent Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                      <span>Gemini Intent Score</span>
                      <span className="text-emerald-700 font-bold">{contact.score}/100 ({contact.intent})</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-[#c8f169] rounded-full transition-all"
                        style={{ width: `${contact.score}%` }}
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 text-[10px] font-bold border border-purple-200">
                      {contact.crmStage}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium">
                      {contact.dealValue}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-medium border border-emerald-200">
                      {contact.status}
                    </span>
                  </div>

                  {/* Quick Card Footer Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                      onClick={() => {
                        navigate('/inbox')
                        showToast(`Opening WhatsApp chat with ${contact.name}…`)
                      }}
                    >
                      <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
                      Chat on WhatsApp
                    </button>

                    <button
                      type="button"
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                      onClick={() => handleOpenDrawer(contact)}
                    >
                      Inspect Profile →
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ================= CONTACT INSPECTION SLIDE-OVER DRAWER ================= */}
        {inspectingContact && (
          <div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end transition-opacity"
            onMouseDown={(e) => e.target === e.currentTarget && setInspectingContact(null)}
          >
            <div
              className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden animate-in slide-in-from-right duration-200"
              role="dialog"
              aria-modal="true"
            >
              {/* Profile Top Banner */}
              <div className="p-6 bg-gradient-to-br from-[#0c3529] via-[#104435] to-[#0c3529] text-white relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-[#c8f169] text-[#0c3529] text-xl font-extrabold flex items-center justify-center shadow-md">
                      {inspectingContact.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-white">
                        {inspectingContact.name}
                      </h2>
                      <p className="text-xs text-emerald-100/90 font-medium">
                        {inspectingContact.role} · <strong className="text-white">{inspectingContact.company}</strong>
                      </p>
                      <p className="mt-1 text-[11px] text-emerald-200/70 font-mono">
                        {inspectingContact.email} · {inspectingContact.phone}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                    onClick={() => setInspectingContact(null)}
                    aria-label="Close contact drawer"
                  >
                    <CloseIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Action Buttons */}
                <div className="mt-5 pt-4 border-t border-white/15 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#c8f169] hover:bg-[#bbf055] text-[#0c3529] text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
                    onClick={() => {
                      navigate('/inbox')
                      showToast(`Opening WhatsApp chat with ${inspectingContact.name}…`)
                    }}
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                    Chat on WhatsApp
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/15 cursor-pointer active:scale-95"
                    onClick={() => handleCopyPhone(inspectingContact.phone)}
                  >
                    <CopyIcon className="w-3 h-3" />
                    Copy Phone
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/15 cursor-pointer active:scale-95"
                    onClick={() => handleStageChange(inspectingContact.id, 'Won')}
                  >
                    <CheckCircleIcon className="w-3 h-3 text-emerald-400" />
                    Mark as Won
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/15 cursor-pointer active:scale-95"
                    onClick={() => {
                      setContacts((prev) =>
                        prev.map((c) =>
                          c.id === inspectingContact.id
                            ? { ...c, status: 'Do Not Call' as ContactStatus }
                            : c,
                        ),
                      )
                      setInspectingContact((prev) =>
                        prev ? { ...prev, status: 'Do Not Call' as ContactStatus } : null,
                      )
                      showToast(`${inspectingContact.name} added to WhatsApp Opt-out list`)
                    }}
                  >
                    Mark as Opted Out
                  </button>
                </div>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Interactive CRM Pipeline Progression Stepper */}
                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    CRM Pipeline Progression (Click to advance)
                  </span>
                  <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-xl">
                    {CRM_STAGES.map((stage, idx) => {
                      const isActive = inspectingContact.crmStage === stage
                      return (
                        <button
                          key={stage}
                          type="button"
                          className={`py-2 px-1 rounded-lg text-center text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-white text-emerald-900 shadow-sm border border-emerald-500/30'
                              : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                          }`}
                          onClick={() => handleStageChange(inspectingContact.id, stage)}
                        >
                          <div className="text-[10px] text-slate-400">{idx + 1}.</div>
                          <div className="truncate">{stage}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Gemini AI WhatsApp Intelligence Card */}
                <div className="rounded-2xl p-4 bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                    <SparkIcon className="w-4 h-4 text-emerald-600" />
                    Gemini AI WhatsApp Intelligence &amp; Synopsis
                  </div>
                  <p className="text-xs text-emerald-950/80 leading-relaxed">
                    {inspectingContact.aiSummary ||
                      'AI conversation analysis will automatically populate once an automated WhatsApp broadcast or customer reply finishes.'}
                  </p>
                  {inspectingContact.lastOutcome && (
                    <div className="pt-2 mt-2 border-t border-emerald-200/60 text-[11px] text-emerald-900 font-medium">
                      <strong>Latest WhatsApp Outcome:</strong> {inspectingContact.lastOutcome}
                      {inspectingContact.lastContacted && ` (${inspectingContact.lastContacted})`}
                    </div>
                  )}
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Intent Score</span>
                    <strong className="text-slate-900 text-sm mt-0.5 block">
                      {inspectingContact.score}/100 ({inspectingContact.intent})
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Est. Deal Value</span>
                    <strong className="text-slate-900 text-sm mt-0.5 block">
                      {inspectingContact.dealValue}
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Geography / Timezone</span>
                    <strong className="text-slate-900 text-xs mt-0.5 block">
                      {inspectingContact.location} ({inspectingContact.timezone})
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Campaign</span>
                    <strong className="text-slate-900 text-xs mt-0.5 block truncate">
                      {inspectingContact.activeCampaign || 'None (In Directory)'}
                    </strong>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
                    Segment Tags &amp; Compliance Attributes
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {inspectingContact.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Editable CRM Account Notes */}
                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
                    CRM Account Notes
                  </span>
                  <textarea
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-h-[90px]"
                    value={inspectingNotes}
                    onChange={(e) => setInspectingNotes(e.target.value)}
                    placeholder="Add internal notes about lead qualification, custom pricing, or objection handling..."
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl bg-[#0c3529] hover:bg-[#124e3c] text-white text-xs font-bold transition-colors cursor-pointer"
                      onClick={handleSaveNotes}
                    >
                      Save Notes
                    </button>
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  ID: {inspectingContact.id} · Postgres Row Verified
                </span>
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                  onClick={() => setInspectingContact(null)}
                >
                  Close Drawer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= ADD CONTACT MODAL ================= */}
        {isAddModalOpen && (
          <div
            className="modal-overlay"
            onMouseDown={(e) => e.target === e.currentTarget && setIsAddModalOpen(false)}
          >
            <div
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
              role="dialog"
              aria-modal="true"
            >
              <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                    <ContactsIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                      Add Lead to CRM Directory
                    </h2>
                    <p className="text-xs text-slate-500">
                      Enter verified contact details for autonomous voice targeting.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateContact}>
                <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Elena Rostova"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Phone Number (E.164 format) *</label>
                      <input
                        type="text"
                        required
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Email Address</label>
                      <input
                        type="email"
                        placeholder="elena@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Company Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Apex Global"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Job Title / Role</label>
                      <input
                        type="text"
                        placeholder="e.g. VP of Operations"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Estimated Deal Value</label>
                      <input
                        type="text"
                        placeholder="$35,000"
                        value={formData.dealValue}
                        onChange={(e) => setFormData({ ...formData, dealValue: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Location / Timezone</label>
                      <input
                        type="text"
                        placeholder="San Francisco, CA (PST)"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Target Segment</label>
                      <select
                        value={formData.segment}
                        onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="Enterprise CFO">Enterprise CFO</option>
                        <option value="Warm Leads">Warm Leads</option>
                        <option value="Luxury Real Estate">Luxury Real Estate</option>
                        <option value="Inbound Trials">Inbound Trials</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Internal Qualification Notes</label>
                    <textarea
                      placeholder="Add key context, budget signals, or preferred WhatsApp outreach window..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-h-[80px]"
                    />
                  </div>
                </div>

                <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0c3529] hover:bg-[#124e3c] text-white shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                    Create Contact
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= IMPORT CSV MODAL ================= */}
        {isImportModalOpen && (
          <ImportContactsModal
            onClose={() => setIsImportModalOpen(false)}
            onImportSuccess={handleImportSuccess}
          />
        )}

        {/* ================= TOAST NOTIFICATION ================= */}
        {toast && <Toast key={toast.id} message={toast.message} onClose={closeToast} />}
      </div>
    </DashboardLayout>
  )
}

export default ContactsPage
