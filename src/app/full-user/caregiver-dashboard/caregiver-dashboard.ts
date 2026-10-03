import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AUTH_ROUTE, Database, SENIOR_HOME_ROUTE } from '../../services/database';
import { User, UserId } from '../../models/app.models';

/** Wpis na liście profili opiekuna: własne konto albo podopieczny. */
interface RosterEntry {
  user: User;
  isSelf: boolean;
}

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
  /** Siebie samego + podopiecznych z patientIds. */
  public readonly roster = signal<RosterEntry[]>([]);

  ngOnInit(): void {
    const localUserId = this.database.getLocalUserId();

    this.database.getAccessibleProfiles().subscribe({
      next: (profiles: User[]) => {
        this.roster.set(profiles.map((user) => ({ user, isSelf: user.id === localUserId })));
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  /** Własny profil → /senior-dashboard, podopieczny → /senior-dashboard/:patientId. */
  public profileLink(patientId: UserId): string[] {
    return patientId === this.database.getLocalUserId()
      ? [SENIOR_HOME_ROUTE]
      : [SENIOR_HOME_ROUTE, patientId];
  }

  /** Wylogowanie: wracamy na ekran logowania/rejestracji. */
  public signOut(): void {
    this.database.signOut();
    void this.router.navigateByUrl(AUTH_ROUTE);
  }
}