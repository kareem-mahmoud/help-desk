import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import {
  email,
  FieldTree,
  FormField,
  FormRoot,
  form,
  required
} from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService, LoginRequest } from '../../../core/auth.service';

interface LoginModel extends LoginRequest {}

interface LoginErrorResponse {
  error?: string;
  errors?: Array<{ field: string; message: string }>;
}

@Component({
  selector: 'app-login',
  imports: [FormField, FormRoot, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly justRegistered = Boolean(
    this.router.getCurrentNavigation()?.extras.state?.['registered'] ?? history.state?.registered
  );

  readonly loginModel = signal<LoginModel>({ email: '', password: '' });

  readonly loginForm = form(
    this.loginModel,
    (path) => {
      required(path.email, { message: 'Your email is required.' });
      email(path.email, { message: 'Enter a valid email address.' });
      required(path.password, { message: 'Your password is required.' });
    },
    {
      submission: {
        action: async (fields) => {
          const { email: address, password } = fields().value();

          try {
            await firstValueFrom(
              this.authService.login({ email: address.trim(), password })
            );
            await this.router.navigate(['/dashboard']);
            return null;
          } catch (error) {
            return this.toSubmissionErrors(error, fields);
          }
        }
      }
    }
  );

  private toSubmissionErrors(error: unknown, fields: FieldTree<LoginModel>) {
    const details = error instanceof HttpErrorResponse
      ? error.error as LoginErrorResponse | null
      : null;

    if (details?.errors?.length) {
      return details.errors.map((item) => {
        const target = item.field === 'email'
          ? fields.email
          : item.field === 'password'
            ? fields.password
            : undefined;
        return target
          ? { kind: 'server', message: item.message, fieldTree: target }
          : { kind: 'server', message: item.message };
      });
    }

    const message = error instanceof HttpErrorResponse
      ? error.status === 0
        ? 'We could not reach the server. Please try again.'
        : details?.error ?? 'Sign-in failed. Please try again.'
      : 'Sign-in failed. Please try again.';

    return { kind: 'login', message, fieldTree: fields };
  }
}
