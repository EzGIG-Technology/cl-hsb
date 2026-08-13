import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { messageThreads as seedThreads } from '../data/messages';
import type { MessageThread } from '../types';

const STORAGE_KEY = 'nrmc-messages-v1';

function loadInitial(): MessageThread[] {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as MessageThread[];
        if (parsed.length) return parsed;
      }
    } catch {
      // fall through to seed
    }
  }
  return seedThreads;
}

interface MessageStoreValue {
  threads: MessageThread[];
  sendMessage: (threadId: string, text: string) => void;
  markRead: (threadId: string) => void;
  resetToDefaults: () => void;
}

const MessageStoreContext = createContext<MessageStoreValue | null>(null);

export function MessageStoreProvider({ children }: { children: ReactNode }) {
  const [threads, setThreads] = useState<MessageThread[]>(loadInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
    } catch {
      // ignore quota errors in demo environment
    }
  }, [threads]);

  const value = useMemo<MessageStoreValue>(
    () => ({
      threads,
      sendMessage: (threadId, text) =>
        setThreads((prev) =>
          prev.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  lastMessage: text,
                  lastMessageAt: 'Now',
                  unread: 0,
                  messages: [...t.messages, { id: `m-${Date.now()}`, from: 'admin', text, time: 'Now' }],
                }
              : t,
          ),
        ),
      markRead: (threadId) => setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, unread: 0 } : t))),
      resetToDefaults: () => setThreads(seedThreads),
    }),
    [threads],
  );

  return <MessageStoreContext.Provider value={value}>{children}</MessageStoreContext.Provider>;
}

export function useMessageStore() {
  const ctx = useContext(MessageStoreContext);
  if (!ctx) throw new Error('useMessageStore must be used within MessageStoreProvider');
  return ctx;
}
