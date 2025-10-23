// Performance monitoring and logging utilities

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface ErrorLog {
  error: Error;
  context: string;
  userId?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private errors: ErrorLog[] = [];
  private readonly maxMetrics = 1000;
  private readonly maxErrors = 500;

  // Track performance metrics
  recordMetric(name: string, value: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    // Keep only the latest metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow operations
    if (this.isSlowOperation(name, value)) {
      console.warn(`[PERFORMANCE] Slow operation detected: ${name} took ${value}ms`, metadata);
    }
  }

  // Track database query performance
  async trackDatabaseQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await queryFn();
      const duration = performance.now() - startTime;
      
      this.recordMetric(`db.${queryName}`, duration, {
        ...metadata,
        success: true,
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      this.recordMetric(`db.${queryName}`, duration, {
        ...metadata,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      this.logError(error as Error, `Database query: ${queryName}`, undefined, metadata);
      throw error;
    }
  }

  // Track API endpoint performance
  async trackAPIEndpoint<T>(
    endpoint: string,
    method: string,
    handlerFn: () => Promise<T>,
    userId?: string
  ): Promise<T> {
    const startTime = performance.now();
    const metricName = `api.${method.toLowerCase()}.${endpoint.replace(/\//g, '.')}`;
    
    try {
      const result = await handlerFn();
      const duration = performance.now() - startTime;
      
      this.recordMetric(metricName, duration, {
        method,
        endpoint,
        userId,
        success: true,
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      this.recordMetric(metricName, duration, {
        method,
        endpoint,
        userId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      this.logError(error as Error, `API endpoint: ${method} ${endpoint}`, userId);
      throw error;
    }
  }

  // Log errors
  logError(
    error: Error,
    context: string,
    userId?: string,
    metadata?: Record<string, any>
  ): void {
    const errorLog: ErrorLog = {
      error,
      context,
      userId,
      timestamp: Date.now(),
      metadata,
    };

    this.errors.push(errorLog);

    // Keep only the latest errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ERROR] ${context}:`, error, metadata);
    }

    // In production, you might want to send to external monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(errorLog);
    }
  }

  // Get performance statistics
  getPerformanceStats(metricName?: string, timeRangeMs?: number): {
    count: number;
    average: number;
    min: number;
    max: number;
    percentile95: number;
  } {
    const now = Date.now();
    const cutoff = timeRangeMs ? now - timeRangeMs : 0;
    
    let filteredMetrics = this.metrics.filter(m => m.timestamp > cutoff);
    
    if (metricName) {
      filteredMetrics = filteredMetrics.filter(m => m.name === metricName);
    }

    if (filteredMetrics.length === 0) {
      return { count: 0, average: 0, min: 0, max: 0, percentile95: 0 };
    }

    const values = filteredMetrics.map(m => m.value).sort((a, b) => a - b);
    const count = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const average = sum / count;
    const min = values[0];
    const max = values[count - 1];
    const percentile95Index = Math.floor(count * 0.95);
    const percentile95 = values[percentile95Index] || max;

    return { count, average, min, max, percentile95 };
  }

  // Get error statistics
  getErrorStats(timeRangeMs?: number): {
    totalErrors: number;
    errorsByContext: Record<string, number>;
    recentErrors: ErrorLog[];
  } {
    const now = Date.now();
    const cutoff = timeRangeMs ? now - timeRangeMs : 0;
    
    const filteredErrors = this.errors.filter(e => e.timestamp > cutoff);
    
    const errorsByContext: Record<string, number> = {};
    filteredErrors.forEach(error => {
      errorsByContext[error.context] = (errorsByContext[error.context] || 0) + 1;
    });

    return {
      totalErrors: filteredErrors.length,
      errorsByContext,
      recentErrors: filteredErrors.slice(-10), // Last 10 errors
    };
  }

  // Check if operation is slow
  private isSlowOperation(name: string, duration: number): boolean {
    const thresholds: Record<string, number> = {
      'db.': 1000, // Database queries > 1s
      'api.': 5000, // API endpoints > 5s
      'cache.': 100, // Cache operations > 100ms
      'file.': 2000, // File operations > 2s
    };

    for (const [prefix, threshold] of Object.entries(thresholds)) {
      if (name.startsWith(prefix) && duration > threshold) {
        return true;
      }
    }

    return duration > 10000; // Any operation > 10s
  }

  // Send error to external monitoring service (placeholder)
  private sendToMonitoringService(errorLog: ErrorLog): void {
    // In a real application, you would send this to services like:
    // - Sentry
    // - DataDog
    // - New Relic
    // - Custom logging service
    
    // For now, just log critical errors
    if (this.isCriticalError(errorLog.error)) {
      console.error('[CRITICAL ERROR]', {
        message: errorLog.error.message,
        stack: errorLog.error.stack,
        context: errorLog.context,
        userId: errorLog.userId,
        timestamp: new Date(errorLog.timestamp).toISOString(),
        metadata: errorLog.metadata,
      });
    }
  }

  private isCriticalError(error: Error): boolean {
    const criticalPatterns = [
      /database.*connection/i,
      /authentication.*failed/i,
      /payment.*failed/i,
      /security.*violation/i,
      /memory.*exceeded/i,
    ];

    return criticalPatterns.some(pattern => pattern.test(error.message));
  }

  // Health check
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: {
      avgResponseTime: number;
      errorRate: number;
      uptime: number;
    };
  } {
    const last5Minutes = 5 * 60 * 1000;
    const perfStats = this.getPerformanceStats(undefined, last5Minutes);
    const errorStats = this.getErrorStats(last5Minutes);
    
    const avgResponseTime = perfStats.average;
    const errorRate = perfStats.count > 0 ? errorStats.totalErrors / perfStats.count : 0;
    const uptime = process.uptime();

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (avgResponseTime > 2000 || errorRate > 0.1) {
      status = 'degraded';
    }
    
    if (avgResponseTime > 5000 || errorRate > 0.25) {
      status = 'unhealthy';
    }

    return {
      status,
      metrics: {
        avgResponseTime,
        errorRate,
        uptime,
      },
    };
  }

  // Clear old data
  cleanup(): void {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
    this.errors = this.errors.filter(e => e.timestamp > oneHourAgo);
  }
}

// Create singleton instance
const monitor = new PerformanceMonitor();

// Helper functions
export const trackDBQuery = monitor.trackDatabaseQuery.bind(monitor);
export const trackAPIEndpoint = monitor.trackAPIEndpoint.bind(monitor);
export const logError = monitor.logError.bind(monitor);
export const recordMetric = monitor.recordMetric.bind(monitor);

// Export the monitor instance
export default monitor;