import { NextRequest, NextResponse } from 'next/server';
import AuthService from '@/lib/auth';
import { query } from '@/lib/database/connection';
import { APIResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const user = await AuthService.authenticateRequest(request);
    
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        } as APIResponse,
        { status: 401 }
      );
    }

    // Get recent activity for the user
    const activities = [];

    // Recent messages from conversations
    const messagesQuery = `
      SELECT 
        'message' as type,
        CONCAT('New message from ', u.first_name, ' ', u.last_name) as title,
        LEFT(m.content, 100) as description,
        m.created_at as timestamp,
        CASE WHEN m.read_at IS NULL THEN 'unread' ELSE 'read' END as status
      FROM messages m
      JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
      JOIN users u ON u.id = m.sender_id
      WHERE cp.user_id = $1 
        AND m.sender_id != $1
        AND m.created_at > NOW() - INTERVAL '30 days'
      ORDER BY m.created_at DESC
      LIMIT 5
    `;

    const messagesResult = await query(messagesQuery, [user.id]);
    activities.push(...messagesResult.rows.map(row => ({
      id: `msg-${row.timestamp}`,
      type: row.type,
      title: row.title,
      description: row.description,
      timestamp: row.timestamp,
      status: row.status,
    })));

    if (user.role === 'designer') {
      // Recent hiring requests
      const projectsQuery = `
        SELECT 
          'project' as type,
          CONCAT('New project: ', hr.project_title) as title,
          CONCAT('Budget: UGX ', hr.budget) as description,
          hr.created_at as timestamp,
          hr.status
        FROM hiring_requests hr
        WHERE hr.designer_id = $1 
          AND hr.created_at > NOW() - INTERVAL '30 days'
        ORDER BY hr.created_at DESC
        LIMIT 5
      `;

      const projectsResult = await query(projectsQuery, [user.id]);
      activities.push(...projectsResult.rows.map(row => ({
        id: `proj-${row.timestamp}`,
        type: row.type,
        title: row.title,
        description: row.description,
        timestamp: row.timestamp,
        status: row.status,
      })));

      // Recent reviews
      const reviewsQuery = `
        SELECT 
          'review' as type,
          CONCAT('New review from ', u.first_name, ' ', u.last_name) as title,
          CONCAT(r.rating, ' stars - ', LEFT(r.comment, 80)) as description,
          r.created_at as timestamp,
          'new' as status
        FROM reviews r
        JOIN users u ON u.id = r.client_id
        WHERE r.designer_id = $1 
          AND r.created_at > NOW() - INTERVAL '30 days'
        ORDER BY r.created_at DESC
        LIMIT 3
      `;

      const reviewsResult = await query(reviewsQuery, [user.id]);
      activities.push(...reviewsResult.rows.map(row => ({
        id: `rev-${row.timestamp}`,
        type: row.type,
        title: row.title,
        description: row.description,
        timestamp: row.timestamp,
        status: row.status,
      })));
    }

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Return top 10 most recent activities
    const recentActivity = activities.slice(0, 10);

    return NextResponse.json(
      {
        success: true,
        data: recentActivity,
      } as APIResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Dashboard activity error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as APIResponse,
      { status: 500 }
    );
  }
}