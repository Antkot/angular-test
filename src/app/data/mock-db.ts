// src/app/data/mock-db.ts
import { User, MedicalRecord } from '../models/app.models';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    firstName: 'Jakub',
    lastName: 'Filip',
    email: 'jakub.filip@example.com',
    initials: 'JF',
    isGuardian: false
  },
  {
    id: 'u2',
    firstName: 'Mateusz',
    lastName: 'Kowalski',
    email: 'jan.kowalski@gmail.com',
    initials: 'MK',
    isGuardian: false
  }
];

export const MOCK_RECORDS: MedicalRecord[] = [
  {
    id: 'r1',
    userId: 'u2',
    title: 'Badanie tomograf',
    description: 'Rutynowe badanie kontrolne po zabiegu.',
    doctor: 'Pan Kowalski',
    date: '16.05.2025',
    tags: ['Tag xd', 'Tag 2'],
    notes: 'Treść notatki z zaleceniami.',
    hasAttachments: false
  },
  {
    id: 'r2',
    userId: 'u2',
    title: 'Badanie jakieś',
    description: 'Badanie z panem Kowalskim we wtorek...',
    doctor: 'Pan Kowalski',
    date: '16.05.2025',
    tags: [],
    notes: '',
    hasAttachments: true
  }
];
