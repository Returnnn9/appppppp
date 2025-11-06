import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay() || 7 // 1..7 (Mon..Sun); treat Sun as 7
  if (day !== 1) d.setHours(-24 * (day - 1)) // move to Monday
  d.setHours(0, 0, 0, 0)
  return d
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const period = url.searchParams.get('period') === 'week' ? 'week' : 'all'
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '100', 10) || 100, 200)
    const tgIdStr = url.searchParams.get('tg_id')
    const tgId = tgIdStr ? BigInt(tgIdStr) : null

    const where = period === 'week' ? { purchased_at: { gte: startOfWeek(new Date()) } } : {}

    const top = await prisma.purchase.groupBy({
      by: ['user_id'],
      where,
      _sum: { stars_spent: true, amount: true },
      orderBy: { _sum: { stars_spent: 'desc' } },
      take: limit,
    })

    const userIds = top.map(t => t.user_id)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, avatar_url: true, tg_id: true },
    })
    const idToUser = new Map(users.map(u => [u.id, u]))

    const leaderboard = top.map((t, idx) => {
      const u = idToUser.get(t.user_id)
      return {
        place: idx + 1,
        user_id: t.user_id,
        username: u?.username ?? null,
        avatar_url: u?.avatar_url ?? null,
        tg_id: u?.tg_id?.toString() ?? null,
        stars: t._sum.stars_spent ?? 0,
        gifts: t._sum.amount ?? 0,
      }
    })

    // current user rank (optional)
    let me: null | any = null
    if (tgId) {
      const meUser = await prisma.user.findFirst({ where: { tg_id: tgId }, select: { id: true, username: true, avatar_url: true } })
      if (meUser) {
        const meAgg = await prisma.purchase.aggregate({
          where: { ...(where as any), user_id: meUser.id }, _sum: { stars_spent: true, amount: true }
        })
        // compute rank by counting users with higher stars
        const higher = await prisma.purchase.groupBy({ by: ['user_id'], where, _sum: { stars_spent: true }, orderBy: { _sum: { stars_spent: 'desc' } } })
        const rank = higher.findIndex(h => h.user_id === meUser.id) + 1 || null
        me = {
          place: rank,
          username: meUser.username,
          avatar_url: meUser.avatar_url,
          stars: meAgg._sum.stars_spent ?? 0,
          gifts: meAgg._sum.amount ?? 0,
        }
      }
    }

    return NextResponse.json({ ok: true, leaderboard, me })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to load leaderboard' }, { status: 500 })
  }
}


