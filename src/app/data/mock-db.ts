// src/app/data/mock-db.ts
import { User, UserAccess, MedicalRecord } from '../models/app.models';

// 0. Tagi dostępne w edytorze badania (kolory dobierane po nazwie)
export const KNOWN_TAGS: string[] = [
  'Tag xd',
  'Tag 2',
  'Pilne',
  'Kardiolog',
  'RTG',
];

// 1. Użytkownicy w systemie
export const MOCK_USERS: User[] = [
  {
    id: 'user-a',
    email: 'anna.opiekun@example.com',
    passwordHash: 'haslo123',
    firstName: 'Anna',
    lastName: 'Nowak (Opiekun)',
    initials: 'AN',
    role: 'caregiver',
    // Podopieczni Anny - ten sam zestaw co w tabeli MOCK_ACCESS poniżej.
    patientIds: ['user-b', 'user-c'],
  },
  {
    id: 'user-b',
    email: 'jan.senior@example.com',
    passwordHash: 'haslo123',
    firstName: 'Jan',
    lastName: 'Kowalski (Senior)',
    initials: 'JK',
    role: 'senior',
  },
  {
    id: 'user-c',
    email: 'maria.babcia@example.com',
    passwordHash: 'haslo123',
    firstName: 'Maria',
    lastName: 'Kowalska (Babcia)',
    initials: 'MK',
    role: 'senior',
  },
];

// 2. Tabela uprawnień (Kto co widzi)
export const MOCK_ACCESS: UserAccess[] = [
  // Użytkownik A ma dostęp do swojego konta (można traktować jako domyślne) oraz do B i C
  { id: 'acc-1', userId: 'user-a', grantedToUserId: 'user-a' },
  { id: 'acc-2', userId: 'user-b', grantedToUserId: 'user-a' }, // Anna widzi Jana
  { id: 'acc-3', userId: 'user-c', grantedToUserId: 'user-a' }, // Anna widzi Marię

  // Użytkownik B widzi tylko siebie
  { id: 'acc-4', userId: 'user-b', grantedToUserId: 'user-b' },

  // Użytkownik C widzi tylko siebie
  { id: 'acc-5', userId: 'user-c', grantedToUserId: 'user-c' },
];

// 3. Badania medyczne przypisane do konkretnych użytkowników (B i C)
export const MOCK_RECORDS: MedicalRecord[] = [
  {
    id: 'rec-1',
    userId: 'user-b', // Badanie Jana (B)
    title: 'Tomografia komputerowa głowy',
    description: 'Badanie kontrolne po wizycie neurologicznej.',
    doctor: 'dr hab. Marek Mostowiak',
    date: '12.04.2026',
    tags: ['Neurologia', 'Pilne', 'Tomografia'],
    notes: 'Zalecono powtórzenie za 6 miesięcy.',
    hasAttachments: true,
  },
  {
    id: 'rec-2',
    userId: 'user-b', // Drugie badanie Jana (B)
    title: 'Badanie krwi - Morfologia',
    description: 'Ogólny panel badawczy.',
    doctor: 'dr Ewa Drab',
    date: '02.05.2026',
    tags: ['Laboratorium', 'Profilaktyka'],
    notes: 'Wyniki w normie, lekki spadek żelaza.',
    hasAttachments: false,
  },
  {
    id: 'rec-3',
    userId: 'user-c', // Badanie Marii (C)
    title: 'USG Serca (Echokardiografia)',
    description: 'Ocena wydolności mięśnia sercowego.',
    doctor: 'dr Piotr Serce',
    date: '20.03.2026',
    tags: ['Kardiologia', 'USG'],
    notes: 'Ciśnienie stabilne, brak zmian miażdżycowych.',
    hasAttachments: true,
  },
];
