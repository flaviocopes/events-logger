import type { APIRoute } from 'astro'
import { db } from '@/db'
import { events, categories, projects } from '@/db/schema'
import { eq, and, desc, like, or, lt } from 'drizzle-orm'
import { authenticateRequest } from '@/lib/auth'

export const GET: APIRoute = async ({ url }) => {
  const projectId = url.searchParams.get('project')
  if (!projectId) {
    return new Response(JSON.stringify({ error: 'project is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const category = url.searchParams.get('category')
  const search = url.searchParams.get('search')
  const cursor = url.searchParams.get('cursor')
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100)

  const conditions = [eq(events.projectId, projectId)]

  if (category) {
    conditions.push(eq(events.category, category))
  }

  if (search) {
    conditions.push(
      or(
        like(events.title, `%${search}%`),
        like(events.description, `%${search}%`),
        like(events.tags, `%${search}%`)
      )!
    )
  }

  if (cursor) {
    conditions.push(lt(events.id, parseInt(cursor)))
  }

  const rows = db
    .select()
    .from(events)
    .where(and(...conditions))
    .orderBy(desc(events.createdAt))
    .limit(limit)
    .all()

  const nextCursor = rows.length === limit ? rows[rows.length - 1].id : null

  return new Response(JSON.stringify({ events: rows, nextCursor }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

export const POST: APIRoute = async ({ request }) => {
  if (!authenticateRequest(request)) {
    return new Response(JSON.stringify({ error: 'Invalid API key' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = await request.json()
  const {
    project: projectId,
    category: categoryName,
    title,
    description,
    icon,
    tags,
    url,
    notify,
    user_id,
    created_at,
  } = body

  if (!projectId || !categoryName || !title) {
    return new Response(
      JSON.stringify({ error: 'project, category, and title are required' }),
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

  const existingCategory = db
    .select()
    .from(categories)
    .where(
      and(
        eq(categories.projectId, project.id),
        eq(categories.name, categoryName)
      )
    )
    .get()

  if (!existingCategory) {
    db.insert(categories)
      .values({
        projectId: project.id,
        name: categoryName,
        createdAt: new Date(),
      })
      .run()
  }

  const timestamp = created_at ? new Date(created_at * 1000) : new Date()
  const event = db
    .insert(events)
    .values({
      projectId: project.id,
      category: categoryName,
      title,
      description: description || null,
      icon: icon || null,
      tags: tags ? JSON.stringify(tags) : null,
      url: url || null,
      userId: user_id || null,
      notify: notify || false,
      createdAt: timestamp,
    })
    .returning()
    .get()

  return new Response(JSON.stringify(event), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  })
}
