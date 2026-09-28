import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { ErrorStateComponent } from '../../shared/ui/error-state/error-state';
import { LoadingStateComponent } from '../../shared/ui/loading-state/loading-state';

@Component({
  selector: 'app-dashboard',
  imports: [ErrorStateComponent, LoadingStateComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  readonly authService = inject(AuthService);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly summaryCards = [
    { title: 'Open tickets', value: '—', detail: 'Ticket totals will appear here', icon: 'confirmation_number' },
    { title: 'Waiting for reply', value: '—', detail: 'Pending responses will appear here', icon: 'mark_email_unread' },
    { title: 'Resolved', value: '—', detail: 'Resolution totals will appear here', icon: 'task_alt' },
    { title: 'Avg. response time', value: '—', detail: 'Response metrics will appear here', icon: 'schedule' }
  ];
}
