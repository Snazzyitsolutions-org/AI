import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { rateLimit } from 'express-rate-limit'
import helmet from 'helmet'
import authRouter from './auth.js'
import { config } from './config.js'
import { closeDb, initDb, pool } from './db.js'

const app = express()

app.disable('x-powered-by')
app.use(helmet())
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  }),
)
app.use(express.json({ limit: '16kb' }))
app.use(cookieParser())

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { message: 'Too many attempts. Please wait a few minutes and try again.' },
})

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({
      status: 'ok',
      service: 'callwave-api',
      database: 'postgresql',
      message: 'Backend server is running',
      timestamp: new Date().toISOString(),
    })
  } catch {
    res.status(503).json({
      status: 'error',
      service: 'callwave-api',
      database: 'unavailable',
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
    })
  }
})

app.use('/api/auth/register', authLimiter)
app.use('/api/auth/login', authLimiter)
app.use('/api/auth', authRouter)

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API route not found.' })
})

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error)
  }

  if (error?.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body must be valid JSON.' })
  }

  console.error(error)
  return res.status(500).json({ message: 'Something went wrong. Please try again.' })
})

function databaseErrorMessage(error) {
  if (error?.code === 'ECONNREFUSED') {
    return 'PostgreSQL is not running or the host/port in DATABASE_URL is wrong.'
  }
  if (error?.code === '28P01') {
    return 'PostgreSQL rejected the username or password in DATABASE_URL.'
  }
  if (
    error?.code === 'SELF_SIGNED_CERT_IN_CHAIN' ||
    error?.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE'
  ) {
    return 'PostgreSQL SSL certificate could not be verified. Set DATABASE_SSL=true in backend/.env.'
  }
  if (error?.code === '3D000') {
    return 'The database in DATABASE_URL does not exist. Create it first, then restart.'
  }
  if (error?.code === 'ENOTFOUND') {
    return 'The PostgreSQL host in DATABASE_URL could not be resolved.'
  }
  return error?.message || String(error)
}

try {
  await initDb()
} catch (error) {
  console.error(`\nCould not connect to PostgreSQL: ${databaseErrorMessage(error)}\n`)
  console.error('Check DATABASE_URL in backend/.env. Example:')
  console.error('DATABASE_URL=postgresql://postgres:password@localhost:5432/callwave\n')
  process.exit(1)
}

const server = app.listen(config.port, () => {
  console.log(`CallWave API running on http://localhost:${config.port}`)
  console.log('Database: PostgreSQL')
  console.log(`Google sign-in: ${config.googleEnabled ? 'enabled' : 'not configured'}`)
})

let shuttingDown = false

function shutdown() {
  if (shuttingDown) return
  shuttingDown = true

  server.close(async () => {
    try {
      await closeDb()
    } finally {
      process.exit(0)
    }
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
