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
}
