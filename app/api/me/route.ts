import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const tgId = BigInt(id)

    const url = new URL(req.url)
    const includeStars = url.searchParams.get('stars') === 'true'

    const user = await prisma.user.findFirst({
      where: { tg_id: tgId },
      select: {
        username: true,
        avatar_url: true,
        bought_gifts: true,
        sold_gifts: true,
        ...(includeStars ? { stars: true } : {}),
      },
    })

    if (!user) return NextResponse.json({ ok: true, user: null })
    return NextResponse.json({ ok: true, user })
  } catch (e) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  }
}


