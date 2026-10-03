import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { Login } from './both-users/login/login';
import { AuthSelect } from './both-users/auth-select/auth-select';
import { RecordForm } from './both-users/record-form/record-form';
import { RecordDetail } from './both-users/record-detail/record-detail';
import { QrDisplay } from './both-users/qr-display/qr-display';
import { SeniorDashboard } from './senior/senior-dashboard/senior-dashboard';
import { CaregiverDashboard } from './full-user/caregiver-dashboard/caregiver-dashboard';
import { DataView } from './data/data-view';
import { AUTH_ROUTE, Database } from './services/database';

/**
 * Strażnik sesji: bez zalogowanego konta (profilu) nie ma czego pokazywać,
 * więc odsyłamy na ekran logowania. Ścieżki chronione odpowiadają stałym
 * z services/database.ts (AUTH_ROUTE, SENIOR_HOME_ROUTE, CAREGIVER_HOME_ROUTE).
 */
const sessionGuard: CanActivateFn = () => {
  const database = inject(Database);
  const router = inject(Router);

  return database.hasSession() ? true : router.createUrlTree([AUTH_ROUTE]);
};

export const routes: Routes = [
  { path: '', redirectTo: AUTH_ROUTE.slice(1), pathMatch: 'full' },

  // Logowanie i rejestracja (wybór konta albo nowe konto + rola).
  { path: 'login', component: Login },
  { path: 'auth', component: AuthSelect },
  { path: 'register', component: AuthSelect },

  // Widok pacjenta: własny profil albo profil podopiecznego (kontekst opiekuna).
  { path: 'senior-dashboard/:patientId', component: SeniorDashboard, canActivate: [sessionGuard] },
  { path: 'senior-dashboard', component: SeniorDashboard, canActivate: [sessionGuard] },

  // Ekran kodu QR udostępnianego opiekunowi.
  { path: 'qr-display', component: QrDisplay, canActivate: [sessionGuard] },

  // Lazy loaded: the camera library (html5-qrcode) is only needed on this route.
  {
    path: 'qr-scanner',
    loadComponent: () => import('./full-user/qr-scanner/qr-scanner').then((m) => m.QrScanner),
    canActivate: [sessionGuard],
  },

  // Widok opiekuna: lista profili + dodawanie podopiecznych kodami QR.
  { path: 'caregiver-dashboard', component: CaregiverDashboard, canActivate: [sessionGuard] },

  // Widoki deweloperskie - poza przepływem, więc bez strażnika sesji.
  { path: 'record-form', component: RecordForm },
  { path: 'record-detail', component: RecordDetail },
  { path: 'data', component: DataView },

  { path: '**', redirectTo: AUTH_ROUTE.slice(1) },
];