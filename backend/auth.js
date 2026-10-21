import { randomBytes, timingSafeEqual } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { Router } from 'express'
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import { config } from './config.js'
import {
  createEmailUser,
  createGoogleUser,
  findUserByEmail,
  findUserByGoogleId,
  findUserById,
  linkGoogleAccount,
  touchGoogleUser,
} from './db.js'

const router = Router()
const oauthClient = config.googleEnabled
  ? new OAuth2Client(config.googleClientId, config.googleClientSecret, config.googleRedirectUri)
  : null

const AUTH_COOKIE = 'callwave_session'
const STATE_COOKIE = 'callwave_google_state'
const JWT_ISSUER = 'callwave'
const JWT_AUDIENCE = 'callwave-web'
const SESSION_DAYS = 7
const REMEMBER_DAYS = 30
const BCRYPT_ROUNDS = 12
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Used when an email does not exist so response timing stays closer to a real login.
const DUMMY_PASSWORD_HASH = '$2b$12$5xA3tg0rKwD8FBTZ4jNOV.FbTGyNOgNAc7bIPhsq7Dx4Oeo22vQky'

const asyncRoute = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next)
}

function baseCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.isProduction,
    path: '/',
  }
}

function setSessionCookie(res, user, remember) {
  const days = remember ? REMEMBER_DAYS : SESSION_DAYS
  const token = jwt.sign({ sub: String(user.id) }, config.jwtSecret, {
    expiresIn: days * 24 * 60 * 60,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  })

  res.cookie(AUTH_COOKIE, token, {
    ...baseCookieOptions(),
    maxAge: days * 24 * 60 * 60 * 1000,
  })
}

function clearSessionCookie(res) {
  res.clearCookie(AUTH_COOKIE, baseCookieOptions())
}

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatar_url || null,
    provider: user.google_id ? 'google' : 'email',
    hasPassword: Boolean(user.password_hash),
    createdAt: user.created_at,
  }
}

function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function normalizeName(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : ''
}

function validateEmail(email) {
  return email.length <= 254 && EMAIL_PATTERN.test(email)
}

function validatePassword(password) {
  return (
    typeof password === 'string' &&
    password.length >= 8 &&
    Buffer.byteLength(password, 'utf8') <= 72 &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password)
  )
}

function sendValidationError(res, fields, message = 'Please check the highlighted fields.') {
  return res.status(422).json({ message, fields })
}

function clearStateCookie(res) {
  res.clearCookie(STATE_COOKIE, {
    ...baseCookieOptions(),
    path: '/api/auth/google',
  })
}

function redirectToLogin(res, errorCode) {
  res.redirect(`${config.frontendUrl}/login?authError=${encodeURIComponent(errorCode)}`)
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left))
  const b = Buffer.from(String(right))
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function requireAuth(req, res, next) {
  const token = req.cookies?.[AUTH_COOKIE]

  if (!token) {
    return res.status(401).json({ message: 'You are not signed in.' })
  }

  let payload

  try {
    payload = jwt.verify(token, config.jwtSecret, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    })
  } catch {
    clearSessionCookie(res)
    return res.status(401).json({ message: 'Your session has expired. Please sign in again.' })
  }

  try {
    const user = await findUserById(Number(payload.sub))

    if (!user) {
      clearSessionCookie(res)
      return res.status(401).json({ message: 'Your session is no longer valid.' })
    }

    req.user = user
    return next()
  } catch (error) {
    return next(error)
  }
}

router.get('/config', (req, res) => {
  res.json({ googleEnabled: config.googleEnabled })
})

router.post(
  '/register',
  asyncRoute(async (req, res) => {
    const name = normalizeName(req.body?.name)
    const email = normalizeEmail(req.body?.email)
    const password = req.body?.password
    const fields = {}

    if (name.length < 2 || name.length > 60) {
      fields.name = 'Name must be between 2 and 60 characters.'
    }
    if (!validateEmail(email)) {
      fields.email = 'Enter a valid email address.'
    }
    if (!validatePassword(password)) {
      fields.password = 'Use at least 8 characters with one letter and one number.'
    }

    if (Object.keys(fields).length > 0) {
      return sendValidationError(res, fields)
    }

    if (await findUserByEmail(email)) {
      return res.status(409).json({
        message: 'An account with this email already exists. Try signing in instead.',
        fields: { email: 'This email is already registered.' },
      })
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)

    try {
      const user = await createEmailUser({ name, email, passwordHash })
      setSessionCookie(res, user, false)
      return res.status(201).json({ user: toPublicUser(user) })
    } catch (error) {
      if (error?.code === '23505') {
        return res.status(409).json({
          message: 'An account with this email already exists. Try signing in instead.',
          fields: { email: 'This email is already registered.' },
        })
      }
      throw error
    }
  }),
)

router.post(
  '/login',
  asyncRoute(async (req, res) => {
    const email = normalizeEmail(req.body?.email)
    const password = req.body?.password
    const remember = req.body?.remember === true
    const fields = {}

    if (!validateEmail(email)) {
      fields.email = 'Enter a valid email address.'
    }
    if (typeof password !== 'string' || password.length === 0) {
      fields.password = 'Enter your password.'
    }

    if (Object.keys(fields).length > 0) {
      return sendValidationError(res, fields)
    }

    const user = await findUserByEmail(email)

    if (!user?.password_hash) {
      await bcrypt.compare(password, DUMMY_PASSWORD_HASH)
      return res.status(401).json({
        message: 'Invalid email or password. If you used Google, continue with Google.',
      })
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Invalid email or password. If you used Google, continue with Google.',
      })
    }

    setSessionCookie(res, user, remember)
    return res.json({ user: toPublicUser(user) })
  }),
)

router.post('/logout', (req, res) => {
  clearSessionCookie(res)
  res.status(204).end()
})

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: toPublicUser(req.user) })
})

router.get('/google/start', (req, res) => {
  if (!config.googleEnabled || !oauthClient) {
    return redirectToLogin(res, 'google_not_configured')
  }

  const state = randomBytes(32).toString('base64url')

  res.cookie(STATE_COOKIE, state, {
    ...baseCookieOptions(),
    path: '/api/auth/google',
    maxAge: 10 * 60 * 1000,
  })

  const params = new URLSearchParams({
    client_id: config.googleClientId,
    redirect_uri: config.googleRedirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  })

  return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
})

router.get(
  '/google/callback',
  asyncRoute(async (req, res) => {
    const { code, state, error } = req.query
    const storedState = req.cookies?.[STATE_COOKIE]

    clearStateCookie(res)

    if (error) {
      return redirectToLogin(res, error === 'access_denied' ? 'google_cancelled' : 'google_failed')
    }

    if (
      !config.googleEnabled ||
      !oauthClient ||
      typeof code !== 'string' ||
      !code ||
      typeof state !== 'string' ||
      !storedState ||
      !safeEqual(state, storedState)
    ) {
      return redirectToLogin(res, 'google_failed')
    }

    try {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: config.googleClientId,
          client_secret: config.googleClientSecret,
          redirect_uri: config.googleRedirectUri,
          grant_type: 'authorization_code',
        }),
      })

      if (!tokenResponse.ok) {
        throw new Error(`Google token exchange failed with status ${tokenResponse.status}`)
      }

      const tokens = await tokenResponse.json()

      if (!tokens.id_token) {
        throw new Error('Google did not return an ID token')
      }

      const ticket = await oauthClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: config.googleClientId,
      })
      const payload = ticket.getPayload()

      if (!payload?.sub || !payload.email || payload.email_verified !== true) {
        return redirectToLogin(res, 'google_email_unverified')
      }

      const email = normalizeEmail(payload.email)
      const fallbackName = email.split('@')[0].slice(0, 60) || 'CallWave user'
      const name = normalizeName(payload.name).slice(0, 60) || fallbackName
      const avatarUrl = typeof payload.picture === 'string' ? payload.picture : null

      let user = await findUserByGoogleId(payload.sub)

      if (!user) {
        const emailUser = await findUserByEmail(email)

        if (emailUser) {
          if (emailUser.google_id && emailUser.google_id !== payload.sub) {
            return redirectToLogin(res, 'google_account_conflict')
          }
          user = await linkGoogleAccount({
            userId: emailUser.id,
            googleId: payload.sub,
            avatarUrl,
          })
        } else {
          user = await createGoogleUser({
            name,
            email,
            googleId: payload.sub,
            avatarUrl,
          })
        }
      } else {
        await touchGoogleUser({ userId: user.id, avatarUrl })
        user = await findUserById(user.id)
      }

      setSessionCookie(res, user, false)
      return res.redirect(`${config.frontendUrl}/?welcome=google`)
    } catch (error) {
      console.error('Google sign-in failed:', error?.message || error)
      return redirectToLogin(res, 'google_failed')
    }
  }),
)

export default router
