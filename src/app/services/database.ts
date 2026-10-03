// src/app/services/database.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User, MedicalRecord } from '../models/app.models';
import { MOCK_USERS, MOCK_ACCESS, MOCK_RECORDS } from '../data/mock-db';

@Injectable({
  providedIn: 'root'
})
export class Database {

  constructor() { }

  // 1. Zwraca profile użytkowników, do których dany zalogowany użytkownik ma dostęp
  // (Np. dla User A zwróci profil A, B i C. Dla User B zwróci tylko B).
  getAccessibleProfiles(currentUserId: string): Observable<User[]> {
    // Znajdujemy ID kont, do których currentUserId ma uprawnienia
    const allowedUserIds = MOCK_ACCESS
      .filter(acc => acc.grantedToUserId === currentUserId)
      .map(acc => acc.userId);

    // Wyciągamy pełne obiekty użytkowników pasujące do tych ID
    const profiles = MOCK_USERS.filter(user => allowedUserIds.includes(user.id));

    return of(profiles).pipe(delay(300));
  }

  // 2. Zwraca dokumentację medyczną dla wybranego profilu podopiecznego
  getMedicalRecordsByUserId(userId: string): Observable<MedicalRecord[]> {
    const userRecords = MOCK_RECORDS.filter(record => record.userId === userId);
    return of(userRecords).pipe(delay(300));
  }

  // 3. Metoda do dodawania nowego badania (symulacja zapisu do bazy)
  addMedicalRecord(newRecord: MedicalRecord): Observable<boolean> {
    MOCK_RECORDS.unshift(newRecord); // Dodajemy na początek tablicy
    return of(true).pipe(delay(300));
  }
}
