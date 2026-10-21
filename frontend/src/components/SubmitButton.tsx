import type { ReactNode } from 'react'
import { ArrowRightIcon } from './icons'

type SubmitButtonProps = {
  loading: boolean
  loadingLabel: string
  children: ReactNode
}

export function SubmitButton({ loading, loadingLabel, children }: SubmitButtonProps) {
  return (
    <button className="submit-button" type="submit" disabled={loading} aria-busy={loading}>
      {loading ? (
        <>
          <span className="button-spinner" aria-hidden="true" />
          {loadingLabel}
        </>
      ) : (
        <>
          {children}
          <ArrowRightIcon className="submit-button__arrow" />
        </>
      )}
    </button>
  )
}
