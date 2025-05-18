'use client';

import { useState, useEffect, useRef } from 'react';
import { messageStore, type Message } from '../utils/messageStore';

interface ChatBoxProps {
  currentUserId: string;
  currentUserName: string;
  currentUserRole: 'patient' | 'doctor' | 'caregiver';
  recipients: Array<{
    id: string;
    name: string;
    role: 'patient' | 'doctor' | 'caregiver';
  }>;
}

export default function ChatBox({
  currentUserId,
  currentUserName,
  currentUserRole,
  recipients
}: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState(recipients[0]);
  const [unreadCount, setUnreadCount] = useState<Record<string, number>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Subscribe to message updates
    const unsubscribe = messageStore.subscribe((allMessages) => {
      const conversationMessages = messageStore.getMessages(currentUserId, selectedRecipient.id);
      setMessages(conversationMessages);
      setUnreadCount(messageStore.getUnreadCount(currentUserId));
      // Scroll to bottom when new messages arrive
      setTimeout(scrollToBottom, 100);
    });

    // Mark messages as read when conversation is opened
    messageStore.markAsRead(currentUserId, selectedRecipient.id);

    return () => {
      unsubscribe();
    };
  }, [currentUserId, selectedRecipient.id]);

  // Scroll to bottom on initial load
  useEffect(() => {
    scrollToBottom();
  }, []);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: currentUserRole,
      recipientId: selectedRecipient.id,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isRead: false
    };

    messageStore.addMessage(message);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg">
      <div className="flex-none p-4 border-b">
        <h2 className="text-lg font-semibold">Messages</h2>
        <select
          className="mt-2 w-full p-2 border rounded-md"
          value={selectedRecipient.id}
          onChange={(e) => {
            const recipient = recipients.find(r => r.id === e.target.value);
            if (recipient) {
              setSelectedRecipient(recipient);
              messageStore.markAsRead(currentUserId, recipient.id);
            }
          }}
        >
          {recipients.map((recipient) => (
            <option key={recipient.id} value={recipient.id}>
              {recipient.name} ({recipient.role})
              {unreadCount[recipient.id] ? ` (${unreadCount[recipient.id]} unread)` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${
              message.senderId === currentUserId ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                message.senderId === currentUserId
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm font-medium">{message.senderName}</p>
              <p className="mt-1">{message.content}</p>
              <p className="text-xs mt-1 opacity-75">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex-none p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-md"
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
} 