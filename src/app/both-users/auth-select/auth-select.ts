// auth-select.ts
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth-select',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './auth-select.html',
})
export class AuthSelect {
  private readonly router = inject(Router);

  readonly accounts = signal<any[]>([]);
  readonly isAddModalOpen = signal(false);
  readonly addMode = signal<'choice' | 'local'>('choice');

  openAddModal(): void {
    this.addMode.set('choice');
    this.isAddModalOpen.set(true);
  }

  closeAddModal(): void {
    this.isAddModalOpen.set(false);
    this.addMode.set('choice');
  }

  chooseLocal(): void {
    this.addMode.set('local');
  }

  chooseGuardian(): void {
    this.closeAddModal();
    void this.router.navigate(['/qr-scanner']);
  }

  closeOnBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeAddModal();
    }
  }

  createLocalAccount(event: SubmitEvent): void {
    event.preventDefault();

    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const firstName = String(formData.get('firstName') ?? '').trim();
    const lastName = String(formData.get('lastName') ?? '').trim();

    if (!firstName || !lastName) {
      return;
    }

    this.accounts.update((accounts) => [
      ...accounts,
      {
        id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
        firstName,
        lastName,
        initials: `${firstName.charAt(0)}${lastName.charAt(0)}`.toLocaleUpperCase(),
        avatarUrl: null,
      },
    ]);

    this.closeAddModal();
  }
}