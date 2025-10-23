import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import { AuthService } from '@/lib/auth';
import { APIResponse, Message } from '@/types';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ conversationId: string }> }
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

    const { conversationId } = params;

    // Verify user is participant in conversation
    const participantCheck = await DatabaseService.query(`
      SELECT 1 FROM conversation_participants 
      WHERE conversation_id = $1 AND user_id = $2
    `, [conversationId, user.id]);

    if (participantCheck.length === 0) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: 'User is not a participant in this conversation'
      }, { status: 403 });
    }

    // Get messages for the conversation
    const messages = await DatabaseService.query(`
      SELECT 
        m.*,
        u.first_name as sender_first_name,
        u.last_name as sender_last_name,
        u.avatar as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC
    `, [conversationId]);

    // Mark messages as read for current user
    await DatabaseService.query(`
      UPDATE messages 
      SET read_at = NOW()
      WHERE conversation_id = $1 
        AND sender_id != $2 
        AND read_at IS NULL
    `, [conversationId, user.id]);

    // Update participant's last read timestamp
    await DatabaseService.query(`
      UPDATE conversation_participants
      SET last_read_at = NOW()
      WHERE conversation_id = $1 AND user_id = $2
    `, [conversationId, user.id]);

    return NextResponse.json<APIResponse<Message[]>>({
      success: true,
      data: messages
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json<APIResponse>({
      success: false,
      error: 'Failed to fetch messages'
    }, { status: 500 });
  }
}