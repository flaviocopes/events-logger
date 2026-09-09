import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import { sql } from 'drizzle-orm'
import { join } from 'path'

const dbPath = join(process.cwd(), 'data', 'events.db')
const sqlite = new Database(dbPath)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

export const db = drizzle(sqlite, { schema })

function makeApiKey(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const segments = [8, 4, 4, 4, 12]
  return (
    'ev_' +
    segments
      .map((len) =>
        Array.from(
          { length: len },
          () => chars[Math.floor(Math.random() * chars.length)]
        ).join('')
      )
      .join('-')
  )
}

export function initDb() {
  db.run(sql`CREATE TABLE IF NOT EXISTS app_settings (
    id INTEGER PRIMARY KEY,
    api_key TEXT NOT NULL
  )`)

  const row = sqlite
    .prepare('SELECT COUNT(*) as count FROM app_settings')
    .get() as { count: number }
  if (row.count === 0) {
    sqlite
      .prepare('INSERT INTO app_settings (id, api_key) VALUES (1, ?)')
      .run(makeApiKey())
  }

  db.run(sql`CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )`)

  db.run(sql`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT NOT NULL REFERENCES projects(id),
    name TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    UNIQUE(project_id, name)
  )`)

  db.run(sql`CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT NOT NULL REFERENCES projects(id),
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    tags TEXT,
    user_id TEXT,
    notify INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  )`)

  try {
    db.run(sql`ALTER TABLE events ADD COLUMN user_id TEXT`)
  } catch (_) {
    /* column already exists */
  }

  try {
    db.run(
      sql`ALTER TABLE events ADD COLUMN favorited INTEGER NOT NULL DEFAULT 0`
    )
  } catch (_) {
    /* column already exists */
  }

  try {
    db.run(sql`ALTER TABLE events ADD COLUMN url TEXT`)
  } catch (_) {
    /* column already exists */
  }

  // Migrate: drop per-project api_key column (replaced by global key in app_settings)
  try {
    db.run(sql`ALTER TABLE projects DROP COLUMN api_key`)
  } catch (_) {
    /* column already gone or SQLite too old */
  }

  // Migrate old "channels" table and "channel" column to "categories"/"category"
  try {
    db.run(sql`ALTER TABLE channels RENAME TO categories`)
  } catch (_) {
    /* already renamed or doesn't exist */
  }
  try {
    db.run(sql`ALTER TABLE events RENAME COLUMN channel TO category`)
  } catch (_) {
    /* already renamed */
  }

  db.run(sql`CREATE TABLE IF NOT EXISTS insights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT NOT NULL REFERENCES projects(id),
    title TEXT NOT NULL,
    value TEXT NOT NULL,
    icon TEXT,
    updated_at INTEGER NOT NULL,
    UNIQUE(project_id, title)
  )`)

  db.run(
    sql`CREATE INDEX IF NOT EXISTS idx_events_project_category ON events(project_id, category)`
  )
  db.run(
    sql`CREATE INDEX IF NOT EXISTS idx_events_project_created ON events(project_id, created_at)`
  )
  db.run(
    sql`CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at)`
  )
}

initDb()
