import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar';
import { TopHeaderComponent } from '../top-header/top-header';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, SidebarComponent, TopHeaderComponent],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayoutComponent {}
