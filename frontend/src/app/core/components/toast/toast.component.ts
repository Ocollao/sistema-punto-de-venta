import { Component, inject } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [NgFor, NgIf, NgClass],
  template: `
    <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      @for (t of svc.toasts(); track t.id) {
        <div
          class="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
                 pointer-events-auto animate-slide-in min-w-72 max-w-sm"
          [ngClass]="{
            'bg-emerald-600 text-white': t.tipo === 'exito',
            'bg-red-600 text-white':     t.tipo === 'error',
            'bg-slate-800 text-white':   t.tipo === 'info'
          }">

          <!-- Ícono -->
          <svg *ngIf="t.tipo === 'exito'" class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          <svg *ngIf="t.tipo === 'error'" class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          <svg *ngIf="t.tipo === 'info'" class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>

          <span class="flex-1">{{ t.mensaje }}</span>

          <button (click)="svc.cerrar(t.id)" class="opacity-70 hover:opacity-100 transition-opacity">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  svc = inject(ToastService);
}
