import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, UserRole } from '../../core/auth.service';

interface NavigationItem {
  label: string;
  path: string;
  icon: string;
  roles?: UserRole[];
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {
  readonly authService = inject(AuthService);

  readonly navigationItems: NavigationItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: 'space_dashboard' },
    { label: 'Tickets', path: '/dashboard/tickets', icon: 'confirmation_number' },
    { label: 'Customers', path: '/dashboard/customers', icon: 'groups', roles: ['agent', 'admin'] },
    { label: 'Team', path: '/dashboard/team', icon: 'support_agent', roles: ['admin'] },
    { label: 'Reports', path: '/dashboard/reports', icon: 'bar_chart', roles: ['admin'] },
    { label: 'Settings', path: '/dashboard/settings', icon: 'settings' }
  ];

  canView(item: NavigationItem): boolean {
    return !item.roles || item.roles.some((role) => this.authService.hasRole(role));
  }
}
