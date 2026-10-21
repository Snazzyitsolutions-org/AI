import type { ReactNode } from 'react'
import { BrandMark } from './BrandMark'
import { BrandPanel } from './BrandPanel'

type AuthLayoutProps = {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-page">
      <div className="auth-shell">
        <BrandPanel />
        <main className="auth-panel">
          <div className="auth-mobile-brand">
            <BrandMark />
          </div>
          <div className="auth-form-wrap">{children}</div>
        </main>
      </div>
      <p className="auth-copyright">
        © {new Date().getFullYear()} CallWave
        <span aria-hidden="true">·</span>
        Clear conversations, simple connections.
      </p>
    </div>
  )
}
