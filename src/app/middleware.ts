// middleware.ts (à la racine du projet Next.js)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Routes publiques qui ne nécessitent pas d'authentification
  const publicPaths = [
    '/auth',
    '/auth/login',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/change-password'
  ];
  
  // Vérifier si c'est une route publique
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  // Récupérer les cookies de session
  const sessionCookie = request.cookies.get('ey-session');
  const refreshCookie = request.cookies.get('ey-refresh');
  
  // Si l'utilisateur n'a pas de cookies et essaie d'accéder à une route protégée
  if (!isPublicPath && !sessionCookie && !refreshCookie) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }
  
  // Si l'utilisateur a des cookies et essaie d'accéder à /auth (sauf change-password)
  if (pathname === '/auth' && sessionCookie && !pathname.includes('change-password')) {
    // On pourrait vérifier le rôle ici si nécessaire
    return NextResponse.redirect(new URL('/EyEngage/EmployeeDashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets|public).*)',
  ],
};