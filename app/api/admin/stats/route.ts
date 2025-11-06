import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function startOfDay(d: Date) {
  const dt = new Date(d)
  dt.setHours(0, 0, 0, 0)
  return dt
}

export async function GET() {
  try {
    const now = new Date()
    const today = startOfDay(now)

    const [firstUser, usersToday, purchasesAggTotal, purchasesAggToday, topToday] = await Promise.all([
      prisma.user.findFirst({ orderBy: { registered_at: 'asc' }, select: { registered_at: true } }),
      prisma.user.count({ where: { registered_at: { gte: today } } }),
      prisma.purchase.aggregate({ _sum: { stars_spent: true, amount: true } }),
      prisma.purchase.aggregate({ _sum: { stars_spent: true, amount: true }, where: { purchased_at: { gte: today } } }),
      prisma.purchase.groupBy({
        by: ['user_id'],
        where: { purchased_at: { gte: today } },
        _sum: { stars_spent: true, amount: true },
        orderBy: { _sum: { stars_spent: 'desc' } },
        take: 1,
      }),
    ])

    const daysOperating = firstUser
      ? Math.max(1, Math.ceil((now.getTime() - firstUser.registered_at.getTime()) / (1000 * 60 * 60 * 24)))
      : 1

    let topUser = null as null | { username: string | null; avatar_url: string | null; stars_spent: number; gifts_purchased: number }
    if (topToday.length > 0) {
      const best = topToday[0]
      const user = await prisma.user.findUnique({ where: { id: best.user_id }, select: { username: true, avatar_url: true } })
      topUser = {
        username: user?.username ?? null,
        avatar_url: user?.avatar_url ?? null,
        stars_spent: best._sum.stars_spent ?? 0,
        gifts_purchased: best._sum.amount ?? 0,
      }
    }

    return NextResponse.json({
      days_operating: daysOperating,
      total: {
        gifts_purchased: purchasesAggTotal._sum.amount ?? 0,
        stars_spent: purchasesAggTotal._sum.stars_spent ?? 0,
        new_users: await prisma.user.count(),
      },
      today: {
        gifts_purchased: purchasesAggToday._sum.amount ?? 0,
        stars_spent: purchasesAggToday._sum.stars_spent ?? 0,
        new_users: usersToday,
      },
      top_today: topUser,
    })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}


