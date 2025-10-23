import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import { AuthService } from '@/lib/auth';
import { APIResponse, Conversation } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const user = await AuthService.authenticateRequest(request);
    if (!user) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const conversations = await DatabaseService.query(`
      SELECT DISTINCT
        c.*,
        m.content as last_message,
        m.created_at as last_message_at,
        COUNT(CASE WHEN m2.read_at IS NULL AND m2.sender_id != $1 THEN 1 END) as unread_count
      FROM conversations c
      LEFT JOIN conversation_participants cp ON c.id = cp.conversation_id
      LEFT JOIN messages m ON c.id = m.conversation_id 
        AND m.created_at = (
          SELECT MAX(created_at) 
          FROM messages 
          WHERE conversation_id = c.id
        )
      LEFT JOIN messages m2 ON c.id = m2.conversation_id 
        AND m2.sender_id != $1 
        AND m2.read_at IS NULL
      WHERE cp.user_id = $1
      GROUP BY c.id, c.subject, c.created_at, c.updated_at, m.content, m.created_at
      ORDER BY COALESCE(m.created_at, c.created_at) DESC
    `, [user.id]);

    // Get participants for each conversation
    const conversationsWithParticipants = await Promise.all(
      conversations.map(async (conv: Conversation) => {
        const participants = await DatabaseService.query(`
          SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.avatar
          FROM users u
          JOIN conversation_participants cp ON u.id = cp.user_id
          WHERE cp.conversation_id = $1
        `, [conv.id]);

        return {
          ...conv,
          participants
        };
      })
    );

    return NextResponse.json<APIResponse<Conversation[]>>({
      success: true,
      data: conversationsWithParticipants
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json<APIResponse>({
      success: false,
      error: 'Failed to fetch conversations'
    }, { status: 500 });
  }
}

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
    const { participants, subject } = body;

    if (!participants || !Array.isArray(participants) || participants.length < 2) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: 'At least 2 participants required'
      }, { status: 400 });
    }

    // Check if conversation already exists between these participants
    const existingConversation = await DatabaseService.query(`
      SELECT c.id
      FROM conversations c
      JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
      JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
      WHERE cp1.user_id = $1 AND cp2.user_id = $2
      GROUP BY c.id
      HAVING COUNT(DISTINCT cp1.user_id) = 2
      ORDER BY c.created_at DESC
      LIMIT 1
    `, [participants[0], participants[1]]);

    if (existingConversation.length > 0) {
      // Return existing conversation
      const conversation = await DatabaseService.query(`
        SELECT c.*, 
               COALESCE(m.content, '') as last_message,
               m.created_at as last_message_at
        FROM conversations c
        LEFT JOIN messages m ON c.id = m.conversation_id 
          AND m.created_at = (
            SELECT MAX(created_at) 
            FROM messages 
            WHERE conversation_id = c.id
          )
        WHERE c.id = $1
      `, [existingConversation[0].id]);

      // Get participants
      const conversationParticipants = await DatabaseService.query(`
        SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.avatar
        FROM users u
        JOIN conversation_participants cp ON u.id = cp.user_id
        WHERE cp.conversation_id = $1
      `, [existingConversation[0].id]);

      return NextResponse.json<APIResponse<Conversation>>({
        success: true,
        data: {
          ...conversation[0],
          participants: conversationParticipants
        }
      });
    }

    // Create new conversation
    const conversationResult = await DatabaseService.query(`
      INSERT INTO conversations (subject)
      VALUES ($1)
      RETURNING *
    `, [subject || null]);

    const conversation = conversationResult[0];

    // Add participants
    for (const participantId of participants) {
      await DatabaseService.query(`
        INSERT INTO conversation_participants (conversation_id, user_id)
        VALUES ($1, $2)
      `, [conversation.id, participantId]);
    }

    // Get full conversation with participants
    const conversationParticipants = await DatabaseService.query(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.avatar
      FROM users u
      JOIN conversation_participants cp ON u.id = cp.user_id
      WHERE cp.conversation_id = $1
    `, [conversation.id]);

    return NextResponse.json<APIResponse<Conversation>>({
      success: true,
      data: {
        ...conversation,
        participants: conversationParticipants,
        last_message: '',
        last_message_at: null,
        unread_count: 0
      }
    });

  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json<APIResponse>({
      success: false,
      error: 'Failed to create conversation'
    }, { status: 500 });
  }
}