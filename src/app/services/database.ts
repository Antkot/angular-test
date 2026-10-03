import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User, MedicalRecord } from '../models/app.models';
import { MOCK_USERS, MOCK_ACCESS, MOCK_RECORDS } from '../data/mock-db';

@Injectable({
  providedIn: 'root'
})
export class Database {

  private recordsKey = 'app_medical_records';

  constructor() {
    this.initStorage();
  }

  // Inicjalizacja: jeśli w localStorage nie ma jeszcze rekordów, wrzucamy tam nasze mocki
  private initStorage(): void {
    if (!localStorage.getItem(this.recordsKey)) {
      localStorage.setItem(this.recordsKey, JSON.stringify(MOCK_RECORDS));
    }
  }

  // Pobieranie aktualnych rekordów (z uwzględnieniem localStorage)
  private getStoredRecords(): MedicalRecord[] {
    const data = localStorage.getItem(this.recordsKey);
    return data ? JSON.parse(data) : MOCK_RECORDS;
  }

  // Zapisywanie rekordów do localStorage
  private saveRecords(records: MedicalRecord[]): void {
    localStorage.setItem(this.recordsKey, JSON.stringify(records));
  }

  // --- METODY PUBLICZNE DLA KOMPONENTÓW ---

  // 1. Zwraca profile użytkowników, do których dany użytkownik ma dostęp
  getAccessibleProfiles(currentUserId: string): Observable<User[]> {
    const allowedUserIds = MOCK_ACCESS
      .filter(acc => acc.grantedToUserId === currentUserId)
      .map(acc => acc.userId);

    const profiles = MOCK_USERS.filter(user => allowedUserIds.includes(user.id));
    return of(profiles).pipe(delay(200));
  }

  // 2. Pobiera badania dla konkretnego użytkownika
  getMedicalRecordsByUserId(userId: string): Observable<MedicalRecord[]> {
    const allRecords = this.getStoredRecords();
    const userRecords = allRecords.filter(record => record.userId === userId);
    return of(userRecords).pipe(delay(200));
  }

  // 3. DODAWANIE nowego badania (z plikiem/zdjęciem lub bez)
  addMedicalRecord(newRecordData: Omit<MedicalRecord, 'id'>): Observable<MedicalRecord> {
    const allRecords = this.getStoredRecords();

    // Generujemy unikalne ID (np. timestamp)
    const newRecord: MedicalRecord = {
      ...newRecordData,
      id: 'rec-' + Date.now()
    };

    allRecords.unshift(newRecord); // Dodajemy na początek listy
    this.saveRecords(allRecords);

    return of(newRecord).pipe(delay(300));
  }

  // 4. EDYCJA istniejącego badania (np. dopisanie tagów, notatek)
  updateMedicalRecord(updatedRecord: MedicalRecord): Observable<boolean> {
    let allRecords = this.getStoredRecords();

    allRecords = allRecords.map(record =>
      record.id === updatedRecord.id ? updatedRecord : record
    );

    this.saveRecords(allRecords);
    return of(true).pipe(delay(300));
  }
}
