export function requireAdmin(req: Request) {
  // Next.js route handlers use the Web Request API
  const cookieHeader = req.headers.get('cookie') || ''
  // Simple parse
  const cookies = Object.fromEntries(cookieHeader.split(';').map(p => {
    const [k, ...rest] = p.trim().split('=')
    return [decodeURIComponent(k), decodeURIComponent(rest.join('='))]
  }).filter(([k]) => k)) as Record<string, string>

  const session = cookies['admin_session']
  const ok = session === '1'
  if (!ok) {
    const err = new Error('UNAUTHORIZED') as any
    err.status = 401
    throw err
  }
} 