type AuthDividerProps = {
  label: string
}

export function AuthDivider({ label }: AuthDividerProps) {
  return (
    <div className="my-4 flex items-center gap-3" aria-hidden="true">
      <span className="h-px flex-1 bg-[#e8f0ea]" />
      <small className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#9aada2]">
        {label}
      </small>
      <span className="h-px flex-1 bg-[#e8f0ea]" />
    </div>
  )
}
