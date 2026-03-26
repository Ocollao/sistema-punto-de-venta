import { Component } from '@angular/core';

@Component({
  selector: 'app-productos',
  standalone: true,
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold text-slate-800">Productos</h2>
      <p class="text-slate-500 mt-1">Gestión de productos e inventario</p>
    </div>
  `,
})
export class ProductosComponent {}
