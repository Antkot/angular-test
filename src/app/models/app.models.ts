// src/app/models/app.models.ts

export interface User {
  id: string;
  email: string;
  passwordHash: string; // do symulacji logowania
  firstName: string;
  lastName: string;
  initials: string;
}

// Tabela relacyjna: Kto ma dostęp do czyjego konta
export interface UserAccess {
  id: string;
  userId: string;          // ID konta, do którego posiadamy dostęp (np. konto B lub C)
  grantedToUserId: string; // ID użytkownika, który TEN dostęp otrzymał (np. konto A)
}

export interface MedicalRecord {
  id: string;
  userId: string;          // Czyja to jest dokumentacja (powiązanie z konkretnym podopiecznym)
  title: string;           // np. "Badanie tomograf"
  description: string;
  doctor: string;          // np. "dr Jan Kowalski"
  date: string;            // np. "16.05.2025"
  tags: string[];          // Lista tagów, np. ['Kardiologia', 'Kontrola']
  notes: string;           // Notatki tekstowe
  hasAttachments: boolean; // Czy dodano plik/zdjęcie
}
