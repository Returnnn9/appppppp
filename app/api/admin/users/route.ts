import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

// GET: list users (basic)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')?.trim() || ''
    const users = await prisma.user.findMany({
      where: q
        ? {
            OR: [
              { username: { contains: q, mode: 'insensitive' } },
              { tg_id: isFinite(Number(q)) ? BigInt(q) : undefined as any },
            ].filter(Boolean) as any,
          }
        : undefined,
      orderBy: { id: 'asc' },
      take: 100,
    })
    return NextResponse.json(users)
  } catch (e) {
    return NextResponse.json({ error: 'Не удалось получить пользователей' }, { status: 500 })
  }
}

// POST: upsert user
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const tg_id = body.tg_id ? BigInt(body.tg_id) : undefined
    if (!tg_id) return NextResponse.json({ error: 'tg_id обязателен' }, { status: 400 })
    const username = typeof body.username === 'string' ? body.username : null

    const user = await prisma.user.upsert({
      where: { tg_id },
      update: { username },
      create: { tg_id, username },
    })
    return NextResponse.json(user, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Не удалось создать/обновить пользователя' }, { status: 500 })
  }
} 