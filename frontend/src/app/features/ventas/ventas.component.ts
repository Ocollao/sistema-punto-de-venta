import { Component } from '@angular/core';

@Component({
  selector: 'app-ventas',
  standalone: true,
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold text-slate-800">Historial de Ventas</h2>
      <p class="text-slate-500 mt-1">Consulta y detalle de ventas realizadas</p>
    </div>
  `,
})
export class VentasComponent {}
