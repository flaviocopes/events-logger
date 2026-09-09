import type { APIRoute } from 'astro'
import { db } from '@/db'
import { events } from '@/db/schema'
import { eq } from 'drizzle-orm'

export const POST: APIRoute = async ({ params }) => {
  const eventId = parseInt(params.eventId!)
  if (isNaN(eventId)) {
    return new Response(JSON.stringify({ error: 'Invalid event ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const event = db.select().from(events).where(eq(events.id, eventId)).get()
  if (!event) {
    return new Response(JSON.stringify({ error: 'Event not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  db.delete(events).where(eq(events.id, eventId)).run()

  return new Response(JSON.stringify({ id: eventId, deleted: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
