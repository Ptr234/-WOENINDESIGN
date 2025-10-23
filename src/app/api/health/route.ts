import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import cache from '@/lib/cache/redis';
import monitor from '@/lib/performance/monitoring';
import { createSecureResponse } from '@/lib/security/headers';

export async function GET(request: NextRequest) {
  const startTime = performance.now();
  
  try {
    // Perform health checks
    const [
      databaseHealth,
      cacheHealth,
      performanceHealth,
    ] = await Promise.allSettled([
      checkDatabase(),
      checkCache(),
      checkPerformance(),
    ]);

    const totalTime = performance.now() - startTime;
    
    // Determine overall health status
    const healthChecks = {
      database: getResultValue(databaseHealth),
      cache: getResultValue(cacheHealth),
      performance: getResultValue(performanceHealth),
    };
    
    const allHealthy = Object.values(healthChecks).every(
      check => check.status === 'healthy'
    );
    
    const overallStatus = allHealthy ? 'healthy' : 'degraded';
    
    // System information
    const systemInfo = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      responseTime: Math.round(totalTime),
    };
    
    const healthData = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime: Math.round(totalTime),
      system: systemInfo,
      checks: healthChecks,
      version: process.env.APP_VERSION || '1.0.0',
    };
    
    // Set appropriate status code
    const statusCode = overallStatus === 'healthy' ? 200 : 503;
    
    return createSecureResponse(healthData, statusCode);
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    const errorData = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: Math.round(performance.now() - startTime),
      error: error instanceof Error ? error.message : 'Unknown error',
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform,
        environment: process.env.NODE_ENV,
      },
    };
    
    return createSecureResponse(errorData, 503);
  }
}

// Database health check
async function checkDatabase(): Promise<HealthCheckResult> {
  try {
    const startTime = performance.now();
    const healthStatus = await DatabaseService.healthCheck();
    const responseTime = performance.now() - startTime;
    
    return {
      status: healthStatus.status,
      responseTime: Math.round(responseTime),
      details: {
        latency: Math.round(healthStatus.latency),
        poolStats: healthStatus.poolStats,
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: 0,
      error: error instanceof Error ? error.message : 'Database check failed',
    };
  }
}

// Cache health check
async function checkCache(): Promise<HealthCheckResult> {
  try {
    const startTime = performance.now();
    
    // Test cache operations
    const testKey = 'health-check-test';
    const testValue = { timestamp: Date.now() };
    
    cache.set(testKey, testValue, 10); // 10 seconds TTL
    const retrieved = cache.get(testKey);
    cache.delete(testKey);
    
    const responseTime = performance.now() - startTime;
    
    const isWorking = retrieved && retrieved.timestamp === testValue.timestamp;
    
    return {
      status: isWorking ? 'healthy' : 'unhealthy',
      responseTime: Math.round(responseTime),
      details: {
        stats: cache.getStats(),
        testPassed: isWorking,
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: 0,
      error: error instanceof Error ? error.message : 'Cache check failed',
    };
  }
}

// Performance health check
async function checkPerformance(): Promise<HealthCheckResult> {
  try {
    const healthStatus = monitor.getHealthStatus();
    
    return {
      status: healthStatus.status,
      responseTime: Math.round(healthStatus.metrics.avgResponseTime),
      details: {
        avgResponseTime: Math.round(healthStatus.metrics.avgResponseTime),
        errorRate: healthStatus.metrics.errorRate,
        uptime: Math.round(healthStatus.metrics.uptime),
        performanceStats: monitor.getPerformanceStats(),
        errorStats: monitor.getErrorStats(5 * 60 * 1000), // Last 5 minutes
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: 0,
      error: error instanceof Error ? error.message : 'Performance check failed',
    };
  }
}

// Health check readiness endpoint (for load balancers)
export async function HEAD(request: NextRequest) {
  try {
    // Quick readiness check - just database connection
    const dbHealth = await DatabaseService.healthCheck();
    
    if (dbHealth.status === 'healthy') {
      return new Response(null, { status: 200 });
    } else {
      return new Response(null, { status: 503 });
    }
  } catch (error) {
    return new Response(null, { status: 503 });
  }
}

// Liveness probe endpoint (for Kubernetes)
export async function OPTIONS(request: NextRequest) {
  // Simple liveness check - just return 200 if process is running
  return new Response(null, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}

// Helper types and functions
interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  details?: any;
  error?: string;
}

function getResultValue(result: PromiseSettledResult<HealthCheckResult>): HealthCheckResult {
  if (result.status === 'fulfilled') {
    return result.value;
  } else {
    return {
      status: 'unhealthy',
      responseTime: 0,
      error: result.reason instanceof Error ? result.reason.message : 'Check failed',
    };
  }
}

// Metrics endpoint for monitoring systems
export async function POST(request: NextRequest) {
  try {
    const { timeRange } = await request.json();
    const timeRangeMs = timeRange ? parseInt(timeRange) * 1000 : 5 * 60 * 1000; // Default 5 minutes
    
    const metrics = {
      performance: monitor.getPerformanceStats(undefined, timeRangeMs),
      errors: monitor.getErrorStats(timeRangeMs),
      database: DatabaseService.getQueryStats(),
      cache: cache.getStats(),
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
      },
    };
    
    return createSecureResponse(metrics);
    
  } catch (error) {
    return createSecureResponse({
      error: error instanceof Error ? error.message : 'Failed to get metrics'
    }, 500);
  }
}