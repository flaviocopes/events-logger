import type { APIRoute } from 'astro'
import { db } from '@/db'
import { insights } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'

export const POST: APIRoute = async ({ params, url, redirect }) => {
  const insightId = parseInt(params.insightId!)
  if (isNaN(insightId)) {
    return new Response('Invalid insight ID', { status: 400 })
  }

  const insight = db
    .select()
    .from(insights)
    .where(eq(insights.id, insightId))
    .get()
  if (!insight) {
    return new Response('Insight not found', { status: 404 })
  }

  db.delete(insights).where(eq(insights.id, insightId)).run()

  const projectId = url.searchParams.get('project') || insight.projectId
  return redirect(`/partials/insight-grid?project=${projectId}`, 303)
}
