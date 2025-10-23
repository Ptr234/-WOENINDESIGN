import { NextRequest } from 'next/server';

interface RateLimitResult {
  success: boolean;
  remaining?: number;
  resetTime?: number;
  message?: string;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// Global store for rate limiting (in production, use Redis or similar)
const store: RateLimitStore = {};

function cleanupExpired(): void {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime <= now) {
      delete store[key];
    }
  });
}

function getClientKey(request: NextRequest, identifier: string): string {
  // Use IP address as the key for rate limiting
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 
             request.headers.get('x-real-ip') || 
             request.ip || 
             'unknown';
  
  return `${ip}:${identifier}`;
}

export async function rateLimitMiddleware(
  request: NextRequest,
  identifier: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult> {
  cleanupExpired();
  
  const key = getClientKey(request, identifier);
  const now = Date.now();
  const windowEnd = now + windowMs;

  if (!store[key] || store[key].resetTime <= now) {
    // First request in window or window has expired
    store[key] = {
      count: 1,
      resetTime: windowEnd,
    };
    
    return {
      success: true,
      remaining: maxRequests - 1,
      resetTime: windowEnd,
    };
  }

  // Check if limit exceeded
  if (store[key].count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: store[key].resetTime,
      message: 'Too many requests, please try again later.',
    };
  }

  // Increment counter
  store[key].count++;
  
  return {
    success: true,
    remaining: maxRequests - store[key].count,
    resetTime: store[key].resetTime,
  };
}

export function resetRateLimit(request: NextRequest, identifier: string): void {
  const key = getClientKey(request, identifier);
  delete store[key];
}