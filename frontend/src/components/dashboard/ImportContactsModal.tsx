import { useState } from 'react'
import type { DragEvent } from 'react'
import { CloseIcon, UploadIcon } from './DashboardIcons'
import { SparkIcon } from '../icons'

type ImportContactsModalProps = {
  onClose: () => void
  onImportSuccess: (count: number, filename: string) => void
}

const SAMPLE_ROWS = [
  { name: 'Vikram Mehta', phone: '+91 98450 12091', email: 'vikram@techcorp.io', role: 'VP Operations', tag: 'High-ACV' },
  { name: 'Ananya Deshmukh', phone: '+91 98200 44912', email: 'ananya@skyline.in', role: 'Partner', tag: 'Luxury 3BHK' },
  { name: 'Marcus Sterling', phone: '+44 20 7946 0912', email: 'm.sterling@vertexcap.com', role: 'CFO', tag: 'FinTech' },
  { name: 'Priya Sharma', phone: '+91 97112 44021', email: 'priya@prestige.com', role: 'Investor', tag: 'Warm Buyer' },
]

export function ImportContactsModal({ onClose, onImportSuccess }: ImportContactsModalProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string | null>('enterprise_q4_leads.csv')

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setSelectedFile(file.name)
    }
  }

  function handleConfirmImport() {
    onImportSuccess(1248, selectedFile || 'contacts.csv')
    onClose()
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 p-5 sm:p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-title"
      >
        {/* Soft Ambient Radial Mesh Accent */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-gradient-to-br from-teal-400/15 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200/60 text-teal-600 flex items-center justify-center shadow-2xs">
              <UploadIcon className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/60 inline-block">
                CRM Contact Ingestion
              </span>
              <h2 id="import-title" className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                Import &amp; Auto-Enrich Leads
              </h2>
            </div>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            onClick={onClose}
            aria-label="Close modal"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        <p className="relative z-10 text-xs text-slate-500 mt-2">
          Upload your CSV or Excel list. CallWave AI automatically cleans numbers and matches timezones.
        </p>

        <div
          className={`relative z-10 mt-3 p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
              : 'border-slate-200 hover:border-emerald-400 bg-slate-50/60 hover:bg-slate-50'
          }`}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div className="w-10 h-10 mx-auto rounded-full bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shadow-2xs mb-2">
            <UploadIcon className="w-5 h-5" />
          </div>
          <div className="text-xs sm:text-sm font-semibold text-slate-800">
            Drag and drop your contact CSV here
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">or click to browse from your computer</p>
          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-slate-200/60 text-slate-600 text-[10px] font-medium">
            Supports .csv, .xlsx, .tsv up to 50,000 leads
          </span>
        </div>

        {selectedFile && (
          <div className="relative z-10 mt-4 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 text-xs">
              <span className="font-medium text-slate-800 flex items-center gap-1.5">
                📄 <strong>{selectedFile}</strong> <span className="text-slate-500 font-normal">(1,248 contacts detected)</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100/70 text-emerald-800 text-[10px] font-semibold">
                <SparkIcon className="w-3 h-3 text-emerald-600" /> AI Formatting: Validated
              </span>
            </div>

            <div className="mt-2 overflow-x-auto max-h-40 rounded-lg border border-slate-200/70 bg-white">
              <table className="min-w-full text-[11px] text-left divide-y divide-slate-100">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-3 py-2">Lead Name</th>
                    <th className="px-3 py-2">Phone (E.164)</th>
                    <th className="px-3 py-2">Corporate Email</th>
                    <th className="px-3 py-2">Role / Title</th>
                    <th className="px-3 py-2">Segment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {SAMPLE_ROWS.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-bold text-slate-900">{row.name}</td>
                      <td className="px-3 py-2 font-mono text-emerald-700">{row.phone}</td>
                      <td className="px-3 py-2 text-slate-600">{row.email}</td>
                      <td className="px-3 py-2 text-slate-600">{row.role}</td>
                      <td className="px-3 py-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium">
                          {row.tag}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="relative z-10 flex items-center justify-end gap-2.5 pt-4 mt-4 border-t border-slate-100">
          <button
            type="button"
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
            onClick={handleConfirmImport}
          >
            <SparkIcon className="w-4 h-4" />
            <span>Ingest 1,248 Contacts to CRM</span>
          </button>
        </div>
      </div>
    </div>
  )
}
