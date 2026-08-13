import type { MessageThread } from '../types';

export const messageThreads: MessageThread[] = [
  {
    id: 'th-01',
    participantName: 'Sarah Yusof',
    participantType: 'cl',
    avatarColor: '#d94f8c',
    lastMessage: 'Baru sampai rumah Puan Sofea, dah clock in.',
    lastMessageAt: '09:04',
    unread: 0,
    messages: [
      { id: 'm1', from: 'admin', text: 'Morning Sarah, sesi hari ini pukul 9 pagi ye di Setia Alam.', time: '08:15' },
      { id: 'm2', from: 'them', text: 'Ok admin, on the way sekarang.', time: '08:42' },
      { id: 'm3', from: 'them', text: 'Baru sampai rumah Puan Sofea, dah clock in.', time: '09:04' },
    ],
  },
  {
    id: 'th-02',
    participantName: 'Puan Adibah Karim',
    participantType: 'client',
    avatarColor: '#c98a3b',
    lastMessage: 'Boleh confirm CL untuk esok tak? Urgent sikit.',
    lastMessageAt: 'Yesterday',
    unread: 2,
    messages: [
      { id: 'm1', from: 'them', text: 'Hi, nak tanya pasal booking Pakej Dahlia saya.', time: 'Yesterday 14:02' },
      { id: 'm2', from: 'them', text: 'Boleh confirm CL untuk esok tak? Urgent sikit.', time: 'Yesterday 14:03' },
    ],
  },
  {
    id: 'th-03',
    participantName: 'Husna Nadia',
    participantType: 'cl',
    avatarColor: '#3b6d8a',
    lastMessage: 'Ok noted, akan cuba sampai lebih awal lepas ni.',
    lastMessageAt: 'Tue',
    unread: 0,
    messages: [
      { id: 'm1', from: 'admin', text: 'Husna, ada aduan sikit pasal masa sampai minggu lepas. Boleh cuba on-time ye.', time: 'Tue 10:20' },
      { id: 'm2', from: 'them', text: 'Ok noted, akan cuba sampai lebih awal lepas ni.', time: 'Tue 10:31' },
    ],
  },
  {
    id: 'th-04',
    participantName: 'Puan Elina Zulkifli',
    participantType: 'client',
    avatarColor: '#4f8a6d',
    lastMessage: 'Terima kasih! Tak sabar nak start.',
    lastMessageAt: 'Mon',
    unread: 0,
    messages: [
      { id: 'm1', from: 'admin', text: 'Puan Elina, Pakej Rafflesia untuk 14 Ogos sudah confirmed, CL akan kami update esok.', time: 'Mon 16:10' },
      { id: 'm2', from: 'them', text: 'Terima kasih! Tak sabar nak start.', time: 'Mon 16:14' },
    ],
  },
  {
    id: 'th-05',
    participantName: 'Mariam Adawiyah',
    participantType: 'cl',
    avatarColor: '#b13570',
    lastMessage: 'Set NERA untuk Puan Amirah dah bawa sekali.',
    lastMessageAt: 'Mon',
    unread: 0,
    messages: [
      { id: 'm1', from: 'them', text: 'Set NERA untuk Puan Amirah dah bawa sekali.', time: 'Mon 07:50' },
    ],
  },
];

export const threadById = (id: string) => messageThreads.find((t) => t.id === id);
