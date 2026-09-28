import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-admin-panel',
  imports: [RouterLink],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css'
})
export class AdminPanelComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  async signOut(): Promise<void> {
    await firstValueFrom(this.authService.logout());
    await this.router.navigate(['/login']);
  }
}
