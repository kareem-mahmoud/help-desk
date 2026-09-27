import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  readonly justRegistered = Boolean(
    inject(Router).getCurrentNavigation()?.extras.state?.['registered'] ?? history.state?.registered
  );
}
