// src/app/data/data-view.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { Database } from '../services/database';
import { User, UserAccess, UserId, MedicalRecord } from '../models/app.models';

@Component({
  selector: 'app-data-view',
  standalone: true,
  imports: [],
  templateUrl: './data-view.html',
  styleUrls: ['./data-view.scss'],
})
export class DataView implements OnInit {
  private readonly database = inject(Database);

  public readonly users = signal<User[]>([]);
  public readonly access = signal<UserAccess[]>([]);
  public readonly records = signal<MedicalRecord[]>([]);
  public readonly isLoading = signal(true);

  // Konto lokalne = profil pokazywany w kodzie QR tego urządzenia
  public readonly localUserId = signal<UserId>('');

  ngOnInit(): void {
    this.localUserId.set(this.database.getLocalUserId());
    this.load();
  }

  public load(): void {
    this.isLoading.set(true);

    this.database.getUsers().subscribe((users) => this.users.set(users));
    this.database.getAllAccess().subscribe((access) => this.access.set(access));
    this.database.getAllMedicalRecords().subscribe((records) => {
      this.records.set(records);
      this.isLoading.set(false);
    });
  }

  // --- KONTO LOKALNE ---

  public onLocalUserChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.database.setLocalUserId(select.value);
    this.localUserId.set(select.value);
  }

  // --- POMOCNICZE ---

  public userName(userId: UserId): string {
    const user = this.database.getUserById(userId);
    return user ? `${user.firstName} ${user.lastName}` : userId;
  }

  public recordCount(userId: UserId): number {
    return this.records().filter((record) => record.userId === userId).length;
  }

  // Uprawnienia nadane przez skanowanie kodu QR (nie z mocków)
  public isQrGrant(grant: UserAccess): boolean {
    return grant.id.startsWith('acc-qr-');
  }
}
