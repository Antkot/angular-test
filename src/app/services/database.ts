import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  User,
  UserAccess,
  UserId,
  UserRole,
  NewUser,
  MedicalRecord,
  MedicalRecordId,
} from '../models/app.models';
import { MOCK_USERS, MOCK_ACCESS, MOCK_RECORDS } from '../data/mock-db';

/** Konto, którego profilem jest to urządzenie (domyślnie senior). */
export const DEFAULT_LOCAL_USER_ID: UserId = 'user-b';

// Ścieżki zależne od sesji - jedyne miejsce, które zna mapowanie rola -> ekran.
// Ścieżki w app.routes.ts muszą z nimi się zgadzać.
export const AUTH_ROUTE = '/login';
export const SENIOR_HOME_ROUTE = '/senior-dashboard';
export const CAREGIVER_HOME_ROUTE = '/caregiver-dashboard';

/** E-mail z imienia i nazwiska, np. "Łukasz Żak" -> "lukasz.zak". */
function toEmailSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z]/g, '')
    .toLowerCase();
}

@Injectable({
  providedIn: 'root',
})
export class Database {
  private readonly recordsKey = 'app_medical_records';
  private readonly accessKey = 'app_user_access';
  private readonly usersKey = 'app_users';
  private readonly localUserKey = 'app_local_user_id';

  constructor() {
    this.initStorage();
  }

  // Inicjalizacja: jeśli w localStorage nie ma jeszcze rekordów, wrzucamy tam nasze mocki.
  // Konta lokalnego (zalogowanego) nie seedujemy - jego brak oznacza "wylogowanego",
  // czyli aplikacja uruchamia się na ekranie logowania/rejestracji.
  private initStorage(): void {
    if (!localStorage.getItem(this.recordsKey)) {
      localStorage.setItem(this.recordsKey, JSON.stringify(MOCK_RECORDS));
    }
    if (!localStorage.getItem(this.accessKey)) {
      localStorage.setItem(this.accessKey, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.usersKey)) {
      localStorage.setItem(this.usersKey, JSON.stringify([]));
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

  // --- KONTO LOKALNE TEGO URZĄDZENIA (= SESJA) ---

  // 0. ID konta, którego profil jest wyświetlany w kodzie QR
  getLocalUserId(): UserId {
    return localStorage.getItem(this.localUserKey) ?? DEFAULT_LOCAL_USER_ID;
  }

  // Zmiana konta lokalnego (np. przy przełączeniu urządzenia na konto opiekuna)
  setLocalUserId(userId: UserId): void {
    if (!userId) {
      return;
    }
    localStorage.setItem(this.localUserKey, userId);
  }

  /** Czy na urządzeniu jest wybrane konto - bez niego wchodzimy na /auth. */
  hasSession(): boolean {
    return Boolean(localStorage.getItem(this.localUserKey));
  }

  /** Wylogowanie: kasujemy konto lokalne, ale zostawiamy konta i uprawnienia. */
  signOut(): void {
    localStorage.removeItem(this.localUserKey);
  }

  // --- UŻYTKOWNICY (baza = mocki + konta zarejestrowane na urządzeniu) ---

  private getStoredUsers(): User[] {
    const data = localStorage.getItem(this.usersKey);
    return data ? (JSON.parse(data) as User[]) : [];
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(this.usersKey, JSON.stringify(users));
  }

  /** Mocki + konta zarejestrowane tutaj. Wersja z localStorage ma pierwszeństwo. */
  getAllUsers(): User[] {
    const storedIds = new Set(this.getStoredUsers().map((user) => user.id));
    return [...MOCK_USERS.filter((user) => !storedIds.has(user.id)), ...this.getStoredUsers()];
  }

  getUserById(userId: UserId): User | undefined {
    return this.getAllUsers().find((user) => user.id === userId);
  }

  // Wszyscy użytkownicy w bazie (dla widoku /data)
  getUsers(): Observable<User[]> {
    return of(this.getAllUsers()).pipe(delay(200));
  }

  /** Profil zalogowanego konta - synchronicznie, np. dla strażników tras. */
  getLocalUserProfile(): User | undefined {
    return this.getUserById(this.getLocalUserId());
  }

  getLocalUser(): Observable<User | undefined> {
    return of(this.getLocalUserProfile()).pipe(delay(200));
  }

  /** Rola zalogowanego konta - senior pokazuje kod, opiekun skanuje. */
  getLocalUserRole(): UserRole {
    return this.getLocalUserProfile()?.role ?? 'senior';
  }

  /**
   * Logowanie e-mail + hasło. Zwraca konto albo null przy złych danych.
   * Po sukcesie caller ustawia sesję przez setLocalUserId().
   */
  login(email: string, password: string): User | null {
    const normalizedEmail = email.trim().toLocaleLowerCase();
    const user = this.getAllUsers().find(
      (candidate) => candidate.email.toLocaleLowerCase() === normalizedEmail,
    );

    if (!user || user.passwordHash !== password) {
      return null;
    }
    return user;
  }

  /** Ekran startowy: widok pacjenta albo widok opiekuna. */
  getHomeRoute(role: UserRole = this.getLocalUserRole()): string {
    return role === 'caregiver' ? CAREGIVER_HOME_ROUTE : SENIOR_HOME_ROUTE;
  }

  // Zapisywanie zmian profilu. Modyfikację mocka zapisujemy jako pełną kopię
  // w localStorage, więc trzeba nadpisać istniejący wpis zamiast dopisywać duplikat.
  private saveUser(updated: User): void {
    const stored = this.getStoredUsers();
    const index = stored.findIndex((user) => user.id === updated.id);
    if (index >= 0) {
      stored[index] = updated;
    } else {
      stored.push(updated);
    }
    this.saveUsers(stored);
  }

  // Rejestracja konta z ekranu logowania - zapis w bazie (localStorage).
  registerUser(newUser: NewUser): User {
    const firstName = newUser.firstName.trim();
    const lastName = newUser.lastName.trim();

    const user: User = {
      id: `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      email:
        newUser.email?.trim() || `${toEmailSlug(firstName)}.${toEmailSlug(lastName)}@example.com`,
      passwordHash: 'haslo123',
      firstName,
      lastName,
      initials: `${firstName.charAt(0)}${lastName.charAt(0)}`.toLocaleUpperCase(),
      role: newUser.role,
      // Świeży opiekun zaczyna bez podopiecznych, każdego dodaje skanując kod QR.
      ...(newUser.role === 'caregiver' ? { patientIds: [] as UserId[] } : {}),
    };

    this.saveUser(user);
    return user;
  }

  // --- UPRAWNIENIA (QR) ---

  // Uprawnienia z tabeli mocków (ta sama relacja co `patientIds` w profilach)
  getStoredAccess(): UserAccess[] {
    const data = localStorage.getItem(this.accessKey);
    return data ? JSON.parse(data) : [];
  }

  // Tabela uprawnień - mocki + wpisy zapisane po skanowaniu kodu QR
  getAllAccess(): Observable<UserAccess[]> {
    return of([...MOCK_ACCESS, ...this.getStoredAccess()]).pipe(delay(200));
  }

  /** Podopieczni zalogowanego opiekuna - lista z profilu w bazie. */
  getPatientIds(caregiverId: UserId = this.getLocalUserId()): UserId[] {
    return this.getUserById(caregiverId)?.patientIds ?? [];
  }

  hasAccess(userId: UserId, grantedToUserId: UserId = this.getLocalUserId()): boolean {
    return this.getPatientIds(grantedToUserId).includes(userId);
  }

  // 1. Dodaje pacjenta do listy podopiecznych zalogowanego opiekuna.
  //    Zwraca false gdy: id jest puste, nieznane albo wskazuje na własny profil
  //    (nikt nie udostępnia sam sobie danych). Powtórne skanowanie jest bezpieczne.
  addPatient(
    patientId: UserId,
    caregiverId: UserId = this.getLocalUserId(),
  ): Observable<boolean> {
    const trimmedId = patientId?.trim() ?? '';
    const caregiver = this.getUserById(caregiverId);
    if (!trimmedId || !caregiver) {
      return of(false).pipe(delay(200));
    }
    if (trimmedId === caregiverId) {
      return of(false).pipe(delay(200));
    }
    if (!this.getUserById(trimmedId)) {
      return of(false).pipe(delay(200));
    }

    const patientIds = caregiver.patientIds ?? [];
    if (!patientIds.includes(trimmedId)) {
      this.saveUser({ ...caregiver, patientIds: [...patientIds, trimmedId] });
    }

    return of(true).pipe(delay(200));
  }

  // 2. Zwraca profile użytkowników, do których ma dostęp bieżące konto
  //    (własny profil + podopieczni z `patientIds`)
  getAccessibleProfiles(currentUserId: UserId = this.getLocalUserId()): Observable<User[]> {
    const patientIds = this.getPatientIds(currentUserId);
    const profiles = this.getAllUsers().filter(
      (user) => user.id === currentUserId || patientIds.includes(user.id),
    );
    return of(profiles).pipe(delay(200));
  }

  // --- DOKUMENTACJA MEDYCZNA ---

  // 3. Pobiera badania dla konkretnego użytkownika
  getMedicalRecordsByUserId(userId: UserId): Observable<MedicalRecord[]> {
    const allRecords = this.getStoredRecords();
    const userRecords = allRecords.filter((record) => record.userId === userId);
    return of(userRecords).pipe(delay(200));
  }

  // 4. Cała dokumentacja - dla widoku /data
  getAllMedicalRecords(): Observable<MedicalRecord[]> {
    return of(this.getStoredRecords()).pipe(delay(200));
  }

  // 5. DODAWANIE nowego badania (z plikiem/zdjęciem lub bez)
  addMedicalRecord(newRecordData: Omit<MedicalRecord, 'id'>): Observable<MedicalRecord> {
    const allRecords = this.getStoredRecords();

    // Generujemy unikalny ID
    const newRecord: MedicalRecord = {
      ...newRecordData,
      id: 'rec-' + Date.now(),
    };

    allRecords.unshift(newRecord); // Dodajemy na początek listy
    this.saveRecords(allRecords);

    return of(newRecord).pipe(delay(300));
  }

  // 6. EDYCJA istniejącego badania (np. dopisanie tagów, notatek)
  updateMedicalRecord(updatedRecord: MedicalRecord): Observable<boolean> {
    let allRecords = this.getStoredRecords();

    allRecords = allRecords.map((record) =>
      record.id === updatedRecord.id ? updatedRecord : record,
    );

    this.saveRecords(allRecords);
    return of(true).pipe(delay(300));
  }

  // Pojedyncze badanie po id (np. do edycji)
  getMedicalRecordById(recordId: MedicalRecordId): MedicalRecord | undefined {
    return this.getStoredRecords().find((record) => record.id === recordId);
  }

  // 7. USUNIĘCIE badania
  deleteMedicalRecord(recordId: MedicalRecordId): Observable<boolean> {
    this.saveRecords(this.getStoredRecords().filter((record) => record.id !== recordId));
    return of(true).pipe(delay(200));
  }
}
