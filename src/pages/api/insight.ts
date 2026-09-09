import type { APIRoute } from 'astro'
import { db } from '@/db'
import { insights, projects } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { authenticateRequest } from '@/lib/auth'

export const POST: APIRoute = async ({ request }) => {
  if (!authenticateRequest(request)) {
    return new Response(JSON.stringify({ error: 'Invalid API key' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = await request.json()
  const { project: projectId, title, value, icon } = body

  if (!projectId || !title || value === undefined) {
    return new Response(
      JSON.stringify({ error: 'project, title, and value are required' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  const project = db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .get()

  if (!project) {
    return new Response(JSON.stringify({ error: 'Project not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const now = new Date()
  const existing = db
    .select()
    .from(insights)
    .where(and(eq(insights.projectId, project.id), eq(insights.title, title)))
    .get()

  if (existing) {
    db.update(insights)
      .set({
        value: String(value),
        icon: icon ?? existing.icon,
        updatedAt: now,
      })
      .where(eq(insights.id, existing.id))
      .run()
  } else {
    db.insert(insights)
      .values({
        projectId: project.id,
        title,
        value: String(value),
        icon: icon || null,
        updatedAt: now,
      })
      .run()
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
