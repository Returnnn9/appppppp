import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { id, username, photo_url } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const tgId = BigInt(id)
    const user = await prisma.user.upsert({
      where: { tg_id: tgId },
      update: {
        username: typeof username === 'string' ? username : undefined,
        avatar_url: typeof photo_url === 'string' ? photo_url : undefined,
      },
      create: {
        tg_id: tgId,
        username: typeof username === 'string' ? username : null,
        avatar_url: typeof photo_url === 'string' ? photo_url : null,
      },
      select: { id: true },
    })

    return NextResponse.json({ ok: true, user_id: user.id })
  } catch (e) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  }
}


