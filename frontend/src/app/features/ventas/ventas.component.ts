import { Component, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor, NgClass, DatePipe } from '@angular/common';
import { VentasService } from '../../core/services/ventas.service';
import { Venta } from '../../core/models/venta.model';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, NgClass, DatePipe],
  templateUrl: './ventas.component.html',
})
export class VentasComponent implements OnInit {
  private svc = inject(VentasService);

  ventas: Venta[] = [];
  cargando = false;
  ventaDetalle: Venta | null = null;

  fechaInicioCtrl = new FormControl('');
  fechaFinCtrl    = new FormControl('');

  ngOnInit() { this.cargarVentas(); }

  cargarVentas() {
    this.cargando = true;
    this.svc.listar(
      this.fechaInicioCtrl.value || undefined,
      this.fechaFinCtrl.value    || undefined,
    ).subscribe({
      next: v => { this.ventas = v; this.cargando = false; },
      error: () => { this.cargando = false; },
    });
  }

  verDetalle(venta: Venta) {
    this.svc.obtener(venta.id).subscribe({ next: v => (this.ventaDetalle = v) });
  }

  cerrarDetalle() { this.ventaDetalle = null; }

  formatearMonto(valor: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency', currency: 'CLP', minimumFractionDigits: 0,
    }).format(valor);
  }

  etiquetaMetodo(metodo: string): string {
    const mapa: Record<string, string> = { efectivo: 'Efectivo', debito: 'Débito', credito: 'Crédito' };
    return mapa[metodo] ?? metodo;
  }
}
