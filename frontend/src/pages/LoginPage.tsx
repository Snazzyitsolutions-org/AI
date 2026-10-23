import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { AuthDivider } from '../components/AuthDivider'
import { AuthLayout } from '../components/AuthLayout'
import { FormBanner } from '../components/FormBanner'
import { FormField } from '../components/FormField'
import { GoogleButton } from '../components/GoogleButton'
import { LockIcon, MailIcon, SparkIcon } from '../components/icons'
import { PasswordToggle } from '../components/PasswordToggle'
import { SubmitButton } from '../components/SubmitButton'
import { getAuthErrorMessage } from '../lib/auth-errors'
import { ApiError, GOOGLE_NOT_CONFIGURED_MESSAGE, GOOGLE_START_URL } from '../lib/api'
import { usePageTitle } from '../lib/usePageTitle'

type LoginErrors = Partial<Record<'email' | 'password', string>>
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function LoginPage() {
  usePageTitle('Sign in · CallWave')

  const { login, googleEnabled } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<LoginErrors>({})
  const [banner, setBanner] = useState<string | null>(() =>
    getAuthErrorMessage(searchParams.get('authError')),
  )
  const [submitting, setSubmitting] = useState(false)

  function handleGoogleSignIn() {
    if (!googleEnabled) {
      setBanner(GOOGLE_NOT_CONFIGURED_MESSAGE)
      return
    }

    window.location.assign(GOOGLE_START_URL)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: LoginErrors = {}

    if (!email.trim()) {
      nextErrors.email = 'Enter your email address.'
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!password) {
      nextErrors.password = 'Enter your password.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setErrors({})
    setBanner(null)
    setSubmitting(true)

    try {
      await login({ email: email.trim(), password, remember })
      navigate('/', { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.fields) {
          setErrors({
            email: error.fields.email,
            password: error.fields.password,
          })
        }
        setBanner(error.message)
      } else {
        setBanner('Unable to sign in right now. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <header className="mb-6">
        <p className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.16em] text-emerald-700">
          <SparkIcon className="h-3 w-3" />
          Welcome back
        </p>
        <h1 className="mt-2.5 text-[24px] font-extrabold tracking-tight text-[#10241b] sm:text-[28px]">
          Sign in to CallWave
        </h1>
        <p className="mt-1.5 text-[13px] text-[#6d8378]">Pick up right where you left off.</p>
      </header>

      {banner && <FormBanner message={banner} onDismiss={() => setBanner(null)} />}

      <GoogleButton disabled={submitting} onClick={handleGoogleSignIn} />
      <AuthDivider label="or sign in with email" />

      <form className="space-y-3.5" onSubmit={handleSubmit} noValidate>
        <FormField
          id="email"
          label="Email address"
          type="email"
          value={email}
          onChange={(value) => {
            setEmail(value)
            setErrors((current) => ({ ...current, email: undefined }))
          }}
          placeholder="you@example.com"
          autoComplete="email"
          autoFocus
          icon={<MailIcon />}
          error={errors.email}
          disabled={submitting}
        />

        <FormField
          id="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(value) => {
            setPassword(value)
            setErrors((current) => ({ ...current, password: undefined }))
          }}
          placeholder="Enter your password"
          autoComplete="current-password"
          icon={<LockIcon />}
          error={errors.password}
          disabled={submitting}
          trailing={
            <PasswordToggle
              visible={showPassword}
              onToggle={() => setShowPassword((visible) => !visible)}
            />
          }
        />

        <div className="pt-0.5">
          <label className="group inline-flex cursor-pointer select-none items-center gap-2.5 text-[12px] font-medium text-[#5d7468]">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              disabled={submitting}
            />
            <span
              className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border transition-all duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500/30 peer-focus-visible:ring-offset-1 ${
                remember
                  ? 'border-emerald-600 bg-emerald-600'
                  : 'border-[#cfdfd5] bg-white group-hover:border-[#a9c3b6]'
              }`}
            >
              {remember && (
                <svg viewBox="0 0 12 10" fill="none" className="h-2.5 w-2.5 text-white">
                  <path
                    d="m1.5 5 2.7 2.7 6.3-6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            Remember me for 30 days
          </label>
        </div>

        <div className="pt-1">
          <SubmitButton loading={submitting} loadingLabel="Signing in…">
            Sign in
          </SubmitButton>
        </div>
      </form>

      <p className="mt-5 text-center text-[12px] text-[#7a8f83]">
        New to CallWave?{' '}
        <Link
          to="/register"
          className="font-bold text-emerald-700 underline-offset-4 transition-colors hover:text-emerald-800 hover:underline"
        >
          Create an account
        </Link>
      </p>

      <div className="mt-4 border-t border-dashed border-[#e1ebe4] pt-4 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-[8px] border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-[11px] font-bold text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-100/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
        >
          <SparkIcon className="h-3 w-3" />
          Explore Workspace Directly
        </Link>
      </div>
    </AuthLayout>
  )
}
