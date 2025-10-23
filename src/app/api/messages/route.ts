import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import { AuthService } from '@/lib/auth';
import { APIResponse, Message } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.authenticateRequest(request);
    if (!user) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId, content, type = 'text' } = body;

    if (!conversationId || !content) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: 'Conversation ID and content are required'
      }, { status: 400 });
    }

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

    // Create message
    const messageResult = await DatabaseService.query(`
      INSERT INTO messages (conversation_id, sender_id, content, type)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [conversationId, user.id, content, type]);

    const message = messageResult[0];

    // Update conversation last activity
    await DatabaseService.query(`
      UPDATE conversations 
      SET updated_at = NOW()
      WHERE id = $1
    `, [conversationId]);

    // Log message notification (email functionality removed)
    try {
      const otherParticipants = await DatabaseService.query(`
        SELECT 
          u.email, 
          u.first_name as firstName,
          u.last_name as lastName
        FROM conversation_participants cp
        JOIN users u ON cp.user_id = u.id
        WHERE cp.conversation_id = $1 AND cp.user_id != $2
      `, [conversationId, user.id]);

      const senderName = `${user.firstName} ${user.lastName}`;
      const messagePreview = content.length > 100 ? content.substring(0, 100) : content;

      for (const participant of otherParticipants) {
        console.log(`Message notification would be sent to: ${participant.email} from ${senderName}`);
      }
    } catch (error) {
      console.error('Failed to process message notification:', error);
    }

    return NextResponse.json<APIResponse<Message>>({
      success: true,
      data: message
    });

  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json<APIResponse>({
      success: false,
      error: 'Failed to send message'
    }, { status: 500 });
  }
}