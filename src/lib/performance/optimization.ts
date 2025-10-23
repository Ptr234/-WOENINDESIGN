import { NextRequest, NextResponse } from 'next/server';
import React from 'react';

// Image optimization utilities
export interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  width?: number;
  height?: number;
}

export const optimizeImage = (
  url: string, 
  options: ImageOptimizationOptions = {}
): string => {
  const { quality = 80, format = 'webp', width, height } = options;
  
  const params = new URLSearchParams();
  params.set('q', quality.toString());
  
  if (format) params.set('f', format);
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  
  return `/_next/image?url=${encodeURIComponent(url)}&${params.toString()}`;
};

// Response compression and optimization
export const optimizeResponse = (response: NextResponse): NextResponse => {
  // Add compression headers
  response.headers.set('Vary', 'Accept-Encoding');
  
  // Add performance hints
  response.headers.set('Server-Timing', 'total;desc="Total Response Time"');
  
  // Add resource hints for preloading
  const preloadLinks = [
    '</fonts/inter.woff2>; rel=preload; as=font; type=font/woff2; crossorigin',
    '</api/analytics>; rel=prefetch',
  ];
  response.headers.set('Link', preloadLinks.join(', '));
  
  return response;
};

// Bundle splitting and code optimization
export const getOptimizedChunks = (): string[] => {
  return [
    'vendor', // Third-party libraries
    'common', // Shared components
    'analytics', // Analytics components
    'messaging', // Messaging components
    'search', // Search functionality
  ];
};

// Lazy loading helper
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = React.lazy(importFn);
  
  return (props: React.ComponentProps<T>) => 
    React.createElement(
      React.Suspense,
      { fallback: fallback || React.createElement('div', null, 'Loading...') },
      React.createElement(LazyComponent, props)
    );
};

// Performance monitoring for client-side
export const measurePerformance = (name: string, fn: () => void): void => {
  if (typeof window !== 'undefined' && window.performance) {
    const startTime = performance.now();
    fn();
    const endTime = performance.now();
    
    console.log(`[Performance] ${name}: ${endTime - startTime}ms`);
    
    // Send to analytics if available
    if (window.gtag) {
      window.gtag('event', 'timing_complete', {
        name,
        value: Math.round(endTime - startTime),
      });
    }
  } else {
    fn();
  }
};

// Prefetch utility for critical resources
export const prefetchResource = (url: string, type: 'script' | 'style' | 'image' | 'fetch' = 'fetch'): void => {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  
  if (type !== 'fetch') {
    link.as = type;
  }
  
  document.head.appendChild(link);
};

// Service Worker registration for caching
export const registerServiceWorker = async (): Promise<void> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }
  
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered:', registration);
    
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            console.log('New version available, refresh to update');
          }
        });
      }
    });
  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
};

// Critical CSS inlining utility
export const inlineCriticalCSS = (css: string): string => {
  return `<style data-critical>${css}</style>`;
};

// Resource loading optimization
export const loadResourceOptimized = async (
  url: string,
  type: 'script' | 'style' | 'image',
  priority: 'high' | 'low' = 'low'
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (type === 'script') {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      if (priority === 'high') {
        script.fetchPriority = 'high';
      }
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    } else if (type === 'style') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      if (priority === 'high') {
        link.fetchPriority = 'high';
      }
      link.onload = () => resolve();
      link.onerror = reject;
      document.head.appendChild(link);
    } else if (type === 'image') {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve();
      img.onerror = reject;
    }
  });
};

// Font loading optimization
export const optimizeFontLoading = (): void => {
  if (typeof document === 'undefined') return;
  
  // Preload critical fonts
  const criticalFonts = [
    '/fonts/inter-regular.woff2',
    '/fonts/inter-medium.woff2',
    '/fonts/inter-bold.woff2',
  ];
  
  criticalFonts.forEach(font => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    link.href = font;
    document.head.appendChild(link);
  });
  
  // Add font-display: swap to CSS
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-family: 'Inter';
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
};

// Dynamic import with error handling
export const dynamicImport = async <T>(
  importFn: () => Promise<T>,
  retries: number = 3
): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await importFn();
    } catch (error) {
      if (i === retries - 1) {
        throw error;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Dynamic import failed after retries');
};

// Memory optimization utilities
export const cleanupMemory = (): void => {
  if (typeof window === 'undefined') return;
  
  // Clear any unused references
  if (window.gc) {
    window.gc();
  }
};

// Battery and network awareness
export const isLowPowerMode = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  
  const battery = (navigator as any).battery || (navigator as any).getBattery?.();
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  const lowBattery = battery && battery.level < 0.2;
  const slowConnection = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
  
  return lowBattery || slowConnection;
};

// Adaptive loading based on device capabilities
export const getAdaptiveLoadingConfig = (): {
  imageQuality: number;
  enableAnimations: boolean;
  prefetchEnabled: boolean;
} => {
  const isLowPower = isLowPowerMode();
  
  return {
    imageQuality: isLowPower ? 60 : 80,
    enableAnimations: !isLowPower,
    prefetchEnabled: !isLowPower,
  };
};

// React performance optimization helpers

export const useMemoizedCallback = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: React.DependencyList
): T => {
  return React.useCallback(callback, deps);
};

export const useMemoizedValue = <T>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  return React.useMemo(factory, deps);
};

// Virtual scrolling for large lists
export const useVirtualScrolling = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;
  
  return {
    visibleItems,
    offsetY,
    totalHeight: items.length * itemHeight,
    onScroll: (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    },
  };
};