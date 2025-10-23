import { NextResponse } from 'next/server';

export interface SecurityHeaders {
  [key: string]: string;
}

export const securityHeaders: SecurityHeaders = {
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https: http:",
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; '),

  // Prevent XSS attacks
  'X-XSS-Protection': '1; mode=block',

  // Prevent content type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Prevent clickjacking
  'X-Frame-Options': 'DENY',

  // HSTS (HTTP Strict Transport Security)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Feature Policy / Permissions Policy
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=(self)',
    'interest-cohort=()'
  ].join(', '),

  // Cross-Origin policies
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'cross-origin',

  // Cache control for security
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export const apiSecurityHeaders: SecurityHeaders = {
  // API-specific headers
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  
  // CORS headers (adjust based on your needs)
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com' 
    : '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

export function setSecurityHeaders(response: NextResponse, isAPI: boolean = false): NextResponse {
  const headers = isAPI ? apiSecurityHeaders : securityHeaders;
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export function createSecureResponse(data: any, status: number = 200, isAPI: boolean = true): NextResponse {
  const response = NextResponse.json(data, { status });
  return setSecurityHeaders(response, isAPI);
}

// Rate limiting headers
export function setRateLimitHeaders(
  response: NextResponse, 
  limit: number, 
  remaining: number, 
  resetTime: number
): NextResponse {
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());
  return response;
}

// CSRF protection helpers
export function generateCSRFToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken && token.length === 64;
}

// Input sanitization for headers
export function sanitizeHeader(value: string): string {
  return value
    .replace(/[\r\n]/g, '') // Remove line breaks
    .replace(/[^\x20-\x7E]/g, '') // Remove non-printable characters
    .substring(0, 1000); // Limit length
}