import { MedicalRecord, Tag, UserProfile } from '../types';

export const INITIAL_TAGS: Tag[] = [
  { id: 't1', name: 'Tag xd', bg: '#BACDFD', text: '#1E293B' },
  { id: 't2', name: 'Tag 2', bg: '#F8D2D2', text: '#1E293B' },
  { id: 't3', name: 'Pilne', bg: '#FED7AA', text: '#9A3412' },
  { id: 't4', name: 'Kardiolog', bg: '#E9D5FF', text: '#6B21A8' },
  { id: 't5', name: 'RTG', bg: '#CCFBF1', text: '#115E59' },
];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-jf',
    name: 'Jakub Filip',
    email: 'jakub.filip@gmail.com',
    initials: 'JF',
    avatarBg: '#DCFCE7', // light green
    avatarBorder: '#86EFAC',
    avatarText: '#15803D',
    role: 'patient',
  },
  {
    id: 'user-mk',
    name: 'Mateusz Kowalski',
    email: 'mateusz.kowalski@gmail.com',
    initials: 'MK',
    avatarBg: '#FEE2E2', // light reddish pink
    avatarBorder: '#FCA5A5',
    avatarText: '#991B1B',
    role: 'caregiver',
  },
  {
    id: 'user-jk',
    name: 'Jan Kowalski',
    email: 'jan.kowalski@gmail.com',
    initials: 'JK',
    avatarBg: '#E0E7FF',
    avatarBorder: '#A5B4FC',
    avatarText: '#3730A3',
    role: 'patient',
  },
];

export const INITIAL_RECORDS: MedicalRecord[] = [
  {
    id: 'rec-1',
    userId: 'user-jk',
    title: 'Badanie tomograf',
    description: 'Badanie z panem Kowalskim we wtorek jfajfaskj kajk jaskg jsakjgksajgksajgk',
    doctor: 'Pan Kowalski',
    date: '16.05.2025',
    tags: [
      { id: 't1', name: 'Tag xd', bg: '#BACDFD', text: '#1E293B' },
      { id: 't2', name: 'Tag 2', bg: '#F8D2D2', text: '#1E293B' },
    ],
    notes: 'Treść notatki z wizyty',
    attachments: [
      {
        id: 'att-1',
        name: 'Wynik_TK_Glowy.pdf',
        type: 'file',
        url: '#',
        size: '1.4 MB',
        date: '16.05.2025',
      },
    ],
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'rec-2',
    userId: 'user-jk',
    title: 'Badanie jakies',
    description: '',
    doctor: 'Dr Anna Wójcik',
    date: '16.05.2025',
    tags: [],
    notes: '',
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'rec-3',
    userId: 'user-jk',
    title: 'Badanie tomograf',
    description: 'Badanie z panem Kowalskim we wtorek jfajfaskj',
    doctor: 'Pan Kowalski',
    date: '16.05.2025',
    tags: [
      { id: 't2', name: 'Tag 2', bg: '#F8D2D2', text: '#1E293B' },
    ],
    notes: 'Kontrolne badanie tomografii komputerowej bez kontrastu. Zalecono ponowne badanie za 6 miesięcy.',
    createdAt: Date.now() - 86400000 * 10,
  },
  {
    id: 'rec-4',
    userId: 'user-jf',
    title: 'Morfologia krwi',
    description: 'Rutynowe badania profilaktyczne przed operacją',
    doctor: 'Laboratorium Diagnostyka',
    date: '20.06.2025',
    tags: [
      { id: 't1', name: 'Tag xd', bg: '#BACDFD', text: '#1E293B' },
    ],
    notes: 'Wyniki w normie, hematokryt 44%.',
    createdAt: Date.now() - 86400000 * 15,
  },
  {
    id: 'rec-5',
    userId: 'user-mk',
    title: 'Konsultacja kardiologiczna',
    description: 'Echo serca i EKG wysiłkowe',
    doctor: 'Dr n. med. Robert Lewandowski',
    date: '10.05.2025',
    tags: [
      { id: 't4', name: 'Kardiolog', bg: '#E9D5FF', text: '#6B21A8' },
      { id: 't3', name: 'Pilne', bg: '#FED7AA', text: '#9A3412' },
    ],
    notes: 'Rytm zatokowy miarowy 72/min. Brak cech niedokrwienia.',
    createdAt: Date.now() - 86400000 * 8,
  },
];
