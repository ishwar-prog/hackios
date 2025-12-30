import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'seller' | 'admin';
  text: string;
  timestamp: Date;
  read: boolean;
}

export interface ChatThread {
  id: string;
  participants: {
    userId: string;
    userName: string;
    role: 'user' | 'seller' | 'admin';
  }[];
  context: {
    type: 'order' | 'dispute' | 'product' | 'general';
    referenceId?: string;
    referenceName?: string;
  };
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatStore {
  threads: ChatThread[];
  activeThreadId: string | null;

  // Actions
  createThread: (
    participants: ChatThread['participants'],
    context: ChatThread['context']
  ) => string;
  sendMessage: (
    threadId: string,
    senderId: string,
    senderName: string,
    senderRole: 'user' | 'seller' | 'admin',
    text: string
  ) => void;
  getThread: (threadId: string) => ChatThread | undefined;
  getThreadsByUser: (userId: string) => ChatThread[];
  getThreadByContext: (contextType: string, referenceId: string) => ChatThread | undefined;
  setActiveThread: (threadId: string | null) => void;
  markMessagesAsRead: (threadId: string, userId: string) => void;
  getUnreadCount: (userId: string) => number;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      threads: [],
      activeThreadId: null,

      createThread: (participants, context) => {
        const threadId = `thread-${Date.now()}`;
        const newThread: ChatThread = {
          id: threadId,
          participants,
          context,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          threads: [...state.threads, newThread],
        }));

        return threadId;
      },

      sendMessage: (threadId, senderId, senderName, senderRole, text) => {
        const message: ChatMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          senderId,
          senderName,
          senderRole,
          text,
          timestamp: new Date(),
          read: false,
        };

        set((state) => ({
          threads: state.threads.map((thread) => {
            if (thread.id === threadId) {
              return {
                ...thread,
                messages: [...thread.messages, message],
                updatedAt: new Date(),
              };
            }
            return thread;
          }),
        }));
      },

      getThread: (threadId) => {
        return get().threads.find((t) => t.id === threadId);
      },

      getThreadsByUser: (userId) => {
        return get().threads.filter((t) =>
          t.participants.some((p) => p.userId === userId)
        );
      },

      getThreadByContext: (contextType, referenceId) => {
        return get().threads.find(
          (t) =>
            t.context.type === contextType && t.context.referenceId === referenceId
        );
      },

      setActiveThread: (threadId) => {
        set({ activeThreadId: threadId });
      },

      markMessagesAsRead: (threadId, userId) => {
        set((state) => ({
          threads: state.threads.map((thread) => {
            if (thread.id === threadId) {
              return {
                ...thread,
                messages: thread.messages.map((msg) => {
                  if (msg.senderId !== userId && !msg.read) {
                    return { ...msg, read: true };
                  }
                  return msg;
                }),
              };
            }
            return thread;
          }),
        }));
      },

      getUnreadCount: (userId) => {
        return get().threads.reduce((count, thread) => {
          const isParticipant = thread.participants.some((p) => p.userId === userId);
          if (!isParticipant) return count;

          const unreadMessages = thread.messages.filter(
            (msg) => msg.senderId !== userId && !msg.read
          );
          return count + unreadMessages.length;
        }, 0);
      },
    }),
    {
      name: 'chat-storage',
    }
  )
);
