import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TopBar } from '../../shared/top-bar/top-bar';
import { AvatarColor, avatarColor } from '../../data/tag-colors';
import { Database } from '../../services/database';
import { User } from '../../models/app.models';

/** Ustawienia -> Ogólne: profil, preferencje i reset danych. */
@Component({
  selector: 'app-general-settings',
  imports: [TopBar],
  templateUrl: './general-settings.html',
  styleUrl: './general-settings.scss',
})
export class GeneralSettings {
  private readonly database = inject(Database);
  private readonly router = inject(Router);

  readonly profile = signal<User | undefined>(this.database.getLocalUserProfile());
  readonly notifications = signal(true);
  readonly biometrics = signal(true);

  avatar(userId: string): AvatarColor {
    return avatarColor(userId);
  }

  toggle(field: 'notifications' | 'biometrics'): void {
    this[field].update((value) => !value);
  }

  /** Reset bazy demonstracyjnej i powrót do logowania. */
  resetData(): void {
    this.database.resetData();
    this.database.signOut();
    void this.router.navigateByUrl('/login');
  }
}