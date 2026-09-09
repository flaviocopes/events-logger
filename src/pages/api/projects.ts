import type { APIRoute } from 'astro'
import { db } from '@/db'
import { projects } from '@/db/schema'
import { authenticateRequest, generateProjectId } from '@/lib/auth'

export const GET: APIRoute = async () => {
  const allProjects = db.select().from(projects).all()
  return new Response(JSON.stringify(allProjects), {
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
  const name = body.name?.trim()

  if (!name) {
    return new Response(JSON.stringify({ error: 'name is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const id = generateProjectId()
  const now = new Date()

  db.insert(projects).values({ id, name, createdAt: now }).run()

  return new Response(JSON.stringify({ id, name }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  })
}
