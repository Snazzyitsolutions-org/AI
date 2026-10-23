import { useMemo, useState } from 'react'
import type { MouseEvent } from 'react'
import {
  CloseIcon,
  PlusIcon,
  SearchIcon,
  TemplateIcon,
  WhatsAppIcon,
} from './DashboardIcons'
import { TemplateMessagePreview } from './TemplateMessagePreview'
import {
  TEMPLATE_BLUEPRINTS,
  TEMPLATE_CATEGORIES,
  getLanguageLabel,
} from './templateData'
import type { TemplateBlueprint, TemplateCategory } from './templateData'

type GalleryCategory = 'All' | TemplateCategory

type TemplateGalleryModalProps = {
  onClose: () => void
  onUse: (blueprint: TemplateBlueprint) => void
}

export function TemplateGalleryModal({ onClose, onUse }: TemplateGalleryModalProps) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>('All')

  const filteredBlueprints = useMemo(() => {
    const normalized = search.trim().toLowerCase()

    return TEMPLATE_BLUEPRINTS.filter((blueprint) => {
      const matchesCategory =
        activeCategory === 'All' || blueprint.category === activeCategory

      const matchesSearch =
        !normalized ||
        blueprint.title.toLowerCase().includes(normalized) ||
        blueprint.description.toLowerCase().includes(normalized) ||
        blueprint.body.toLowerCase().includes(normalized) ||
        (blueprint.headerText ?? '').toLowerCase().includes(normalized) ||
        blueprint.category.toLowerCase().includes(normalized) ||
        (blueprint.tag ?? '').toLowerCase().includes(normalized)

      return matchesCategory && matchesSearch
    })
  }, [search, activeCategory])

  function handleOverlayClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <div className="modal-overlay" onMouseDown={handleOverlayClick}>
      <section
        className="relative w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 p-5 sm:p-6 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-gallery-title"
      >
        {/* Soft Ambient Radial Mesh Accent */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-gradient-to-br from-emerald-400/15 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-600 flex items-center justify-center shadow-2xs">
              <TemplateIcon className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 inline-block">
                Ready-to-use Library
              </span>
              <h2 id="template-gallery-title" className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                WhatsApp Template Gallery
              </h2>
            </div>
          </div>

          <button
            type="button"
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            onClick={onClose}
            aria-label="Close template gallery"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar: Search & Category Filter Tabs */}
        <div className="relative z-10 mt-3 pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
          <div className="relative flex-1 sm:w-64">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search 18 blueprints…"
              aria-label="Search template gallery"
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
            {(['All', ...TEMPLATE_CATEGORIES] as GalleryCategory[]).map((category) => {
              const count =
                category === 'All'
                  ? TEMPLATE_BLUEPRINTS.length
                  : TEMPLATE_BLUEPRINTS.filter((b) => b.category === category).length

              const isActive = activeCategory === category

              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                      : 'bg-slate-100/80 hover:bg-slate-200/70 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{category === 'All' ? 'All' : category}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Gallery Grid Body */}
        <div className="relative z-10 mt-3 overflow-y-auto flex-1 pr-1 space-y-4">
          {filteredBlueprints.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                <WhatsAppIcon className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">No templates match that search</h3>
              <p className="text-xs text-slate-500 mt-1">Try a different keyword or browse another category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBlueprints.map((blueprint) => (
                <article
                  key={blueprint.id}
                  className="rounded-2xl border border-slate-200/80 bg-white hover:border-emerald-300 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200/60">
                        {blueprint.category}
                      </span>
                      {blueprint.tag && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200/60">
                          {blueprint.tag}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {blueprint.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {blueprint.description}
                    </p>

                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <TemplateMessagePreview
                        compact
                        headerType={blueprint.headerType}
                        headerText={blueprint.headerText}
                        body={blueprint.body}
                        footer={blueprint.footer}
                        buttons={blueprint.buttons}
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {getLanguageLabel(blueprint.language)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUse(blueprint)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                      <span>Use Template</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
