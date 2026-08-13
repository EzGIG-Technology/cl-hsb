import { useState } from 'react';
import { Send, Search } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { Avatar, Badge } from '../components/ui';
import { messageThreads as seedThreads } from '../data/messages';
import type { MessageThread } from '../types';

export default function MessagesPage() {
  const [threads, setThreads] = useState<MessageThread[]>(seedThreads);
  const [activeId, setActiveId] = useState(seedThreads[0]?.id ?? '');
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');

  const active = threads.find((t) => t.id === activeId);
  const filteredThreads = threads.filter((t) => t.participantName.toLowerCase().includes(query.toLowerCase()));

  function send() {
    if (!draft.trim() || !active) return;
    setThreads((prev) =>
      prev.map((t) =>
        t.id === active.id
          ? {
              ...t,
              lastMessage: draft,
              lastMessageAt: 'Now',
              unread: 0,
              messages: [...t.messages, { id: `m-${Date.now()}`, from: 'admin', text: draft, time: 'Now' }],
            }
          : t,
      ),
    );
    setDraft('');
  }

  function selectThread(id: string) {
    setActiveId(id);
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, unread: 0 } : t)));
  }

  return (
    <PageShell
      title="Messages"
      subtitle="Chat with CLs and clients in real time."
      sidePanel={
        <div className="flex flex-1 flex-col gap-3">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conversations"
              className="w-full rounded-full bg-white/10 py-2 pl-8 pr-3 text-sm text-white placeholder:text-white/50 focus:outline-none"
            />
          </div>

          <div className="scrollbar-thin flex-1 space-y-1 overflow-y-auto">
            {filteredThreads.map((t) => (
              <button
                key={t.id}
                onClick={() => selectThread(t.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  t.id === activeId ? 'bg-white/15' : 'hover:bg-white/10'
                }`}
              >
                <Avatar name={t.participantName} color={t.avatarColor} size={38} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium">{t.participantName}</p>
                    <span className="shrink-0 text-[10px] text-white/50">{t.lastMessageAt}</span>
                  </div>
                  <p className="truncate text-xs text-white/60">{t.lastMessage}</p>
                </div>
                {t.unread > 0 && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-pink text-[10px] font-semibold text-brand-maroon-dark">
                    {t.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      }
    >
      {active ? (
        <div className="mt-4 flex h-[calc(100vh-140px)] flex-col rounded-2xl border border-black/5 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-black/5 p-4">
            <Avatar name={active.participantName} color={active.avatarColor} size={38} />
            <div>
              <p className="font-semibold text-brand-ink">{active.participantName}</p>
              <Badge status={active.participantType === 'cl' ? 'on-duty' : 'active'}>
                {active.participantType === 'cl' ? 'Confinement Lady' : 'Client'}
              </Badge>
            </div>
          </div>

          <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto p-5">
            {active.messages.map((m) => (
              <div key={m.id} className={`flex ${m.from === 'admin' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                    m.from === 'admin' ? 'bg-brand-maroon text-white' : 'bg-brand-cream text-brand-ink'
                  }`}
                >
                  <p>{m.text}</p>
                  <p className={`mt-1 text-[10px] ${m.from === 'admin' ? 'text-white/60' : 'text-brand-muted'}`}>{m.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t border-black/5 p-3">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Type a message…"
              className="flex-1 rounded-full border border-black/10 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
            />
            <button onClick={send} className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-maroon text-white hover:bg-brand-maroon-dark">
              <Send size={16} />
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-8 text-brand-muted">No conversation selected.</p>
      )}
    </PageShell>
  );
}
