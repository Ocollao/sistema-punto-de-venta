import { Component, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ProductosService } from '../../core/services/productos.service';
import { VentasService } from '../../core/services/ventas.service';
import { Producto } from '../../core/models/producto.model';
import { Venta } from '../../core/models/venta.model';

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

@Component({
  selector: 'app-caja',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, NgClass],
  templateUrl: './caja.component.html',
})
export class CajaComponent implements OnInit {
  private productosSvc = inject(ProductosService);
  private ventasSvc = inject(VentasService);

  productos: Producto[] = [];
  carrito: ItemCarrito[] = [];

  busquedaCtrl = new FormControl('');
  descuentoCtrl = new FormControl(0);

  metodoPago: 'efectivo' | 'debito' | 'credito' = 'efectivo';
  procesando = false;
  ventaExitosa: Venta | null = null;
  vistaMovil: 'productos' | 'carrito' = 'productos';

  readonly metodosPago = [
    { valor: 'efectivo', etiqueta: 'Efectivo' },
    { valor: 'debito',   etiqueta: 'Débito' },
    { valor: 'credito',  etiqueta: 'Crédito' },
  ] as const;

  get descuento(): number { return this.descuentoCtrl.value ?? 0; }
  get subtotal(): number {
    return this.carrito.reduce((acc, i) => acc + i.producto.precio * i.cantidad, 0);
  }
  get total(): number { return Math.max(0, this.subtotal - this.descuento); }
  get totalItems(): number { return this.carrito.reduce((acc, i) => acc + i.cantidad, 0); }

  ngOnInit() {
    this.cargarProductos();
    this.busquedaCtrl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.cargarProductos());
  }

  cargarProductos() {
    this.productosSvc.listar({ busqueda: this.busquedaCtrl.value || undefined })
      .subscribe({ next: p => (this.productos = p.filter(x => x.activo && x.stock > 0)) });
  }

  agregarAlCarrito(producto: Producto) {
    const item = this.carrito.find(i => i.producto.id === producto.id);
    if (item) {
      if (item.cantidad < producto.stock) item.cantidad++;
    } else {
      this.carrito = [...this.carrito, { producto, cantidad: 1 }];
    }
  }

  cambiarCantidad(item: ItemCarrito, delta: number) {
    const nueva = item.cantidad + delta;
    if (nueva <= 0) {
      this.carrito = this.carrito.filter(i => i !== item);
    } else if (nueva <= item.producto.stock) {
      item.cantidad = nueva;
    }
  }

  removerDelCarrito(item: ItemCarrito) {
    this.carrito = this.carrito.filter(i => i !== item);
  }

  limpiarCarrito() {
    this.carrito = [];
    this.descuentoCtrl.setValue(0);
  }

  procesarVenta() {
    if (this.carrito.length === 0) return;
    this.procesando = true;

    this.ventasSvc.crear({
      items: this.carrito.map(i => ({
        producto_id: i.producto.id,
        cantidad: i.cantidad,
        precio_unitario: i.producto.precio,
      })),
      descuento: this.descuento,
      metodo_pago: this.metodoPago,
    }).subscribe({
      next: v => { this.ventaExitosa = v; this.limpiarCarrito(); this.procesando = false; this.vistaMovil = 'productos'; },
      error: () => { this.procesando = false; },
    });
  }

  cerrarModalExito() {
    this.ventaExitosa = null;
    this.cargarProductos();
  }

  formatearMonto(valor: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency', currency: 'CLP', minimumFractionDigits: 0,
    }).format(valor);
  }
}
