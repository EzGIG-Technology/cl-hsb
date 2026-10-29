import type { MessageThread } from '../types';

// Seed WhatsApp-style threads between the front desk and therapists or clients. Written the way the
// team actually chats: a mix of Malay and English.
export const messageThreads: MessageThread[] = [
  {
    id: 'th-01',
    participantName: 'Mariam Yusof',
    participantType: 'cl',
    avatarColor: '#c42474',
    lastMessage: 'Dah clock in. Bilik 2 dah siap, tunggu Puan Nadia.',
    lastMessageAt: '10:14',
    unread: 0,
    messages: [
      { id: 'm1', from: 'admin', text: 'Morning Mariam, client pertama hari ni Puan Nadia pukul 10.30, traditional 60 min di Bilik 2. Dia alah minyak lavender, guna base oil ye.', time: '09:05' },
      { id: 'm2', from: 'them', text: 'Ok noted admin, on the way.', time: '09:40' },
      { id: 'm3', from: 'them', text: 'Dah clock in. Bilik 2 dah siap, tunggu Puan Nadia.', time: '10:14' },
    ],
  },
  {
    id: 'th-02',
    participantName: 'Puan Adibah Karim',
    participantType: 'client',
    avatarColor: '#d9921f',
    lastMessage: 'Ada slot prenatal petang esok lepas 4pm? Urgent sikit, sakit belakang.',
    lastMessageAt: 'Yesterday',
    unread: 2,
    messages: [
      { id: 'm1', from: 'them', text: 'Hi Honey Spa, saya 32 minggu. Nak book prenatal massage 60 min.', time: 'Yesterday 14:02' },
      { id: 'm2', from: 'them', text: 'Ada slot prenatal petang esok lepas 4pm? Urgent sikit, sakit belakang.', time: 'Yesterday 14:03' },
    ],
  },
  {
    id: 'th-03',
    participantName: 'Husna Nadia',
    participantType: 'cl',
    avatarColor: '#9c1a5b',
    lastMessage: 'Ok noted, sorry admin. Lepas ni saya check alamat dalam app dulu.',
    lastMessageAt: 'Tue',
    unread: 0,
    messages: [
      { id: 'm1', from: 'admin', text: 'Husna, Puan Izzah dah pindah ke Presint 16. Tadi dia tunggu 25 minit. Sila check alamat dalam app sebelum gerak ye.', time: 'Tue 15:05' },
      { id: 'm2', from: 'them', text: 'Ok noted, sorry admin. Lepas ni saya check alamat dalam app dulu.', time: 'Tue 15:12' },
    ],
  },
  {
    id: 'th-04',
    participantName: 'Puan Elina Zulkifli',
    participantType: 'client',
    avatarColor: '#6f76b0',
    lastMessage: 'Terima kasih! Tak sabar nak cuba totok wajah.',
    lastMessageAt: 'Mon',
    unread: 0,
    messages: [
      { id: 'm1', from: 'admin', text: 'Puan Elina, Mix & Match (foot, back, totok wajah) untuk Jumaat 14 Ogos dah kami terima. Nama therapist kami update esok.', time: 'Mon 16:10' },
      { id: 'm2', from: 'them', text: 'Terima kasih! Tak sabar nak cuba totok wajah.', time: 'Mon 16:14' },
    ],
  },
  {
    id: 'th-05',
    participantName: 'Mariam Adawiyah',
    participantType: 'cl',
    avatarColor: '#2f2b55',
    lastMessage: 'Dah sampai rumah Puan Amirah di Kajang, tengah set up katil lipat.',
    lastMessageAt: '10:52',
    unread: 0,
    messages: [
      { id: 'm1', from: 'admin', text: 'Kak Mariam, home service Kajang pukul 11. Bawa tuala extra, client ada anak kecil.', time: '09:30' },
      { id: 'm2', from: 'them', text: 'Dah sampai rumah Puan Amirah di Kajang, tengah set up katil lipat.', time: '10:52' },
    ],
  },
];

export const threadById = (id: string) => messageThreads.find((t) => t.id === id);
