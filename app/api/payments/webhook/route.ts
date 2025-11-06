import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { pre_checkout_query, message } = body

    // Обработка pre_checkout_query (подтверждение перед оплатой)
    if (pre_checkout_query) {
      const { id, invoice_payload } = pre_checkout_query
      const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
      if (!BOT_TOKEN) {
        return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
      }

      // Проверяем payload и подтверждаем
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerPreCheckoutQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pre_checkout_query_id: id,
          ok: true,
        }),
      })

      return NextResponse.json({ ok: true })
    }

    // Обработка успешной оплаты (successful_payment)
    if (message?.successful_payment) {
      const { invoice_payload, total_amount, currency } = message.successful_payment
      
      // Парсим payload: topup_<user_id>_<timestamp> или gift_<gift_id>_<timestamp>
      if (invoice_payload?.startsWith('topup_')) {
        const parts = invoice_payload.split('_')
        const userId = parseInt(parts[1], 10)
        const starsAmount = total_amount || 0

        if (userId && starsAmount > 0) {
          await prisma.user.update({
            where: { id: userId },
            data: { stars: { increment: starsAmount } },
          })
        }
      } else if (invoice_payload?.startsWith('gift_')) {
        // Обработка покупки подарка (если нужно)
        const parts = invoice_payload.split('_')
        const giftId = parseInt(parts[1], 10)
        const userId = message.from?.id ? BigInt(message.from.id) : null

        if (giftId && userId) {
          const user = await prisma.user.findFirst({ where: { tg_id: userId } })
          if (user) {
            await prisma.$transaction(async (tx) => {
              const gift = await tx.gift.findUnique({ where: { id: giftId } })
              if (gift && gift.available_quantity > 0) {
                await tx.gift.update({
                  where: { id: giftId },
                  data: { available_quantity: { decrement: 1 } },
                })
                await tx.purchase.create({
                  data: {
                    user_id: user.id,
                    gift_id: giftId,
                    amount: 1,
                    stars_spent: total_amount || gift.price,
                  },
                })
                const existing = await tx.userGift.findFirst({
                  where: { user_id: user.id, gift_id: giftId },
                })
                if (existing) {
                  await tx.userGift.update({
                    where: { id: existing.id },
                    data: { amount: { increment: 1 } },
                  })
                } else {
                  await tx.userGift.create({
                    data: {
                      user_id: user.id,
                      gift_id: giftId,
                      amount: 1,
                    },
                  })
                }
                await tx.user.update({
                  where: { id: user.id },
                  data: { 
                    bought_gifts: { increment: 1 },
                    stars: { decrement: total_amount || gift.price },
                  },
                })
              }
            })
          }
        }
      }

      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Webhook error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

