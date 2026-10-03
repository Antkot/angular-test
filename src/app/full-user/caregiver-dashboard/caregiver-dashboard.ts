import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AUTH_ROUTE, Database } from '../../services/database';
import { User } from '../../models/app.models';

@Component({
  imports: [RouterLink],
  selector: 'app-caregiver-dashboard',
  styleUrl: './caregiver-dashboard.scss',
  templateUrl: './caregiver-dashboard.html',
})
export class CaregiverDashboard implements OnInit {
  private readonly database = inject(Database);
  private readonly router = inject(Router);

  public readonly isLoading = signal(true);
  /** Konto zalogowane na tym urządzeniu - jego profil jest w bazie. */
  public readonly self = signal<User | undefined>(undefined);
  /** Podopieczni dodani przez zeskanowanie kodu QR. */
  public readonly dependents = signal<User[]>([]);

  ngOnInit(): void {
    const selfId = this.database.getLocalUserId();
    this.self.set(this.database.getLocalUserProfile());

    this.database.getAccessibleProfiles().subscribe({
      next: (profiles: User[]) => {
        this.self.set(profiles.find((profile) => profile.id === selfId) ?? this.self());
        this.dependents.set(profiles.filter((profile) => profile.id !== selfId));
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  /** Wylogowanie: wracamy na ekran logowania/rejestracji. */
  public signOut(): void {
    this.database.signOut();
    void this.router.navigateByUrl(AUTH_ROUTE);
  }
}