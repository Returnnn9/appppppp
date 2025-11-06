import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { tg_id, amount } = body
    if (!tg_id || typeof amount !== 'number' || amount < 1) {
      return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
    }

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
    if (!BOT_TOKEN) {
      return NextResponse.json({ error: 'Server misconfigured: TELEGRAM_BOT_TOKEN missing' }, { status: 500 })
    }

    const tgId = BigInt(tg_id)
    const user = await prisma.user.findFirst({ where: { tg_id: tgId }, select: { id: true, username: true } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const payload = `topup_${user.id}_${Date.now()}`
    const params = {
      title: `Пополнение баланса на ${amount} звезд`,
      description: `Пополнение баланса для пользователя ${user.username || tg_id}`,
      payload,
      provider_token: '',
      currency: 'XTR',
      prices: JSON.stringify([{ label: `Пополнение на ${amount} звезд`, amount: Math.max(1, Math.floor(amount)) }]),
    }

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/createInvoiceLink`
    const tgRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params as Record<string, string>),
      cache: 'no-store',
    })
    const data = await tgRes.json().catch(() => null)

    if (!tgRes.ok || !data?.ok || !data?.result) {
      return NextResponse.json({ error: 'Failed to create invoice', details: data }, { status: 502 })
    }

    const invoiceLink: string = data.result
    let slug = ''
    try {
      const parts = invoiceLink.split('/')
      slug = parts[parts.length - 1] || ''
    } catch {}

    return NextResponse.json({ ok: true, invoiceLink, slug, payload })
  } catch (e) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  }
}

