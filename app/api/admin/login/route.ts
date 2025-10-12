import { NextResponse } from 'next/server'
import { adminConfig } from '@/config/admin'

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()
    if (username === adminConfig.username && password === adminConfig.password) {
      const res = NextResponse.json({ ok: true })
      res.cookies.set('admin_session', '1', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 8, // 8h
      })
      return res
    }
    return NextResponse.json({ error: 'Неверный логин или пароль' }, { status: 401 })
  } catch {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  }
} 