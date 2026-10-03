import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TopBar } from '../shared/top-bar/top-bar';
import { AvatarColor, avatarColor } from '../data/tag-colors';
import { AUTH_ROUTE, Database } from '../services/database';
import { User } from '../models/app.models';

@Component({
  selector: 'app-settings',
  imports: [RouterLink, TopBar],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  private readonly database = inject(Database);
  private readonly router = inject(Router);

  /** Zalogowane konto - sekcja na dole ekranu. */
  readonly profile = signal<User | undefined>(this.database.getLocalUserProfile());

  avatar(userId: string): AvatarColor {
    return avatarColor(userId);
  }

  /** Wylogowanie: wracamy na ekran logowania. */
  signOut(): void {
    this.database.signOut();
    void this.router.navigateByUrl(AUTH_ROUTE);
  }
}