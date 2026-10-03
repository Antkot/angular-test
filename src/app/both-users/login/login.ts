import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './login.html',
})
export class Login {
  onLogin(event: SubmitEvent): void {
    event.preventDefault();

    // TODO: podłączyć logowanie przez email i hasło.
  }

  onGoogleLogin(): void {
    // TODO: podłączyć logowanie przez Google.
  }
}