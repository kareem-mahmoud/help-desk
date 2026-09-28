import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-top-header',
  templateUrl: './top-header.html',
  styleUrl: './top-header.css'
})
export class TopHeaderComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  async signOut(): Promise<void> {
    await firstValueFrom(this.authService.logout());
    await this.router.navigate(['/login']);
  }
}
