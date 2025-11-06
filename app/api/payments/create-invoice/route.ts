import { NextResponse } from 'next/server'

type CreateInvoiceRequest = {
  giftId: number
  title: string
  amount: number // stars amount
  description?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<CreateInvoiceRequest>
    if (!body?.giftId || !body?.title || typeof body?.amount !== 'number') {
      return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
    }

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
    if (!BOT_TOKEN) {
      return NextResponse.json({ error: 'Server misconfigured: TELEGRAM_BOT_TOKEN missing' }, { status: 500 })
    }

    // Telegram Bot API: createInvoiceLink
    // For Stars use currency XTR and amount as stars (integer)
    const payload = `gift_${body.giftId}_${Date.now()}`
    const params = {
      title: body.title,
      description: body.description ?? body.title,
      payload,
      provider_token: '', // not required for Stars
      currency: 'XTR',
      prices: JSON.stringify([{ label: body.title, amount: Math.max(1, Math.floor(body.amount)) }]),
    }

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/createInvoiceLink` as const
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
    // Extract slug from t.me/invoice/<slug>
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


