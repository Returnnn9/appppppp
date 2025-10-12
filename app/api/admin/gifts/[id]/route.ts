import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

async function parseId(paramsPromise: Promise<{ id: string }>) {
  const { id } = await paramsPromise
  const idNum = Number(id)
  if (!id || Number.isNaN(idNum)) return null
  return idNum
}

const allowedRibbonColors = new Set(['blue', 'green', 'orange', 'red'])

// PATCH: обновить подарок
export async function PATCH(_req: Request, context: { params: Promise<{ id: string }> }) {
  const id = await parseId(context.params)
  if (!id) return NextResponse.json({ error: 'Некорректный id' }, { status: 400 })
  try {
    const body = await _req.json()

    // Нормализация ribbon_text
    if (typeof body.ribbon_text === 'string') {
      body.ribbon_text = body.ribbon_text.trim().slice(0, 24)
      if (body.ribbon_text.length === 0) body.ribbon_text = null
    }

    // Валидация цвета ленты
    if (typeof body.ribbon_color !== 'undefined') {
      if (body.ribbon_color === '' || body.ribbon_color === null) {
        body.ribbon_color = null
      } else if (!allowedRibbonColors.has(body.ribbon_color)) {
        body.ribbon_color = null
      }
    }

    // Приведение limited_until к Date|null
    if (typeof body.limited_until !== 'undefined') {
      if (!body.limited_until) {
        body.limited_until = null
      } else {
        const d = new Date(body.limited_until)
        body.limited_until = isNaN(d.getTime()) ? null : d
      }
    }

    const updated = await prisma.gift.update({
      where: { id },
      data: body,
    })
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: 'Не удалось обновить подарок' }, { status: 500 })
  }
}

// DELETE: удалить подарок
export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  const id = await parseId(context.params)
  if (!id) return NextResponse.json({ error: 'Некорректный id' }, { status: 400 })
  try {
    await prisma.gift.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Не удалось удалить подарок' }, { status: 500 })
  }
}


