import { useState } from 'react';
import { Send, Search } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { Avatar, Badge, Card } from '../components/ui';
import { useMessageStore } from '../store/MessageStore';

export default function MessagesPage() {
  const { threads, sendMessage, markRead } = useMessageStore();
  const [activeId, setActiveId] = useState(threads[0]?.id ?? '');
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');

  const active = threads.find((t) => t.id === activeId);
  const filteredThreads = threads.filter((t) => t.participantName.toLowerCase().includes(query.toLowerCase()));

  function send() {
    if (!draft.trim() || !active) return;
    sendMessage(active.id, draft);
    setDraft('');
  }

  function selectThread(id: string) {
    setActiveId(id);
    markRead(id);
  }

  return (
    <PageShell title="Messages" subtitle="Chat with CLs and clients in real time.">
      <div className="grid h-[calc(100vh-160px)] grid-cols-1 gap-5 lg:grid-cols-[300px_1fr]">
        <Card className="!p-0 flex flex-col overflow-hidden">
          <div className="border-b border-black/5 p-3">
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search conversations"
                className="w-full rounded-full bg-brand-cream py-2 pl-8 pr-3 text-sm text-brand-ink placeholder:text-brand-muted focus:outline-none"
              />
            </div>
          </div>
          <div className="scrollbar-thin flex-1 space-y-1 overflow-y-auto p-2">
            {filteredThreads.map((t) => (
              <button
                key={t.id}
                onClick={() => selectThread(t.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  t.id === activeId ? 'bg-brand-pink-light' : 'hover:bg-brand-cream'
                }`}
              >
                <Avatar name={t.participantName} color={t.avatarColor} size={38} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium text-brand-ink">{t.participantName}</p>
                    <span className="shrink-0 text-[10px] text-brand-muted">{t.lastMessageAt}</span>
                  </div>
                  <p className="truncate text-xs text-brand-muted">{t.lastMessage}</p>
                </div>
                {t.unread > 0 && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-pink text-[10px] font-semibold text-white">
                    {t.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </Card>

        {active ? (
          <div className="flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
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
                      m.from === 'admin' ? 'bg-brand-pink text-white' : 'bg-brand-cream text-brand-ink'
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
              <button onClick={send} className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-pink text-white hover:bg-brand-pink-dark">
                <Send size={16} />
              </button>
            </div>
          </div>
        ) : (
          <Card className="flex items-center justify-center text-brand-muted">No conversation selected.</Card>
        )}
      </div>
    </PageShell>
  );
}
