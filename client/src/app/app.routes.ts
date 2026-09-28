import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { authGuard } from './core/auth.guard';
import { guestGuard } from './core/guest.guard';
import { roleGuard } from './core/role.guard';
import { DashboardComponent } from './features/dashboard/dashboard';
import { AdminPanelComponent } from './features/dashboard/admin-panel';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  {
    path: 'dashboard/admin',
    component: AdminPanelComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] }
  },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'register' },
  { path: '**', redirectTo: 'register' }
];
