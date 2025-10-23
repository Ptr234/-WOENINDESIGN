'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, X, Users, Search, ArrowLeft } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  sender_first_name: string;
  sender_last_name: string;
  sender_avatar?: string;
}

interface Conversation {
  id: string;
  subject?: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  participants: Array<{
    id: string;
    first_name: string;
    last_name: string;
    role: string;
    avatar?: string;
  }>;
}

interface MessagingCenterProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function MessagingCenter({ user, isOpen, onClose }: MessagingCenterProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations');
      const data = await response.json();
      if (data.success) {
        setConversations(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/messages/${conversationId}`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
        setSelectedConversation(conversationId);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: selectedConversation,
          content: newMessage.trim(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, data.data]);
        setNewMessage('');
        fetchConversations(); // Refresh conversations to update last message
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const createConversation = async (participantId: string) => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participants: [user.id, participantId],
        }),
      });

      const data = await response.json();
      if (data.success) {
        setConversations(prev => [data.data, ...prev]);
        fetchMessages(data.data.id);
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.id !== user.id);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = getOtherParticipant(conv);
    const fullName = `${otherParticipant?.first_name} ${otherParticipant?.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  if (!isOpen) return null;

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
        width: '100%',
        maxWidth: '900px',
        height: '600px',
        display: 'flex',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Conversations List */}
        <div style={{
          width: '35%',
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f9fafb'
        }}>
          {/* Header */}
          <div style={{
            padding: '1rem',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: 'linear-gradient(135deg, #556b2f, #2d4016)',
            color: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageCircle size={20} />
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Messages</h3>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Search */}
          <div style={{ padding: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6b7280'
              }} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.5rem 0.5rem 2.25rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  outline: 'none',
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>

          {/* Conversations */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {filteredConversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation);
              return (
                <div
                  key={conversation.id}
                  onClick={() => fetchMessages(conversation.id)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    backgroundColor: selectedConversation === conversation.id ? '#e0f2fe' : 'transparent',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedConversation !== conversation.id) {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedConversation !== conversation.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#90ee90',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.875rem'
                    }}>
                      {otherParticipant?.first_name?.[0]}{otherParticipant?.last_name?.[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h4 style={{
                          margin: 0,
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#111827'
                        }}>
                          {otherParticipant?.first_name} {otherParticipant?.last_name}
                        </h4>
                        {conversation.unread_count > 0 && (
                          <span style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }}>
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                      <p style={{
                        margin: '0.25rem 0 0 0',
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {conversation.last_message || 'No messages yet'}
                      </p>
                      <p style={{
                        margin: '0.125rem 0 0 0',
                        fontSize: '0.625rem',
                        color: '#9ca3af'
                      }}>
                        {otherParticipant?.role}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Messages Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div style={{
                padding: '1rem',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    onClick={() => setSelectedConversation(null)}
                    style={{
                      display: 'none', // Show on mobile
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem'
                    }}
                  >
                    <ArrowLeft size={20} />
                  </button>
                  {(() => {
                    const conversation = conversations.find(c => c.id === selectedConversation);
                    const otherParticipant = conversation ? getOtherParticipant(conversation) : null;
                    return (
                      <>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: '#90ee90',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold'
                        }}>
                          {otherParticipant?.first_name?.[0]}{otherParticipant?.last_name?.[0]}
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                            {otherParticipant?.first_name} {otherParticipant?.last_name}
                          </h4>
                          <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                            {otherParticipant?.role}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Messages */}
              <div style={{
                flex: 1,
                padding: '1rem',
                overflow: 'auto',
                backgroundColor: '#ffffff'
              }}>
                {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                    <div>Loading messages...</div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => {
                      const isOwn = message.sender_id === user.id;
                      return (
                        <div
                          key={message.id}
                          style={{
                            display: 'flex',
                            justifyContent: isOwn ? 'flex-end' : 'flex-start',
                            marginBottom: '1rem'
                          }}
                        >
                          <div style={{
                            maxWidth: '70%',
                            backgroundColor: isOwn ? '#90ee90' : '#f3f4f6',
                            color: isOwn ? 'white' : '#111827',
                            padding: '0.75rem 1rem',
                            borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            wordWrap: 'break-word'
                          }}>
                            <p style={{ margin: 0, fontSize: '0.875rem' }}>
                              {message.content}
                            </p>
                            <p style={{
                              margin: '0.25rem 0 0 0',
                              fontSize: '0.75rem',
                              opacity: 0.7
                            }}>
                              {formatTime(message.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <div style={{
                padding: '1rem',
                borderTop: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb'
              }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '24px',
                      outline: 'none',
                      fontSize: '0.875rem'
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    style={{
                      backgroundColor: newMessage.trim() ? '#90ee90' : '#d1d5db',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '44px',
                      height: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280'
            }}>
              <div style={{ textAlign: 'center' }}>
                <MessageCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}