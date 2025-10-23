// Temporary type definitions for Next.js 15 compatibility
import { NextRequest, NextResponse } from 'next/server';

declare global {
  namespace Next {
    interface RouteParams {
      params: { [key: string]: string };
    }
    
    interface RouteContext {
      params: Promise<{ [key: string]: string }>;
    }
  }
}

// Extend NextRequest to include missing properties
declare module 'next/server' {
  interface NextRequest {
    ip?: string;
  }
}

// Extend Window for missing properties
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export {};