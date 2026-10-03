import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User, MedicalRecord } from '../models/app.models';
import { MOCK_USERS, MOCK_RECORDS } from '../data/mock-db';

@Injectable({
  providedIn: 'root'
})
export class Database {

  constructor() { }

  getUsers(): Observable<User[]> {
    return of(MOCK_USERS).pipe(delay(500));
  }

  getMedicalRecordsByUserId(userId: string): Observable<MedicalRecord[]> {
    const userRecords = MOCK_RECORDS.filter(record => record.userId === userId);
    return of(userRecords).pipe(delay(500));
  }
}
