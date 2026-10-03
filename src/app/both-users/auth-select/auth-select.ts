// auth-select.ts - ekran wyboru konta oraz rejestracji nowego użytkownika.
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AvatarColor, avatarColor } from '../../data/tag-colors';
import { AUTH_ROUTE, Database } from '../../services/database';
import { User, UserId, UserRole } from '../../models/app.models';

@Component({
  selector: 'app-auth-select',
  standalone: true,
  imports: [],
  templateUrl: './auth-select.html',
  styleUrl: './auth-select.scss',
})
export class AuthSelect implements OnInit {
  private readonly database = inject(Database);
  private readonly router = inject(Router);

  readonly accounts = signal<User[]>([]);
  readonly isLoading = signal(true);
  readonly isAddModalOpen = signal(false);
  /** Rola wybierana w formularzu nowego konta. */
  readonly newRole = signal<UserRole>('senior');
  /** Imię i nazwisko wpisane w formularzu (do podglądu awatara). */
  readonly newName = signal('');

  /** Inicjały z nazwy - "Anna Nowak" -> "AN". */
  readonly initialsPreview = computed(() => {
    const parts = this.newName().trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return 'U';
    }
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toLocaleUpperCase();
    }
    return (parts[0].charAt(0) + parts[1].charAt(0)).toLocaleUpperCase();
  });

  /** Kolor awatara liczony z nazwy - ten sam co po zapisaniu konta. */
  readonly avatarPreview = computed<AvatarColor>(() => avatarColor(this.newName() || 'nowy'));

  ngOnInit(): void {
    this.database.getUsers().subscribe({
      next: (users) => {
        this.accounts.set(users);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  /**
   * Logowanie: wybrane konto zostaje profilem tego urządzenia (sesją),
   * a ekran zależy od roli - senior ląduje na swoim widoku, opiekun na swoim.
   */
  signIn(account: User): void {
    this.database.setLocalUserId(account.id);
    void this.router.navigateByUrl(this.database.getHomeRoute(account.role));
  }

  public avatar(userId: UserId): AvatarColor {
    return avatarColor(userId);
  }

  /** Powrót do ekranu logowania. */
  goBack(): void {
    void this.router.navigateByUrl(AUTH_ROUTE);
  }

  openAddModal(): void {
    this.newRole.set('senior');
    this.newName.set('');
    this.isAddModalOpen.set(true);
  }

  closeAddModal(): void {
    this.isAddModalOpen.set(false);
  }

  closeOnBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeAddModal();
    }
  }

  onNameInput(event: Event): void {
    this.newName.set((event.target as HTMLInputElement).value);
  }

  /** Rejestracja nowego konta: zapis w bazie, zalogowanie i przejście do widoku roli. */
  createAccount(event: SubmitEvent): void {
    event.preventDefault();

    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const fullName = String(formData.get('fullName') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();

    const [firstName = '', ...rest] = fullName.split(/\s+/);
    const lastName = rest.join(' ');
    if (!firstName || !lastName) {
      return;
    }

    const account = this.database.registerUser({
      firstName,
      lastName,
      email,
      role: this.newRole(),
    });

    this.accounts.update((accounts) => [...accounts, account]);
    this.closeAddModal();
    this.signIn(account);
  }
}