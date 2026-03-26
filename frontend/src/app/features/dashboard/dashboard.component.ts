import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold text-slate-800">Dashboard</h2>
      <p class="text-slate-500 mt-1">Resumen de ventas y estadísticas</p>
    </div>
  `,
})
export class DashboardComponent {}
