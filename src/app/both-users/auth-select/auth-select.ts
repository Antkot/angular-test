// auth-select.ts - ekran rejestracji/wyboru konta: nowe konto + rola.
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AvatarColor, avatarColor } from '../../data/tag-colors';
import { Database } from '../../services/database';
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
  /** 'choice' = ekran wyboru roli, wartość inna niż 'choice' = wybrana rola konta. */
  readonly addMode = signal<'choice' | UserRole>('choice');

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

  openAddModal(): void {
    this.addMode.set('choice');
    this.isAddModalOpen.set(true);
  }

  closeAddModal(): void {
    this.isAddModalOpen.set(false);
    this.addMode.set('choice');
  }

  chooseRole(role: UserRole): void {
    this.addMode.set(role);
  }

  closeOnBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeAddModal();
    }
  }

  /** Rejestracja nowego konta: zapis w bazie, zalogowanie i przejście do widoku roli. */
  createAccount(event: SubmitEvent): void {
    event.preventDefault();

    const role = this.addMode();
    if (role === 'choice') {
      return;
    }

    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const firstName = String(formData.get('firstName') ?? '').trim();
    const lastName = String(formData.get('lastName') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();

    if (!firstName || !lastName) {
      return;
    }

    const account = this.database.registerUser({ firstName, lastName, email, role });
    this.accounts.update((accounts) => [...accounts, account]);
    this.closeAddModal();
    this.signIn(account);
  }
}