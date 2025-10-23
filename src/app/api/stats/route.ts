import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/connection';
import { APIResponse, PlatformStats } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Get platform statistics
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'designer' AND is_active = true) as total_designers,
        (SELECT COUNT(*) FROM users WHERE role = 'supplier' AND is_active = true) as total_suppliers,
        (SELECT COUNT(*) FROM users WHERE role = 'client' AND is_active = true) as total_clients,
        (SELECT COUNT(*) FROM hiring_requests WHERE status IN ('completed', 'in_progress')) as total_projects,
        (SELECT COUNT(*) FROM users WHERE is_active = true AND updated_at > NOW() - INTERVAL '30 days') as active_users
    `;

    const result = await query(statsQuery);
    const stats = result.rows[0];

    const platformStats: PlatformStats = {
      totalDesigners: parseInt(stats.total_designers) || 0,
      totalSuppliers: parseInt(stats.total_suppliers) || 0,
      totalClients: parseInt(stats.total_clients) || 0,
      totalProjects: parseInt(stats.total_projects) || 0,
      activeUsers: parseInt(stats.active_users) || 0,
    };

    return NextResponse.json(
      {
        success: true,
        data: platformStats,
      } as APIResponse<PlatformStats>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as APIResponse,
      { status: 500 }
    );
  }
}