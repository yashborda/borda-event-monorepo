import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_PATHS = [
  '/dashboard',
  '/profile',
  '/users',
  '/roles',
  '/permissions',
]
const AUTH_PATHS = [
  '/login',
  '/forgot-password',
  '/reset-password',
  '/magic-link',
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionExists = request.cookies.get('session_exists')?.value === 'true'

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p))
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p))

  if (isProtected && !sessionExists) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthPage && sessionExists) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|icon.svg).*)',
  ],
}
