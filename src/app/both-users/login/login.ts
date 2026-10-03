import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Database } from '../../services/database';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './login.html',
})
export class Login {
  private readonly database = inject(Database);
  private readonly router = inject(Router);

  readonly errorMessage = signal<string | null>(null);

  onLogin(event: SubmitEvent): void {
    event.preventDefault();

    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');

    const account = this.database.login(email, password);
    if (!account) {
      this.errorMessage.set('Nieprawidłowy e-mail lub hasło.');
      return;
    }

    this.errorMessage.set(null);
    this.database.setLocalUserId(account.id);
    // Rola konta z bazy decyduje o ekranie: senior / opiekun.
    void this.router.navigateByUrl(this.database.getHomeRoute(account.role));
  }

  onGoogleLogin(): void {
    // MVP: logowanie społecznościowe nie jest obsłużone.
    this.errorMessage.set('Logowanie przez Google nie jest dostępne w wersji MVP.');
  }
}