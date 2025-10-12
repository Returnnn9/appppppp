import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

const allowedRibbonColors = new Set(['blue', 'green', 'orange', 'red'])

// GET: список всех подарков (админ)
export async function GET() {
  try {
    const gifts = await prisma.gift.findMany({ orderBy: { id: 'asc' } })
    return NextResponse.json(gifts)
  } catch (e) {
    // Log the error for debugging
    console.error('Ошибка при получении подарков:', e)
    // Return the error message expected by the frontend
    return NextResponse.json({ error: 'Не удалось загрузить подарки' }, { status: 500 })
  }
}

// POST: создать подарок
export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Нормализация входных значений ленты
    let ribbon_text = typeof body.ribbon_text === 'string' ? body.ribbon_text.trim().slice(0, 24) : null
    if (ribbon_text && ribbon_text.length === 0) ribbon_text = null

    let ribbon_color = body.ribbon_color
    if (ribbon_color === '' || ribbon_color === null || !allowedRibbonColors.has(ribbon_color)) {
      ribbon_color = null
    }

    let limited_until: Date | null = null
    if (body.limited_until) {
      const d = new Date(body.limited_until)
      limited_until = isNaN(d.getTime()) ? null : d
    }

    const created = await prisma.gift.create({
      data: {
        name: body.name ?? 'New Gift',
        description: body.description ?? null,
        price: Number(body.price ?? 0),
        total_quantity: Number(body.total_quantity ?? 0),
        available_quantity: Number(body.available_quantity ?? 0),
        sticker_url: body.sticker_url ?? null,
        status: body.status ?? 'active',
        frame_type: body.frame_type ?? 'default',
        ribbon_text,
        ribbon_color,
        is_active: body.is_active ?? true,
        is_limited: body.is_limited ?? false,
        limited_until,
      },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    // Log the error for debugging
    console.error('Ошибка при создании подарка:', e)
    return NextResponse.json({ error: 'Не удалось создать подарок' }, { status: 500 })
  }
}
