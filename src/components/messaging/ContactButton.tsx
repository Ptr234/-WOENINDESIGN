'use client';

import React, { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';

interface ContactButtonProps {
  targetUserId: string;
  targetUserName: string;
  targetUserRole: string;
  currentUser?: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  } | null;
  onMessageSent?: () => void;
}

export default function ContactButton({ 
  targetUserId, 
  targetUserName, 
  targetUserRole,
  currentUser,
  onMessageSent 
}: ContactButtonProps) {
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleContactClick = () => {
    if (!currentUser) {
      // Redirect to login if not authenticated
      window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }
    setShowMessageForm(true);
  };

  const sendMessage = async () => {
    if (!message.trim() || !currentUser) return;

    try {
      setSending(true);

      // First create/get conversation
      const conversationResponse = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participants: [currentUser.id, targetUserId],
        }),
      });

      const conversationData = await conversationResponse.json();
      if (!conversationData.success) {
        throw new Error('Failed to create conversation');
      }

      // Send message
      const messageResponse = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: conversationData.data.id,
          content: message.trim(),
        }),
      });

      const messageData = await messageResponse.json();
      if (!messageData.success) {
        throw new Error('Failed to send message');
      }

      setMessage('');
      setShowMessageForm(false);
      onMessageSent?.();

      // Show success message
      alert(`Message sent to ${targetUserName} successfully!`);
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (showMessageForm) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          width: '100%',
          maxWidth: '500px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{
              margin: '0 0 0.5rem 0',
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#111827'
            }}>
              Send Message to {targetUserName}
            </h3>
            <p style={{
              margin: 0,
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              {targetUserRole.charAt(0).toUpperCase() + targetUserRole.slice(1)}
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Your message:
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Hi ${targetUserName.split(' ')[0]}, I'm interested in your services...`}
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                outline: 'none',
                fontSize: '0.875rem',
                resize: 'vertical',
                minHeight: '100px'
              }}
              onFocus={(e) => e.target.style.borderColor = '#90ee90'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <div style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={() => setShowMessageForm(false)}
              disabled={sending}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                backgroundColor: 'white',
                color: '#374151',
                cursor: sending ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              Cancel
            </button>
            <button
              onClick={sendMessage}
              disabled={!message.trim() || sending}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: message.trim() && !sending ? '#90ee90' : '#d1d5db',
                color: 'white',
                cursor: message.trim() && !sending ? 'pointer' : 'not-allowed',
                fontSize: '0.875rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              <Send size={16} />
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleContactClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.5rem',
        backgroundColor: '#90ee90',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: '600',
        transition: 'all 0.2s',
        boxShadow: '0 4px 15px rgba(144, 238, 144, 0.3)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#7bcf7b';
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(144, 238, 144, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#90ee90';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(144, 238, 144, 0.3)';
      }}
    >
      <MessageCircle size={16} />
      Contact {targetUserRole.charAt(0).toUpperCase() + targetUserRole.slice(1)}
    </button>
  );
}