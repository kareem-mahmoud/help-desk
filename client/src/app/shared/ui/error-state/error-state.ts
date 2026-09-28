import { Component, input } from '@angular/core';

@Component({
  selector: 'app-error-state',
  templateUrl: './error-state.html',
  styleUrl: './error-state.css'
})
export class ErrorStateComponent {
  readonly message = input<string | null>(null);
}
