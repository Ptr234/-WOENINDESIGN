import { Pool, PoolClient } from 'pg';
import { db, query as baseQuery, transaction as baseTransaction } from './connection';
import cache, { withCache, CacheTTL, CacheTags } from '../cache/redis';
import monitor, { trackDBQuery } from '../performance/monitoring';
import { validateUUID, sanitizeSearchQuery } from '../security/validation';

export interface QueryOptions {
  cache?: {
    key: string;
    ttl?: number;
    tags?: string[];
  };
  monitoring?: {
    name: string;
    metadata?: Record<string, unknown>;
  };
  timeout?: number;
}

export interface TransactionOptions {
  isolation?: 'READ_COMMITTED' | 'SERIALIZABLE' | 'REPEATABLE_READ';
  timeout?: number;
}

class EnhancedDatabaseService {
  private static instance: EnhancedDatabaseService;
  private queryStats: Map<string, { count: number; totalTime: number }> = new Map();

  private constructor() {}

  public static getInstance(): EnhancedDatabaseService {
    if (!EnhancedDatabaseService.instance) {
      EnhancedDatabaseService.instance = new EnhancedDatabaseService();
    }
    return EnhancedDatabaseService.instance;
  }

  // Enhanced query with caching and monitoring
  public async query(
    text: string,
    params?: unknown[],
    options?: QueryOptions
  ): Promise<unknown> {
    const startTime = performance.now();
    const queryName = options?.monitoring?.name || this.extractQueryName(text);

    try {
      // Validate parameters
      this.validateParams(params);

      // Check cache first if enabled
      if (options?.cache) {
        const cached = cache.get(options.cache.key);
        if (cached !== null) {
          this.recordQueryStats(queryName, performance.now() - startTime, true);
          return cached;
        }
      }

      // Execute query with monitoring
      const result = await trackDBQuery(
        queryName,
        () => this.executeQuery(text, params, options?.timeout),
        options?.monitoring?.metadata
      );

      // Cache result if enabled
      if (options?.cache && result) {
        cache.set(
          options.cache.key,
          result,
          options.cache.ttl || CacheTTL.MEDIUM,
          options.cache.tags
        );
      }

      this.recordQueryStats(queryName, performance.now() - startTime, false);
      return result;

    } catch (error) {
      monitor.logError(
        error as Error,
        `Database query: ${queryName}`,
        undefined,
        {
          query: this.sanitizeQueryForLogging(text),
          params: params?.length || 0,
          ...options?.monitoring?.metadata,
        }
      );
      throw error;
    }
  }

  // Enhanced transaction with monitoring
  public async transaction<T>(
    callback: (client: PoolClient) => Promise<T>,
    options?: TransactionOptions
  ): Promise<T> {
    const startTime = performance.now();

    try {
      return await trackDBQuery(
        'transaction',
        () => this.executeTransaction(callback, options),
        { isolation: options?.isolation }
      );
    } catch (error) {
      monitor.logError(
        error as Error,
        'Database transaction',
        undefined,
        { isolation: options?.isolation }
      );
      throw error;
    }
  }

  // Prepared statement execution with caching
  public async executeStatement(
    name: string,
    text: string,
    params: unknown[],
    cacheOptions?: { key: string; ttl?: number; tags?: string[] }
  ): Promise<unknown> {
    return this.query(text, params, {
      cache: cacheOptions,
      monitoring: { name: `prepared_${name}` },
    });
  }

  // Bulk insert with optimizations
  public async bulkInsert(
    tableName: string,
    columns: string[],
    data: unknown[][],
    options?: { batchSize?: number; onConflict?: string }
  ): Promise<void> {
    const batchSize = options?.batchSize || 1000;
    const onConflict = options?.onConflict || '';
    
    if (!this.isValidTableName(tableName)) {
      throw new Error('Invalid table name');
    }

    const columnList = columns.map(col => this.sanitizeColumnName(col)).join(', ');
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const valuesList = batch.map((row, rowIndex) => {
        const paramNumbers = row.map((_, colIndex) => 
          `$${i * columns.length + rowIndex * columns.length + colIndex + 1}`
        );
        return `(${paramNumbers.join(', ')})`;
      }).join(', ');

      const sql = `
        INSERT INTO ${tableName} (${columnList})
        VALUES ${valuesList}
        ${onConflict}
      `;

      const flatParams = batch.flat();

      await this.query(sql, flatParams, {
        monitoring: {
          name: `bulk_insert_${tableName}`,
          metadata: { batchSize: batch.length },
        },
      });
    }
  }

  // Search with caching and optimization
  public async search(
    query: string,
    filters: Record<string, any>,
    options: {
      table: string;
      columns: string[];
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    }
  ): Promise<{ items: unknown[]; total: number; page: number; totalPages: number }> {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100); // Max 100 items per page
    const offset = (page - 1) * limit;
    const sortBy = this.sanitizeColumnName(options.sortBy || 'created_at');
    const sortOrder = options.sortOrder || 'DESC';

    if (!this.isValidTableName(options.table)) {
      throw new Error('Invalid table name');
    }

    // Build search conditions
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (query.trim()) {
      const sanitizedQuery = sanitizeSearchQuery(query);
      const searchColumns = options.columns.map(col => 
        `${this.sanitizeColumnName(col)} ILIKE $${paramIndex}`
      ).join(' OR ');
      conditions.push(`(${searchColumns})`);
      params.push(`%${sanitizedQuery}%`);
      paramIndex++;
    }

    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        const columnName = this.sanitizeColumnName(key);
        if (Array.isArray(value)) {
          const placeholders = value.map(() => `$${paramIndex++}`).join(', ');
          conditions.push(`${columnName} = ANY(ARRAY[${placeholders}])`);
          params.push(...value);
        } else {
          conditions.push(`${columnName} = $${paramIndex++}`);
          params.push(value);
        }
      }
    });

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Get total count
    const countQuery = `SELECT COUNT(*) FROM ${options.table} ${whereClause}`;
    const countResult = await this.query(countQuery, params, {
      cache: {
        key: `search_count:${options.table}:${JSON.stringify({ query, filters })}`,
        ttl: CacheTTL.SHORT,
        tags: [CacheTags.SEARCH],
      },
      monitoring: { name: `search_count_${options.table}` },
    });

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    // Get items
    const itemsQuery = `
      SELECT * FROM ${options.table} 
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const itemsResult = await this.query(
      itemsQuery,
      [...params, limit, offset],
      {
        cache: {
          key: `search_items:${options.table}:${JSON.stringify({ query, filters, page, limit, sortBy, sortOrder })}`,
          ttl: CacheTTL.SHORT,
          tags: [CacheTags.SEARCH],
        },
        monitoring: { name: `search_items_${options.table}` },
      }
    );

    return {
      items: itemsResult.rows,
      total,
      page,
      totalPages,
    };
  }

  // Get user with caching
  public async getUser(id: string): Promise<any> {
    if (!validateUUID(id)) {
      throw new Error('Invalid user ID');
    }

    return this.query(
      'SELECT * FROM users WHERE id = $1',
      [id],
      {
        cache: {
          key: `user:${id}`,
          ttl: CacheTTL.MEDIUM,
          tags: [CacheTags.USER],
        },
        monitoring: { name: 'get_user' },
      }
    );
  }

  // Get query statistics
  public getQueryStats(): Record<string, { count: number; avgTime: number }> {
    const stats: Record<string, { count: number; avgTime: number }> = {};
    
    for (const [query, data] of this.queryStats.entries()) {
      stats[query] = {
        count: data.count,
        avgTime: data.totalTime / data.count,
      };
    }
    
    return stats;
  }

  // Clear query statistics
  public clearQueryStats(): void {
    this.queryStats.clear();
  }

  // Health check
  public async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    latency: number;
    poolStats: unknown;
  }> {
    const startTime = performance.now();
    
    try {
      await baseQuery('SELECT 1');
      const latency = performance.now() - startTime;
      
      return {
        status: latency < 100 ? 'healthy' : 'unhealthy',
        latency,
        poolStats: {
          totalCount: db.getPool().totalCount,
          idleCount: db.getPool().idleCount,
          waitingCount: db.getPool().waitingCount,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: performance.now() - startTime,
        poolStats: null,
      };
    }
  }

  // Private helper methods
  private async executeQuery(text: string, params?: unknown[], timeout?: number): Promise<unknown> {
    if (timeout) {
      return Promise.race([
        baseQuery(text, params),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), timeout)
        ),
      ]);
    }
    return baseQuery(text, params);
  }

  private async executeTransaction<T>(
    callback: (client: PoolClient) => Promise<T>,
    options?: TransactionOptions
  ): Promise<T> {
    return baseTransaction(async (client) => {
      if (options?.isolation) {
        await client.query(`SET TRANSACTION ISOLATION LEVEL ${options.isolation}`);
      }
      return callback(client);
    });
  }

  private validateParams(params?: unknown[]): void {
    if (!params) return;
    
    for (const param of params) {
      if (typeof param === 'string' && param.length > 10000) {
        throw new Error('Parameter too long');
      }
    }
  }

  private extractQueryName(text: string): string {
    const trimmed = text.trim().toLowerCase();
    const match = trimmed.match(/^(select|insert|update|delete|with)/);
    return match ? match[1] : 'unknown';
  }

  private sanitizeQueryForLogging(text: string): string {
    return text.substring(0, 200).replace(/\$\d+/g, '?');
  }

  private isValidTableName(name: string): boolean {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
  }

  private sanitizeColumnName(name: string): string {
    if (!name || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
      throw new Error(`Invalid column name: ${name}`);
    }
    return name;
  }

  private recordQueryStats(queryName: string, time: number, cached: boolean): void {
    if (!cached) {
      const existing = this.queryStats.get(queryName) || { count: 0, totalTime: 0 };
      this.queryStats.set(queryName, {
        count: existing.count + 1,
        totalTime: existing.totalTime + time,
      });
    }
  }
}

// Export singleton instance
export const DatabaseService = EnhancedDatabaseService.getInstance();

// Export convenience functions
export const query = DatabaseService.query.bind(DatabaseService);
export const transaction = DatabaseService.transaction.bind(DatabaseService);
export const search = DatabaseService.search.bind(DatabaseService);
export const getUser = DatabaseService.getUser.bind(DatabaseService);
export const bulkInsert = DatabaseService.bulkInsert.bind(DatabaseService);

// Export for backward compatibility
export { db } from './connection';