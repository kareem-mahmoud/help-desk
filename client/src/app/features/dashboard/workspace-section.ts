import { Component, inject } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-workspace-section',
  templateUrl: './workspace-section.html',
  styleUrl: './workspace-section.css'
})
export class WorkspaceSectionComponent {
  readonly page = toSignal(inject(ActivatedRoute).data, { initialValue: {} as Data });
}
