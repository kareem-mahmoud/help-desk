import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import {
  email,
  FieldTree,
  FormField,
  FormRoot,
  form,
  maxLength,
  minLength,
  required,
  validate
} from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService, RegisterRequest } from '../../../core/auth.service';
import { AuthLayoutComponent } from '../../../shared/layouts/auth-layout/auth-layout';

interface RegistrationModel extends RegisterRequest {
  confirmPassword: string;
}

interface RegistrationError {
  error?: string;
  errors?: Array<{ field: string; message: string }>;
}

@Component({
  selector: 'app-register',
  imports: [AuthLayoutComponent, FormField, FormRoot, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly registrationModel = signal<RegistrationModel>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  readonly registrationForm = form(
    this.registrationModel,
    (path) => {
      required(path.name, { message: 'Your name is required.' });
      minLength(path.name, 2, { message: 'Please enter at least 2 characters.' });
      maxLength(path.name, 100, { message: 'Your name must be 100 characters or fewer.' });

      required(path.email, { message: 'Your email is required.' });
      email(path.email, { message: 'Enter a valid email address.' });

      required(path.password, { message: 'A password is required.' });
      minLength(path.password, 8, { message: 'Use at least 8 characters.' });
      maxLength(path.password, 72, { message: 'Password must be 72 characters or fewer.' });
      validate(path.password, ({ value }) => {
        if (value() && new TextEncoder().encode(value()).length > 72) {
          return {
            kind: 'maxPasswordBytes',
            message: 'Password must not exceed 72 bytes.'
          };
        }
        return null;
      });

      required(path.confirmPassword, { message: 'Please confirm your password.' });
      validate(path.confirmPassword, ({ value, valueOf }) => {
        if (value() && value() !== valueOf(path.password)) {
          return {
            kind: 'passwordMismatch',
            message: 'Those passwords don’t match.'
          };
        }
        return null;
      });
    },
    {
      submission: {
        action: async (fields) => {
          const { name, email: address, password } = fields().value();

          try {
            await firstValueFrom(
              this.authService.register({
                name: name.trim(),
                email: address.trim(),
                password
              })
            );
            await this.router.navigate(['/login'], { state: { registered: true } });
            return null;
          } catch (error) {
            return this.toSubmissionErrors(error, fields);
          }
        }
      }
    }
  );

  private toSubmissionErrors(error: unknown, fields: FieldTree<RegistrationModel>) {
    const details = error instanceof HttpErrorResponse
      ? error.error as RegistrationError | null
      : null;
    const fieldTrees = {
      name: fields.name,
      email: fields.email,
      password: fields.password
    };

    if (details?.errors?.length) {
      return details.errors.map((item) => {
        const target = fieldTrees[item.field as keyof typeof fieldTrees];
        return target
          ? { kind: 'server', message: item.message, fieldTree: target }
          : { kind: 'server', message: item.message };
      });
    }

    if (error instanceof HttpErrorResponse && error.status === 409) {
      return {
        kind: 'emailTaken',
        message: details?.error ?? 'This email is already registered.',
        fieldTree: fields.email
      };
    }

    return {
      kind: 'server',
      message: error instanceof HttpErrorResponse && error.status === 0
        ? 'We could not reach the server. Please try again.'
        : details?.error ?? 'Registration failed. Please try again.',
      fieldTree: fields
    };
  }
}
