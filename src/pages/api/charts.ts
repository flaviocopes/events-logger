import type { APIRoute } from 'astro'
import { db } from '@/db'
import { events } from '@/db/schema'
import { eq, and, gte, sql } from 'drizzle-orm'

export const GET: APIRoute = async ({ url }) => {
  const projectId = url.searchParams.get('project')
  if (!projectId) {
    return new Response(JSON.stringify({ error: 'project is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const days = parseInt(url.searchParams.get('days') || '30')
  const category = url.searchParams.get('category')
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const conditions = [
    eq(events.projectId, projectId),
    gte(events.createdAt, since),
  ]
  if (category) conditions.push(eq(events.category, category))

  const rows = db
    .select({
      category: events.category,
      day: sql<string>`date(${events.createdAt}, 'unixepoch')`.as('day'),
      count: sql<number>`count(*)`.as('count'),
    })
    .from(events)
    .where(and(...conditions))
    .groupBy(events.category, sql`date(${events.createdAt}, 'unixepoch')`)
    .orderBy(sql`day`)
    .all()

  const byCategory: Record<string, { day: string; count: number }[]> = {}
  for (const row of rows) {
    if (!byCategory[row.category]) byCategory[row.category] = []
    byCategory[row.category].push({ day: row.day, count: row.count })
  }

  return new Response(JSON.stringify(byCategory), {
    headers: { 'Content-Type': 'application/json' },
  })
}
