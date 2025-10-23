import { NextRequest } from 'next/server';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      message: 'Too many requests, please try again later.',
      skipSuccessfulRequests: false,
      ...config,
    };
  }

  private getKey(request: NextRequest): string {
    // Use IP address as the key for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 
               request.headers.get('x-real-ip') || 
               request.ip || 
               'unknown';
    
    return `${ip}:${request.nextUrl.pathname}`;
  }

  private cleanupExpired(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime <= now) {
        delete this.store[key];
      }
    });
  }

  check(request: NextRequest): { allowed: boolean; remaining: number; resetTime: number; message?: string } {
    this.cleanupExpired();
    
    const key = this.getKey(request);
    const now = Date.now();
    const windowEnd = now + this.config.windowMs;

    if (!this.store[key] || this.store[key].resetTime <= now) {
      // First request in window or window has expired
      this.store[key] = {
        count: 1,
        resetTime: windowEnd,
      };
      
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: windowEnd,
      };
    }

    // Check if limit exceeded
    if (this.store[key].count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: this.store[key].resetTime,
        message: this.config.message,
      };
    }

    // Increment counter
    this.store[key].count++;
    
    return {
      allowed: true,
      remaining: this.config.maxRequests - this.store[key].count,
      resetTime: this.store[key].resetTime,
    };
  }

  reset(request: NextRequest): void {
    const key = this.getKey(request);
    delete this.store[key];
  }
}

// Pre-configured rate limiters for different endpoints
export const apiRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  message: 'Too many API requests, please try again later.',
});

export const authRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 50, // 50 login attempts per 15 minutes (increased for development)
  message: 'Too many login attempts, please try again later.',
});

export const messageRateLimit = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 messages per minute
  message: 'You are sending messages too quickly, please slow down.',
});

export const searchRateLimit = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 searches per minute
  message: 'Too many search requests, please try again later.',
});

export const uploadRateLimit = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 50, // 50 uploads per hour
  message: 'Too many file uploads, please try again later.',
});

export { RateLimiter };