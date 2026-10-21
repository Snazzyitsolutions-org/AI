import 'dotenv/config'

const isProduction = process.env.NODE_ENV === 'production'
const port = Number(process.env.PORT) || 5000
const jwtSecret = process.env.JWT_SECRET?.trim() || ''
const frontendUrl = (process.env.FRONTEND_URL?.trim() || 'http://localhost:5173').replace(/\/+$/, '')
const backendUrl = (process.env.BACKEND_URL?.trim() || `http://localhost:${port}`).replace(/\/+$/, '')
const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim() || ''
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() || ''
const databaseUrl =
  process.env.DATABASE_URL?.trim() || 'postgresql://postgres@localhost:5432/callwave'
const databaseSslMode = process.env.DATABASE_SSL?.trim().toLowerCase() || ''
const databaseUrlHasSslMode = /[?&]sslmode=/i.test(databaseUrl)

function resolveDatabaseSsl() {
  if (databaseSslMode === 'false' || databaseSslMode === 'disable') return false
  if (databaseSslMode === 'true' || databaseSslMode === 'require') {
    return { rejectUnauthorized: false }
  }
  if (!databaseUrlHasSslMode && /neon\.tech/i.test(databaseUrl)) {
    return { rejectUnauthorized: false }
  }
  return undefined
}

const databaseSsl = resolveDatabaseSsl()

if (jwtSecret.length < 32) {
  console.error(
    '\nJWT_SECRET is missing or too short (minimum 32 characters).\n' +
      'Copy .env.example to .env and generate a secret with:\n' +
      'node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"\n',
  )
  process.exit(1)
}

export const config = Object.freeze({
  port,
  isProduction,
  jwtSecret,
  frontendUrl,
  backendUrl,
  databaseUrl,
  databaseSsl,
  googleClientId,
  googleClientSecret,
  googleEnabled: Boolean(googleClientId && googleClientSecret),
  googleRedirectUri:
    process.env.GOOGLE_REDIRECT_URI?.trim() || `${backendUrl}/api/auth/google/callback`,
})
