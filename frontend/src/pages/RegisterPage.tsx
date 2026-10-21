import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { AuthDivider } from '../components/AuthDivider'
import { AuthLayout } from '../components/AuthLayout'
import { FormBanner } from '../components/FormBanner'
import { FormField } from '../components/FormField'
import { GoogleButton } from '../components/GoogleButton'
import { LockIcon, MailIcon, UserIcon } from '../components/icons'
import { PasswordToggle } from '../components/PasswordToggle'
import { StrengthMeter } from '../components/StrengthMeter'
import { SubmitButton } from '../components/SubmitButton'
import { ApiError, GOOGLE_NOT_CONFIGURED_MESSAGE, GOOGLE_START_URL } from '../lib/api'
import { usePageTitle } from '../lib/usePageTitle'

type RegisterErrors = Partial<Record<'name' | 'email' | 'password' | 'confirmPassword', string>>
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,72}$/

export function RegisterPage() {
  usePageTitle('Create your account · CallWave')

  const { register, googleEnabled } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [banner, setBanner] = useState<string | null>(null)
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
    const nextErrors: RegisterErrors = {}

    if (name.trim().length < 2) {
      nextErrors.name = 'Enter your full name.'
    } else if (name.trim().length > 60) {
      nextErrors.name = 'Name must be 60 characters or fewer.'
    }

    if (!email.trim()) {
      nextErrors.email = 'Enter your email address.'
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!PASSWORD_PATTERN.test(password)) {
      nextErrors.password = 'Use 8+ characters with at least one letter and one number.'
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Confirm your password.'
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords don't match."
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setErrors({})
    setBanner(null)
    setSubmitting(true)

    try {
      await register({ name: name.trim(), email: email.trim(), password })
      navigate('/', { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.fields) {
          setErrors({
            name: error.fields.name,
            email: error.fields.email,
            password: error.fields.password,
          })
        }
        setBanner(error.message)
      } else {
        setBanner('Unable to create your account right now. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <header className="auth-heading auth-heading--compact">
        <span className="auth-kicker">Get started</span>
        <h2>Create your account</h2>
        <p>Your first great conversation is only a minute away.</p>
      </header>

      {banner && <FormBanner message={banner} onDismiss={() => setBanner(null)} />}

      <GoogleButton disabled={submitting} onClick={handleGoogleSignIn} />
      <AuthDivider label="or sign up with email" />

      <form className="auth-form auth-form--register" onSubmit={handleSubmit} noValidate>
        <FormField
          id="name"
          label="Full name"
          value={name}
          onChange={(value) => {
            setName(value)
            setErrors((current) => ({ ...current, name: undefined }))
          }}
          placeholder="Your name"
          autoComplete="name"
          autoFocus
          icon={<UserIcon />}
          error={errors.name}
          disabled={submitting}
        />

        <FormField
          id="register-email"
          label="Email address"
          type="email"
          value={email}
          onChange={(value) => {
            setEmail(value)
            setErrors((current) => ({ ...current, email: undefined }))
          }}
          placeholder="you@example.com"
          autoComplete="email"
          icon={<MailIcon />}
          error={errors.email}
          disabled={submitting}
        />

        <div>
          <FormField
            id="register-password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(value) => {
              setPassword(value)
              setErrors((current) => ({ ...current, password: undefined }))
            }}
            placeholder="Create a password"
            autoComplete="new-password"
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
          <StrengthMeter password={password} />
        </div>

        <FormField
          id="confirm-password"
          label="Confirm password"
          type={showConfirmPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(value) => {
            setConfirmPassword(value)
            setErrors((current) => ({ ...current, confirmPassword: undefined }))
          }}
          placeholder="Type it once more"
          autoComplete="new-password"
          icon={<LockIcon />}
          error={errors.confirmPassword}
          disabled={submitting}
          trailing={
            <PasswordToggle
              visible={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((visible) => !visible)}
            />
          }
        />

        <SubmitButton loading={submitting} loadingLabel="Creating account…">
          Create my account
        </SubmitButton>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  )
}
