import { Component } from '@angular/core';

@Component({
  selector: 'app-caja',
  standalone: true,
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold text-slate-800">Caja</h2>
      <p class="text-slate-500 mt-1">Punto de venta — procesar ventas</p>
    </div>
  `,
})
export class CajaComponent {}
