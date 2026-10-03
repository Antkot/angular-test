import { Component, input, output, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Database } from '../../services/database';

/**
 * Wspólny górny pasek: strzałka powrotu (jeśli nie ekran główny), tytuł bieżącego
 * ekranu i prawa kolumna - akcja (np. „Zapisz") albo ikona ustawień.
 */
@Component({
  selector: 'app-top-bar',
  imports: [RouterLink],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.scss',
})
export class TopBar {
  private readonly router = inject(Router);
  private readonly database = inject(Database);

  readonly title = input<string>('');
  readonly showBack = input<boolean>(true);
  readonly showSettings = input<boolean>(true);
  /** Adres powrotu - domyślnie ekran główny roli zalogowanego konta. */
  readonly backUrl = input<string | undefined>(undefined);
  /** Etykieta przycisku w prawej kolumnie (zastępuje zębatkę). */
  readonly actionLabel = input<string>('');
  readonly action = output<void>();

  goBack(): void {
    void this.router.navigateByUrl(this.backUrl() ?? this.database.getHomeRoute());
  }
}