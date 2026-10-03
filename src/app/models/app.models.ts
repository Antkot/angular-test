// src/app/models/app.models.ts

/** Identyfikatory encji - aliasy zamiast gołego `string` ułatwiają refaktoryzację. */
export type UserId = string;
export type AccessId = string;
export type MedicalRecordId = string;

/** Rola konta - decyduje o ekranie startowym po zalogowaniu. */
export type UserRole = 'senior' | 'caregiver';

export interface User {
  id: UserId;
  email: string;
  passwordHash: string; // do symulacji logowania
  firstName: string;
  lastName: string;
  initials: string;
  role: UserRole;
  /** Podopieczni opiekuna - uzupełniane przez skanowanie kodu QR pacjenta. */
  patientIds?: UserId[];
}

/** Dane konta podawane na ekranie logowania/rejestracji. */
export interface NewUser {
  firstName: string;
  lastName: string;
  email?: string;
  role: UserRole;
}

// Tabela relacyjna: Kto ma dostęp do czyjego konta
export interface UserAccess {
  id: AccessId;
  userId: UserId; // ID konta, do którego posiadamy dostęp (np. konto B lub C)
  grantedToUserId: UserId; // ID użytkownika, który TEN dostęp otrzymał (np. konto A)
}

export interface MedicalRecord {
  id: MedicalRecordId;
  userId: UserId; // Czyja to jest dokumentacja (powiązanie z konkretnym podopiecznym)
  title: string; // np. "Badanie tomograf"
  description: string;
  doctor: string; // np. "dr Jan Kowalski"
  date: string; // np. "16.05.2025"
  tags: string[]; // Lista tagów, np. ['Kardiologia', 'Kontrola']
  notes: string; // Notatki tekstowe
  hasAttachments: boolean; // Czy dodano plik/zdjęcie
}

/** Rekord tworzony po zeskanowaniu kodu QR - uprawnienie do profilu pacjenta. */
export interface NewUserAccess {
  userId: UserId;
  grantedToUserId: UserId;
}
