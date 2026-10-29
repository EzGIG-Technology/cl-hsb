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
  const [who, setWho] = useState<'all' | 'cl' | 'client'>('all');

  const active = threads.find((t) => t.id === activeId);
  const filteredThreads = threads.filter(
    (t) => (who === 'all' || t.participantType === who) && t.participantName.toLowerCase().includes(query.toLowerCase()),
  );

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
    <PageShell title="Messages" subtitle="Chats with your therapists and clients.">
      <div className="grid h-[calc(100dvh-240px)] min-h-[520px] grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
        <Card className="!p-0 flex min-h-0 flex-col overflow-hidden">
          <div className="space-y-3 px-4 pb-2 pt-4">
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search chats"
                aria-label="Search chats"
                className="w-full rounded-full bg-brand-cream py-2.5 pl-9 pr-3 text-sm text-brand-ink placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-pink"
              />
            </div>
            <div className="flex gap-1.5" role="tablist" aria-label="Show chats with">
              {(
                [
                  ['all', 'All'],
                  ['cl', 'Therapists'],
                  ['client', 'Clients'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={who === id}
                  onClick={() => setWho(id)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    who === id ? 'bg-brand-pink-light text-brand-pink' : 'text-brand-muted hover:bg-brand-cream hover:text-brand-ink'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="scrollbar-thin min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-2">
            {filteredThreads.map((t) => (
              <button
                key={t.id}
                onClick={() => selectThread(t.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                  t.id === activeId ? 'bg-brand-pink-light' : 'hover:bg-brand-cream'
                }`}
              >
                <Avatar name={t.participantName} color={t.avatarColor} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`truncate text-sm text-brand-ink ${t.unread > 0 ? 'font-semibold' : 'font-medium'}`}>{t.participantName}</p>
                    <span className="shrink-0 text-xs tabular-nums text-brand-muted">{t.lastMessageAt}</span>
                  </div>
                  <p className={`truncate text-sm ${t.unread > 0 ? 'text-brand-ink' : 'text-brand-muted'}`}>{t.lastMessage}</p>
                </div>
                {t.unread > 0 && (
                  <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-brand-pink px-1.5 text-xs font-semibold tabular-nums text-white">
                    <span className="sr-only">Unread: </span>
                    {t.unread}
                  </span>
                )}
              </button>
            ))}
            {filteredThreads.length === 0 && <p className="px-3 py-6 text-center text-sm text-brand-muted">No chats found.</p>}
          </div>
        </Card>

        {active ? (
          <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl bg-white">
            <div className="flex items-center gap-3 px-6 pb-3 pt-5">
              <Avatar name={active.participantName} color={active.avatarColor} size={44} />
              <div>
                <p className="text-lg font-semibold leading-tight text-brand-ink">{active.participantName}</p>
                <div className="mt-1">
                  <Badge status={active.participantType === 'cl' ? 'on-duty' : 'active'}>
                    {active.participantType === 'cl' ? 'Therapist' : 'Client'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="scrollbar-thin min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-4">
              {active.messages.map((m) => (
                <div key={m.id} className={`flex ${m.from === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                      m.from === 'admin' ? 'rounded-br-md bg-brand-pink text-white' : 'rounded-bl-md bg-brand-cream text-brand-ink'
                    }`}
                  >
                    <p className="leading-relaxed">{m.text}</p>
                    <p className={`mt-1 text-xs tabular-nums ${m.from === 'admin' ? 'text-white/75' : 'text-brand-muted'}`}>{m.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 px-4 pb-4 pt-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder={`Message ${active.participantName.split(' ')[0]}`}
                aria-label="Message"
                className="flex-1 rounded-full bg-brand-cream px-5 py-3 text-sm text-brand-ink placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-pink"
              />
              <button
                onClick={send}
                aria-label="Send"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-pink text-white transition-colors hover:bg-brand-pink-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2"
              >
                <Send size={17} />
              </button>
            </div>
          </div>
        ) : (
          <Card className="flex items-center justify-center text-sm text-brand-muted">Pick a chat to read it.</Card>
        )}
      </div>
    </PageShell>
  );
}
