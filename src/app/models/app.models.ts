// src/app/models/app.models.ts

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  initials: string; // np. "JF" lub "MK" z ekranu wyboru konta
  isGuardian: boolean; // do obsługi weryfikacji opiekuna z kodem QR
}

export interface MedicalRecord {
  id: string;
  userId: string; // powiązanie z konkretnym użytkownikiem
  title: string; // np. "Badanie tomograf"
  description: string;
  doctor: string; // np. "Pan Kowalski"
  date: string; // np. "16.05.2025"
  tags: string[]; // np. ['Tag xd', 'Tag 2']
  notes: string;
  hasAttachments: boolean; // flaga informująca czy dodano plik/zdjęcie
}
