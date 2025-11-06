import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'file is required' }, { status: 400 })

    // Валидация: только GIF и ограничение размера (до 8 МБ)
    const mime = (file as any).type || ''
    const size = (file as any).size || 0
    if (mime !== 'image/gif') {
      return NextResponse.json({ error: 'Only GIF allowed' }, { status: 415 })
    }
    if (size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 8MB)' }, { status: 413 })
    }

    const bytes = new Uint8Array(await file.arrayBuffer())
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')
    const filename = `${Date.now()}_${safeName}`
    const filepath = join(uploadDir, filename)
    await writeFile(filepath, bytes)

    const url = `/uploads/${filename}`
    return NextResponse.json({ ok: true, url })
  } catch (e) {
    return NextResponse.json({ error: 'upload failed' }, { status: 500 })
  }
}


