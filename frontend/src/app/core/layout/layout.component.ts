import { Component, inject, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AsyncPipe, NgIf, NgClass } from '@angular/common';
import { ToastComponent } from '../components/toast/toast.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe, NgIf, NgClass, ToastComponent],
  templateUrl: './layout.component.html',
})
export class LayoutComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  sidebarAbierto = false;

  constructor() {
    // Cierra el sidebar en cada navegación (móvil)
    this.router.events.pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => { this.sidebarAbierto = false; });
  }

  @HostListener('document:keydown.escape')
  cerrarSidebar() { this.sidebarAbierto = false; }
}
