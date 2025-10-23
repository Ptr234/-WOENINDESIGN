import { NextRequest, NextResponse } from 'next/server';
import { setSecurityHeaders, setRateLimitHeaders } from './lib/security/headers';
import { 
  apiRateLimit, 
  authRateLimit, 
  messageRateLimit, 
  searchRateLimit, 
  uploadRateLimit 
} from './lib/security/rateLimiter';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Apply rate limiting based on path
  const rateLimitResult = getRateLimitForPath(pathname, request);
  
  if (!rateLimitResult.allowed) {
    const response = NextResponse.json(
      { 
        success: false, 
        error: rateLimitResult.message || 'Too many requests',
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
      },
      { status: 429 }
    );
    
    setRateLimitHeaders(
      response,
      getMaxRequestsForPath(pathname),
      rateLimitResult.remaining,
      rateLimitResult.resetTime
    );
    
    return setSecurityHeaders(response, true);
  }

  // Continue with request
  const response = NextResponse.next();
  
  // Set rate limit headers for successful requests
  setRateLimitHeaders(
    response,
    getMaxRequestsForPath(pathname),
    rateLimitResult.remaining,
    rateLimitResult.resetTime
  );
  
  // Apply security headers
  return setSecurityHeaders(response, isAPIRoute(pathname));
}

function getRateLimitForPath(pathname: string, request: NextRequest) {
  // Authentication endpoints
  if (pathname.startsWith('/api/auth/')) {
    return authRateLimit.check(request);
  }
  
  // Message endpoints
  if (pathname.startsWith('/api/messages') || pathname.startsWith('/api/conversations')) {
    return messageRateLimit.check(request);
  }
  
  // Search endpoints
  if (pathname.includes('/search') || 
      pathname.startsWith('/api/designers') || 
      pathname.startsWith('/api/suppliers')) {
    return searchRateLimit.check(request);
  }
  
  // Upload endpoints
  if (pathname.includes('/upload') || pathname.includes('/image')) {
    return uploadRateLimit.check(request);
  }
  
  // All other API endpoints
  if (pathname.startsWith('/api/')) {
    return apiRateLimit.check(request);
  }
  
  // No rate limiting for static files and pages
  return { allowed: true, remaining: 999, resetTime: Date.now() + 900000 };
}

function getMaxRequestsForPath(pathname: string): number {
  // More generous rate limits for development
  if (pathname.startsWith('/api/auth/')) return 50;
  if (pathname.startsWith('/api/messages') || pathname.startsWith('/api/conversations')) return 100;
  if (pathname.includes('/search') || 
      pathname.startsWith('/api/designers') || 
      pathname.startsWith('/api/suppliers')) return 300;
  if (pathname.includes('/upload') || pathname.includes('/image')) return 500;
  if (pathname.startsWith('/api/')) return 1000;
  return 9999;
}

function isAPIRoute(pathname: string): boolean {
  return pathname.startsWith('/api/');
}

// Apply middleware to specific paths
export const config = {
  matcher: [
    // API routes
    '/api/:path*',
    
    // App routes that need security headers
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};