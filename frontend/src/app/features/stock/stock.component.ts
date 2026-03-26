import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { StockService } from '../../core/services/stock.service';
import { ProductosService } from '../../core/services/productos.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { MovimientoStock, AjusteStock } from '../../core/models/movimiento.model';
import { Producto } from '../../core/models/producto.model';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, NgClass],
  templateUrl: './stock.component.html',
})
export class StockComponent implements OnInit {
  private svc = inject(StockService);
  private productosSvc = inject(ProductosService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  movimientos: MovimientoStock[] = [];
  productos: Producto[] = [];
  cargando = false;
  modalAbierto = false;
  guardando = false;

  tipoCtrl = new FormControl('');
  fechaInicioCtrl = new FormControl('');
  fechaFinCtrl = new FormControl('');
  productoFiltroCtrl = new FormControl<number | null>(null);

  get esAdmin() { return this.auth.esAdmin; }

  form = this.fb.group({
    producto_id: [null as number | null, Validators.required],
    tipo: ['ajuste_entrada' as 'ajuste_entrada' | 'ajuste_salida', Validators.required],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    motivo: [''],
  });

  ngOnInit() {
    this.cargarMovimientos();
    this.productosSvc.listar().subscribe({ next: p => (this.productos = p) });
  }

  cargarMovimientos() {
    this.cargando = true;
    this.svc.listarMovimientos({
      tipo: this.tipoCtrl.value || undefined,
      fecha_inicio: this.fechaInicioCtrl.value || undefined,
      fecha_fin: this.fechaFinCtrl.value || undefined,
      producto_id: this.productoFiltroCtrl.value ?? undefined,
    }).subscribe({
      next: m => { this.movimientos = m; this.cargando = false; },
      error: () => { this.cargando = false; },
    });
  }

  get stockBajoCount(): number {
    return this.productos.filter(p => p.stock <= p.stock_minimo).length;
  }

  get movimientosHoy(): number {
    const hoy = new Date().toISOString().slice(0, 10);
    return this.movimientos.filter(m => m.creado_en.startsWith(hoy)).length;
  }

  abrirModal() {
    this.form.reset({ tipo: 'ajuste_entrada', cantidad: 1, motivo: '' });
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  guardar() {
    if (this.form.invalid) return;
    this.guardando = true;
    const datos = this.form.value as AjusteStock;
    this.svc.ajustar(datos).subscribe({
      next: () => {
        this.cerrarModal();
        this.cargarMovimientos();
        this.productosSvc.listar().subscribe({ next: p => (this.productos = p) });
        this.guardando = false;
        this.toast.exito('Ajuste de stock registrado correctamente');
      },
      error: (e) => {
        this.guardando = false;
        this.toast.error(e.error?.detail || 'Error al registrar el ajuste');
      },
    });
  }

  limpiarFiltros() {
    this.tipoCtrl.reset('');
    this.fechaInicioCtrl.reset('');
    this.fechaFinCtrl.reset('');
    this.productoFiltroCtrl.reset(null);
    this.cargarMovimientos();
  }

  etiquetaTipo(tipo: string): string {
    const etiquetas: Record<string, string> = {
      venta: 'Venta',
      ajuste_entrada: 'Entrada',
      ajuste_salida: 'Salida',
    };
    return etiquetas[tipo] ?? tipo;
  }

  clasesTipo(tipo: string): string {
    const clases: Record<string, string> = {
      venta: 'bg-blue-100 text-blue-700',
      ajuste_entrada: 'bg-emerald-100 text-emerald-700',
      ajuste_salida: 'bg-red-100 text-red-700',
    };
    return clases[tipo] ?? 'bg-slate-100 text-slate-700';
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-CL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
}
