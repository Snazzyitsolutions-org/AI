import pg from 'pg'
import { config } from './config.js'

const { Pool } = pg

export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.databaseSsl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
})

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error)
})

const USER_COLUMNS = `
  id,
  name,
  email,
  password_hash,
  google_id,
  avatar_url,
  created_at,
  updated_at
`

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      password_hash TEXT,
      google_id TEXT UNIQUE,
      avatar_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)

  await pool.query(
    'CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (lower(email))',
  )
}

export async function closeDb() {
  await pool.end()
}

export async function findUserByEmail(email) {
  const { rows } = await pool.query(
    `SELECT ${USER_COLUMNS} FROM users WHERE lower(email) = $1`,
    [email],
  )

  return rows[0]
}

export async function findUserById(id) {
  const { rows } = await pool.query(
    `SELECT ${USER_COLUMNS} FROM users WHERE id = $1`,
    [id],
  )

  return rows[0]
}

export async function findUserByGoogleId(googleId) {
  const { rows } = await pool.query(
    `SELECT ${USER_COLUMNS} FROM users WHERE google_id = $1`,
    [googleId],
  )

  return rows[0]
}

export async function createEmailUser({ name, email, passwordHash }) {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING ${USER_COLUMNS}`,
    [name, email, passwordHash],
  )

  return rows[0]
}

export async function createGoogleUser({ name, email, googleId, avatarUrl }) {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, google_id, avatar_url)
     VALUES ($1, $2, $3, $4)
     RETURNING ${USER_COLUMNS}`,
    [name, email, googleId, avatarUrl],
  )

  return rows[0]
}

export async function linkGoogleAccount({ userId, googleId, avatarUrl }) {
  const { rows } = await pool.query(
    `UPDATE users
     SET google_id = $1,
         avatar_url = COALESCE($2, avatar_url),
         updated_at = now()
     WHERE id = $3
     RETURNING ${USER_COLUMNS}`,
    [googleId, avatarUrl, userId],
  )

  return rows[0]
}

export async function touchGoogleUser({ userId, avatarUrl }) {
  if (!avatarUrl) return

  await pool.query(
    `UPDATE users
     SET avatar_url = $1,
         updated_at = now()
     WHERE id = $2 AND avatar_url IS DISTINCT FROM $1`,
    [avatarUrl, userId],
  )
}
