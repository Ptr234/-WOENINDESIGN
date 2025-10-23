import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import { AuthService } from '@/lib/auth';
import { APIResponse } from '@/types';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
): Promise<NextResponse> {
  const params = await context.params;
  try {
    const user = await AuthService.authenticateRequest(request);
    if (!user) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const { userId } = params;
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';

    // Users can only view their own analytics, admins can view any user's analytics
    if (user.id !== userId && user.role !== 'admin') {
      return NextResponse.json<APIResponse>({
        success: false,
        error: 'Access denied'
      }, { status: 403 });
    }

    // Calculate date range
    const now = new Date();
    const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
    const weekStartDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    const lastWeekStartDate = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));

    // Get profile views
    const profileViews = await getProfileViews(userId, startDate, weekStartDate, lastWeekStartDate);
    
    // Get message statistics
    const messageStats = await getMessageStats(userId, startDate);
    
    // Get search appearances (mock data for now)
    const searchAppearances = await getSearchAppearances(userId);
    
    // Get engagement metrics (mock data)
    const engagement = await getEngagementMetrics(userId);
    
    // Get performance metrics
    const performance = await getPerformanceMetrics(userId);
    
    // Get earnings (for designers/suppliers)
    const targetUser = await DatabaseService.query(`
      SELECT role FROM users WHERE id = $1
    `, [userId]);

    let earnings = null;
    if (targetUser[0] && ['designer', 'supplier'].includes(targetUser[0].role)) {
      earnings = await getEarnings(userId, startDate);
    }

    const analyticsData = {
      profileViews,
      messageStats,
      searchAppearances,
      engagement,
      performance,
      earnings
    };

    return NextResponse.json<APIResponse>({
      success: true,
      data: analyticsData
    });

  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return NextResponse.json<APIResponse>({
      success: false,
      error: 'Failed to fetch user analytics'
    }, { status: 500 });
  }
}

async function getProfileViews(userId: string, startDate: Date, weekStartDate: Date, lastWeekStartDate: Date) {
  // Create profile_views table if it doesn't exist (for analytics tracking)
  await DatabaseService.query(`
    CREATE TABLE IF NOT EXISTS profile_views (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      profile_user_id UUID NOT NULL REFERENCES users(id),
      viewer_user_id UUID REFERENCES users(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_profile_views_profile_user_id ON profile_views(profile_user_id);
    CREATE INDEX IF NOT EXISTS idx_profile_views_created_at ON profile_views(created_at);
  `);

  const totalViews = await DatabaseService.query(`
    SELECT COUNT(*) as total FROM profile_views 
    WHERE profile_user_id = $1 AND created_at >= $2
  `, [userId, startDate]);

  const thisWeekViews = await DatabaseService.query(`
    SELECT COUNT(*) as count FROM profile_views 
    WHERE profile_user_id = $1 AND created_at >= $2
  `, [userId, weekStartDate]);

  const lastWeekViews = await DatabaseService.query(`
    SELECT COUNT(*) as count FROM profile_views 
    WHERE profile_user_id = $1 AND created_at >= $2 AND created_at < $3
  `, [userId, lastWeekStartDate, weekStartDate]);

  // Daily views for the chart
  const dailyViews = await DatabaseService.query(`
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as views
    FROM profile_views 
    WHERE profile_user_id = $1 AND created_at >= $2
    GROUP BY DATE(created_at)
    ORDER BY date
  `, [userId, startDate]);

  // Fill in missing dates
  const result = [];
  const days = Math.floor((new Date().getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  
  for (let i = 0; i <= days; i++) {
    const date = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
    const dateStr = date.toISOString().split('T')[0];
    
    const existing = dailyViews.find(v => v.date === dateStr);
    result.push({
      date: dateStr,
      views: existing ? parseInt(existing.views) : 0
    });
  }

  return {
    total: parseInt(totalViews[0].total),
    thisWeek: parseInt(thisWeekViews[0].count),
    lastWeek: parseInt(lastWeekViews[0].count),
    dailyViews: result
  };
}

async function getMessageStats(userId: string, startDate: Date) {
  const sent = await DatabaseService.query(`
    SELECT COUNT(*) as count FROM messages 
    WHERE sender_id = $1 AND created_at >= $2
  `, [userId, startDate]);

  const received = await DatabaseService.query(`
    SELECT COUNT(*) as count FROM messages m
    JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
    WHERE cp.user_id = $1 AND m.sender_id != $1 AND m.created_at >= $2
  `, [userId, startDate]);

  const conversations = await DatabaseService.query(`
    SELECT COUNT(DISTINCT conversation_id) as count FROM conversation_participants 
    WHERE user_id = $1
  `, [userId]);

  return {
    sent: parseInt(sent[0].count),
    received: parseInt(received[0].count),
    conversations: parseInt(conversations[0].count)
  };
}

async function getSearchAppearances(userId: string) {
  // Mock search appearances data - in a real app, you'd track when users appear in search results
  const appearances = [
    { category: 'Interior Design', count: Math.floor(Math.random() * 50) + 20 },
    { category: 'Architecture', count: Math.floor(Math.random() * 30) + 10 },
    { category: 'Graphic Design', count: Math.floor(Math.random() * 25) + 5 },
    { category: 'Product Design', count: Math.floor(Math.random() * 20) + 3 }
  ];

  const total = appearances.reduce((sum, app) => sum + app.count, 0);

  return {
    total,
    byCategory: appearances
  };
}

async function getEngagementMetrics(userId: string) {
  // Mock engagement data - in a real app, you'd track likes, shares, bookmarks
  return {
    likes: Math.floor(Math.random() * 100) + 20,
    shares: Math.floor(Math.random() * 50) + 5,
    bookmarks: Math.floor(Math.random() * 75) + 10
  };
}

async function getPerformanceMetrics(userId: string) {
  // Mock performance data - in a real app, you'd calculate these from actual data
  const responseRate = Math.random() * 30 + 70; // 70-100%
  const averageResponseTime = Math.floor(Math.random() * 120) + 30; // 30-150 minutes
  const completionRate = Math.random() * 20 + 80; // 80-100%

  return {
    responseRate,
    averageResponseTime,
    completionRate
  };
}

async function getEarnings(userId: string, startDate: Date) {
  // Mock earnings data - in a real app, you'd get this from payments/hiring_requests
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const lastMonth = new Date(thisMonth);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const projects = [
    { name: 'Modern Living Room Design', amount: 2500, date: new Date().toISOString() },
    { name: 'Kitchen Renovation Project', amount: 1800, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
    { name: 'Office Space Planning', amount: 3200, date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
    { name: 'Bedroom Makeover', amount: 1200, date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString() }
  ];

  const total = projects.reduce((sum, p) => sum + p.amount, 0) + Math.floor(Math.random() * 5000);
  const thisMonthEarnings = projects.slice(0, 2).reduce((sum, p) => sum + p.amount, 0);
  const lastMonthEarnings = Math.floor(Math.random() * 3000) + 1000;

  return {
    total,
    thisMonth: thisMonthEarnings,
    lastMonth: lastMonthEarnings,
    byProject: projects
  };
}