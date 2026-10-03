import { Routes } from '@angular/router';
import { AuthSelect } from './both-users/auth-select/auth-select';
import { RecordForm } from './both-users/record-form/record-form';
import { RecordDetail } from './both-users/record-detail/record-detail';
import { SeniorDashboard } from './senior/senior-dashboard/senior-dashboard';
import { QrModal } from './senior/qr-modal/qr-modal';
import { CaregiverDashboard } from './full-user/caregiver-dashboard/caregiver-dashboard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'auth', component: AuthSelect },
  { path: 'record-form', component: RecordForm },
  { path: 'record-detail', component: RecordDetail },
  { path: 'senior-dashboard', component: SeniorDashboard },
  { path: 'qr-modal', component: QrModal },
  { path: 'caregiver-dashboard', component: CaregiverDashboard }
];
