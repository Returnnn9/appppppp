import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_COOKIE = 'admin_session'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isAdminPage = pathname.startsWith('/admin')
  const isAdminApi = pathname.startsWith('/api/admin')

  // Allowlist login/logout endpoints and login page
  const isLoginApi = pathname === '/api/admin/login'
  const isLogoutApi = pathname === '/api/admin/logout'
  const isLoginPage = pathname === '/login'
  if (isLoginApi || isLogoutApi || isLoginPage) {
    return NextResponse.next()
  }

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next()
  }

  const session = req.cookies.get(ADMIN_COOKIE)?.value
  const isAuthed = session === '1'

  if (isAuthed) {
    return NextResponse.next()
  }

  if (isAdminApi) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    })
  }

  const loginUrl = new URL('/login', req.url)
  loginUrl.searchParams.set('redirect', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
} 