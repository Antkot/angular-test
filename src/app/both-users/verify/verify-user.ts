import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TopBar } from '../../shared/top-bar/top-bar';

/**
 * Weryfikacja użytkownika - ekran wyboru z projektu:
 * albo skanujemy kod pacjenta, albo pokazujemy własny kod.
 */
@Component({
  selector: 'app-verify-user',
  imports: [RouterLink, TopBar],
  templateUrl: './verify-user.html',
  styleUrl: './verify-user.scss',
})
export class VerifyUser {}