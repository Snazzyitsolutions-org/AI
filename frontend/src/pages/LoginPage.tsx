import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { AuthDivider } from '../components/AuthDivider'
import { AuthLayout } from '../components/AuthLayout'
import { FormBanner } from '../components/FormBanner'
import { FormField } from '../components/FormField'
import { GoogleButton } from '../components/GoogleButton'
import { MailIcon, LockIcon } from '../components/icons'
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
      <header className="auth-heading">
        <span className="auth-kicker">Welcome back</span>
        <h2>Sign in to CallWave</h2>
        <p>Pick up right where you left off.</p>
      </header>

      {banner && <FormBanner message={banner} onDismiss={() => setBanner(null)} />}

      <GoogleButton disabled={submitting} onClick={handleGoogleSignIn} />
      <AuthDivider label="or sign in with email" />

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
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

        <div className="form-options">
          <label className="checkbox">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              disabled={submitting}
            />
            <span className="checkbox__box" aria-hidden="true">
              <svg viewBox="0 0 12 10" fill="none">
                <path
                  d="m1.5 5 2.7 2.7 6.3-6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span>Remember me for 30 days</span>
          </label>
        </div>

        <SubmitButton loading={submitting} loadingLabel="Signing in…">
          Sign in
        </SubmitButton>
      </form>

      <p className="auth-switch">
        New to CallWave? <Link to="/register">Create an account</Link>
      </p>

      <p className="auth-footnote">
        <LockIcon />
        Your password is securely hashed and never shared.
      </p>
    </AuthLayout>
  )
}
