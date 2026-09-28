import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { authGuard } from './core/auth.guard';
import { guestGuard } from './core/guest.guard';
import { roleGuard } from './core/role.guard';
import { DashboardComponent } from './features/dashboard/dashboard';
import { AdminPanelComponent } from './features/dashboard/admin-panel';
import { WorkspaceSectionComponent } from './features/dashboard/workspace-section';
import { MainLayoutComponent } from './layout/main-layout/main-layout';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  {
    path: 'dashboard',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: DashboardComponent },
      {
        path: 'tickets',
        component: WorkspaceSectionComponent,
        data: { title: 'Tickets', description: 'Browse and follow your support requests.' }
      },
      {
        path: 'customers',
        component: WorkspaceSectionComponent,
        canActivate: [roleGuard],
        data: { title: 'Customers', description: 'Customer profiles and support history.', roles: ['agent', 'admin'] }
      },
      {
        path: 'team',
        component: WorkspaceSectionComponent,
        canActivate: [roleGuard],
        data: { title: 'Team', description: 'Manage your support team.', roles: ['admin'] }
      },
      {
        path: 'reports',
        component: WorkspaceSectionComponent,
        canActivate: [roleGuard],
        data: { title: 'Reports', description: 'Review service activity and performance.', roles: ['admin'] }
      },
      {
        path: 'settings',
        component: WorkspaceSectionComponent,
        data: { title: 'Settings', description: 'Manage your account preferences.' }
      },
      {
        path: 'admin',
        component: AdminPanelComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin'] }
      }
    ]
  },
  { path: '', pathMatch: 'full', redirectTo: 'register' },
  { path: '**', redirectTo: 'register' }
];
