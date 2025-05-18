'use client';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'patient' | 'doctor' | 'caregiver';
  recipientId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

class MessageStore {
  private static instance: MessageStore;
  private messages: Message[] = [];
  private subscribers: ((messages: Message[]) => void)[] = [];
  private broadcastChannel: BroadcastChannel | null = null;

  private constructor() {
    if (typeof window === 'undefined') return;
    
    // Load messages from localStorage on initialization
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      try {
        this.messages = JSON.parse(savedMessages);
      } catch (e) {
        console.error('Error parsing chat messages:', e);
      }
    }

    // Setup broadcast channel for cross-tab communication
    try {
      this.broadcastChannel = new BroadcastChannel('chat_messages');
      this.broadcastChannel.onmessage = (event) => {
        if (event.data.type === 'NEW_MESSAGE') {
          this.handleNewMessage(event.data.message);
        } else if (event.data.type === 'MARK_READ') {
          this.handleMarkRead(event.data.userId, event.data.senderId);
        }
      };
    } catch (e) {
      console.error('Error setting up BroadcastChannel:', e);
    }

    // Set up periodic localStorage sync
    setInterval(() => this.syncToStorage(), 1000);
  }

  static getInstance(): MessageStore {
    if (!MessageStore.instance) {
      MessageStore.instance = new MessageStore();
    }
    return MessageStore.instance;
  }

  private syncToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('chatMessages', JSON.stringify(this.messages));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }

  private handleNewMessage(message: Message) {
    // Only add if message doesn't exist
    if (!this.messages.find(m => m.id === message.id)) {
      this.messages.push(message);
      this.notifySubscribers();
    }
  }

  private handleMarkRead(userId: string, senderId: string) {
    this.messages = this.messages.map(msg =>
      msg.senderId === senderId && msg.recipientId === userId
        ? { ...msg, isRead: true }
        : msg
    );
    this.notifySubscribers();
  }

  subscribe(callback: (messages: Message[]) => void) {
    this.subscribers.push(callback);
    // Immediately call with current messages
    callback(this.messages);
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.messages));
  }

  addMessage(message: Message) {
    this.messages.push(message);
    // Broadcast to other tabs/windows
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'NEW_MESSAGE',
        message
      });
    }
    this.notifySubscribers();
    this.syncToStorage();
  }

  getMessages(userId: string, recipientId: string): Message[] {
    return this.messages.filter(
      msg =>
        (msg.senderId === userId && msg.recipientId === recipientId) ||
        (msg.senderId === recipientId && msg.recipientId === userId)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  markAsRead(userId: string, senderId: string) {
    this.messages = this.messages.map(msg =>
      msg.senderId === senderId && msg.recipientId === userId
        ? { ...msg, isRead: true }
        : msg
    );
    // Broadcast mark as read
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'MARK_READ',
        userId,
        senderId
      });
    }
    this.notifySubscribers();
    this.syncToStorage();
  }

  getUnreadCount(userId: string): Record<string, number> {
    const unreadCounts: Record<string, number> = {};
    this.messages.forEach(msg => {
      if (msg.recipientId === userId && !msg.isRead) {
        unreadCounts[msg.senderId] = (unreadCounts[msg.senderId] || 0) + 1;
      }
    });
    return unreadCounts;
  }

  getAllMessagesForUser(userId: string): Message[] {
    return this.messages.filter(
      msg => msg.senderId === userId || msg.recipientId === userId
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
}

export const messageStore = MessageStore.getInstance();
export type { Message }; 