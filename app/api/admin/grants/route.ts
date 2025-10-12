import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    requireAdmin(req)
    const body = await req.json()
    const giftId = Number(body.gift_id)
    const amount = Math.max(1, Number(body.amount || 1))
    if (!giftId || isNaN(giftId)) return NextResponse.json({ error: 'gift_id обязателен' }, { status: 400 })

    // Resolve user
    let user = null as any
    if (body.user_id || body.tg_id) {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            body.user_id ? { id: Number(body.user_id) } : undefined,
            body.tg_id ? { tg_id: BigInt(body.tg_id) } : undefined,
          ].filter(Boolean) as any,
        },
      })
    }
    if (!user) return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })

    const result = await prisma.$transaction(async (tx) => {
      const gift = await tx.gift.findUnique({ where: { id: giftId } })
      if (!gift) throw new Error('Подарок не найден')
      if (gift.available_quantity < amount) throw new Error('Недостаточно доступного количества')

      // decrease availability
      await tx.gift.update({ where: { id: giftId }, data: { available_quantity: gift.available_quantity - amount } })

      // add to user collection
      const existing = await tx.userGift.findFirst({ where: { user_id: user.id, gift_id: giftId } })
      if (existing) {
        await tx.userGift.update({ where: { id: existing.id }, data: { amount: existing.amount + amount } })
      } else {
        await tx.userGift.create({ data: { user_id: user.id, gift_id: giftId, amount } })
      }

      // record purchase log
      await tx.purchase.create({ data: { user_id: user.id, gift_id: giftId, amount, stars_spent: 0 } })

      return { ok: true }
    })

    return NextResponse.json(result)
  } catch (e: any) {
    const status = (e as any)?.status === 401 ? 401 : 400
    const msg = e?.message || 'Не удалось выдать подарок'
    return NextResponse.json({ error: msg }, { status })
  }
} 