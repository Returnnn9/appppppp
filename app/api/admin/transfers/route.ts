import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

export const runtime = 'nodejs'

/*
POST /api/admin/transfers
{
  from_user_id?: number,
  to_user_id?: number,
  from_tg_id?: string|number,
  to_tg_id?: string|number,
  gift_id: number,
  amount: number
}
*/
export async function POST(req: Request) {
  try {
    requireAdmin(req)
    const body = await req.json()
    const giftId = Number(body.gift_id)
    const amount = Math.max(1, Number(body.amount || 1))
    if (!giftId || isNaN(giftId)) return NextResponse.json({ error: 'gift_id обязателен' }, { status: 400 })

    // Resolve users
    let fromUser = null as any
    let toUser = null as any

    if (body.from_user_id || body.from_tg_id) {
      fromUser = await prisma.user.findFirst({
        where: {
          OR: [
            body.from_user_id ? { id: Number(body.from_user_id) } : undefined,
            body.from_tg_id ? { tg_id: BigInt(body.from_tg_id) } : undefined,
          ].filter(Boolean) as any,
        },
      })
      if (!fromUser) return NextResponse.json({ error: 'Отправитель не найден' }, { status: 404 })
    }

    if (body.to_user_id || body.to_tg_id) {
      toUser = await prisma.user.findFirst({
        where: {
          OR: [
            body.to_user_id ? { id: Number(body.to_user_id) } : undefined,
            body.to_tg_id ? { tg_id: BigInt(body.to_tg_id) } : undefined,
          ].filter(Boolean) as any,
        },
      })
      if (!toUser) return NextResponse.json({ error: 'Получатель не найден' }, { status: 404 })
    } else {
      return NextResponse.json({ error: 'Нужно указать получателя' }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx) => {
      // Decrease from sender if present
      if (fromUser) {
        const from = await tx.userGift.findFirst({ where: { user_id: fromUser.id, gift_id: giftId } })
        if (!from || from.amount < amount) throw new Error('Недостаточно подарков у отправителя')
        await tx.userGift.update({ where: { id: from.id }, data: { amount: from.amount - amount } })
      }

      // Increase to recipient (create if missing)
      const existingTo = await tx.userGift.findFirst({ where: { user_id: toUser.id, gift_id: giftId } })
      if (existingTo) {
        await tx.userGift.update({ where: { id: existingTo.id }, data: { amount: existingTo.amount + amount } })
      } else {
        await tx.userGift.create({ data: { user_id: toUser.id, gift_id: giftId, amount } })
      }

      return { ok: true }
    })

    return NextResponse.json(result)
  } catch (e: any) {
    const status = (e as any)?.status === 401 ? 401 : 400
    const msg = e?.message || 'Не удалось выполнить перевод'
    return NextResponse.json({ error: msg }, { status })
  }
} 