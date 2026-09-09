import { db } from '@/db'
import { appSettings } from '@/db/schema'
import { eq } from 'drizzle-orm'

export function getGlobalApiKey(): string {
  const row = db.select().from(appSettings).where(eq(appSettings.id, 1)).get()
  return row?.apiKey ?? ''
}

export function authenticateRequest(request: Request): boolean {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return false

  const token = authHeader.slice(7)
  return token === getGlobalApiKey()
}

export function generateProjectId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from(
    { length: 12 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}
