import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AUTH_ROUTE, Database } from '../../services/database';
import { MedicalRecord, User, UserId } from '../../models/app.models';

@Component({
  selector: 'app-senior-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './senior-dashboard.html',
  styleUrls: ['./senior-dashboard.scss'],
})
export class SeniorDashboard implements OnInit {
  private readonly database = inject(Database);
  private readonly router = inject(Router);

  // Konta, do których ma dostęp zalogowane konto (dane z tabeli uprawnień)
  public readonly profiles = signal<User[]>([]);
  // Wybrany pacjent - najpierw wybór pacjenta, potem jego badania
  public readonly selectedPatientId = signal<UserId | null>(null);
  public readonly records = signal<MedicalRecord[]>([]);
  public readonly isLoading = signal(true);
  public readonly isLoadingRecords = signal(false);
  public readonly localUserId: UserId;

  constructor() {
    this.localUserId = this.database.getLocalUserId();
  }

  ngOnInit(): void {
    this.database.getAccessibleProfiles().subscribe({
      next: (profiles: User[]) => {
        this.profiles.set(profiles);

        // Domyślnie pokazujemy konto tego urządzenia, a gdyby nie było widoczne - pierwsze dostępne
        const own = profiles.find((profile) => profile.id === this.localUserId);
        const initial = own ?? profiles[0];

        this.selectedPatientId.set(initial?.id ?? null);
        this.isLoading.set(false);

        if (initial) {
          this.loadRecords(initial.id);
        }
      },
      error: () => this.isLoading.set(false),
    });
  }

  selectPatient(userId: UserId): void {
    if (userId === this.selectedPatientId()) {
      return;
    }
    this.selectedPatientId.set(userId);
    this.loadRecords(userId);
  }

  userName(userId: UserId): string {
    const user = this.database.getUserById(userId);
    return user ? `${user.firstName} ${user.lastName}` : userId;
  }

  /** Wylogowanie: wracamy na ekran logowania/rejestracji. */
  signOut(): void {
    this.database.signOut();
    void this.router.navigateByUrl(AUTH_ROUTE);
  }

  private loadRecords(userId: UserId): void {
    this.isLoadingRecords.set(true);
    this.database.getMedicalRecordsByUserId(userId).subscribe({
      next: (records: MedicalRecord[]) => {
        this.records.set(records);
        this.isLoadingRecords.set(false);
      },
      error: () => {
        this.records.set([]);
        this.isLoadingRecords.set(false);
      },
    });
  }
}
