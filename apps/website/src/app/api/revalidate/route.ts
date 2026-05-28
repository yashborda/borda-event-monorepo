import { revalidateTag } from 'next/cache'
import { NextRequest } from 'next/server'

export const POST = async (req: NextRequest) => {
  try {
    const { secret, tags } = (await req.json()) as {
      secret: string
      tags: string[]
    }
    if (secret !== process.env['REVALIDATE_SECRET']) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!Array.isArray(tags)) {
      return Response.json({ error: 'tags must be an array' }, { status: 400 })
    }
    for (const tag of tags) {
      revalidateTag(tag, {})
    }
    return Response.json({ revalidated: true, tags })
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }
}
