import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ProductosService } from '../../core/services/productos.service';
import { CategoriasService } from '../../core/services/categorias.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Producto, ProductoForm } from '../../core/models/producto.model';
import { Categoria } from '../../core/models/categoria.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, NgClass],
  templateUrl: './productos.component.html',
})
export class ProductosComponent implements OnInit {
  private svc = inject(ProductosService);
  private catSvc = inject(CategoriasService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  productos: Producto[] = [];
  categorias: Categoria[] = [];
  cargando = false;
  modalAbierto = false;
  guardando = false;
  productoEditando: Producto | null = null;

  modalEliminarAbierto = false;
  productoAEliminar: Producto | null = null;

  imagenFile: File | null = null;
  imagenPreview: string | null = null;

  busquedaCtrl = new FormControl('');
  stockBajoCtrl = new FormControl(false);

  get esAdmin() { return this.auth.esAdmin; }

  form = this.fb.group({
    codigo: ['', Validators.required],
    nombre: ['', Validators.required],
    descripcion: [''],
    precio: [0, [Validators.required, Validators.min(0.01)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    stock_minimo: [5, Validators.min(0)],
    categoria_id: [null as number | null],
  });

  ngOnInit() {
    this.cargarProductos();
    this.cargarCategorias();

    this.busquedaCtrl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => this.cargarProductos());

    this.stockBajoCtrl.valueChanges
      .subscribe(() => this.cargarProductos());
  }

  cargarProductos() {
    this.cargando = true;
    this.svc.listar({
      busqueda: this.busquedaCtrl.value || undefined,
      stock_bajo: this.stockBajoCtrl.value ?? undefined,
    }).subscribe({
      next: p => { this.productos = p; this.cargando = false; },
      error: () => { this.cargando = false; },
    });
  }

  cargarCategorias() {
    this.catSvc.listar().subscribe({ next: c => (this.categorias = c) });
  }

  abrirModal(producto?: Producto) {
    this.productoEditando = producto ?? null;
    this.imagenFile = null;
    this.imagenPreview = null;
    if (producto) {
      this.form.patchValue({
        codigo: producto.codigo,
        nombre: producto.nombre,
        descripcion: producto.descripcion ?? '',
        precio: producto.precio,
        stock: producto.stock,
        stock_minimo: producto.stock_minimo,
        categoria_id: producto.categoria_id ?? null,
      });
    } else {
      this.form.reset({ stock: 0, stock_minimo: 5, precio: 0, categoria_id: null });
    }
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.productoEditando = null;
    this.imagenFile = null;
    this.imagenPreview = null;
  }

  seleccionarImagen(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.imagenFile = file;
    const reader = new FileReader();
    reader.onload = () => { this.imagenPreview = reader.result as string; };
    reader.readAsDataURL(file);
  }

  imagenActual(): string | null {
    if (this.imagenPreview) return this.imagenPreview;
    if (this.productoEditando?.imagen_url) {
      return `${environment.staticUrl}${this.productoEditando.imagen_url}`;
    }
    return null;
  }

  imagenUrl(producto: Producto): string | null {
    return producto.imagen_url ? `${environment.staticUrl}${producto.imagen_url}` : null;
  }

  guardar() {
    if (this.form.invalid) return;
    this.guardando = true;
    const datos = this.form.value as ProductoForm;
    const esEdicion = !!this.productoEditando;

    const op$ = this.productoEditando
      ? this.svc.actualizar(this.productoEditando.id, datos)
      : this.svc.crear(datos);

    op$.subscribe({
      next: (p) => {
        const finish = (msg: string) => {
          this.cerrarModal();
          this.cargarProductos();
          this.guardando = false;
          this.toast.exito(msg);
        };
        if (this.imagenFile) {
          this.svc.subirImagen(p.id, this.imagenFile).subscribe({
            next: () => finish(esEdicion ? 'Producto actualizado correctamente' : 'Producto creado correctamente'),
            error: () => {
              this.cerrarModal();
              this.cargarProductos();
              this.guardando = false;
              this.toast.error('Producto guardado pero hubo un error al subir la imagen');
            },
          });
        } else {
          finish(esEdicion ? 'Producto actualizado correctamente' : 'Producto creado correctamente');
        }
      },
      error: () => {
        this.guardando = false;
        this.toast.error('Error al guardar el producto. Intenta nuevamente.');
      },
    });
  }

  eliminar(p: Producto) {
    this.productoAEliminar = p;
    this.modalEliminarAbierto = true;
  }

  confirmarEliminar() {
    if (!this.productoAEliminar) return;
    const nombre = this.productoAEliminar.nombre;
    this.svc.eliminar(this.productoAEliminar.id).subscribe({
      next: () => {
        this.cargarProductos();
        this.toast.exito(`Producto "${nombre}" eliminado`);
      },
      error: () => this.toast.error('Error al eliminar el producto'),
    });
    this.modalEliminarAbierto = false;
    this.productoAEliminar = null;
  }

  cancelarEliminar() {
    this.modalEliminarAbierto = false;
    this.productoAEliminar = null;
  }

  exportarStockBajoCSV() {
    const bajos = this.productos.filter(p => p.stock <= p.stock_minimo);
    if (bajos.length === 0) {
      this.toast.info('No hay productos con stock bajo');
      return;
    }

    const cabecera = ['Código', 'Nombre', 'Categoría', 'Stock actual', 'Stock mínimo', 'Precio'];
    const filas = bajos.map(p => [
      p.codigo, p.nombre, p.categoria_nombre ?? 'Sin categoría',
      p.stock, p.stock_minimo, p.precio,
    ]);

    const csv = [cabecera, ...filas]
      .map(f => f.map(c => `"${c}"`).join(';'))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `stock_bajo_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast.exito(`${bajos.length} productos exportados`);
  }

  formatearMonto(valor: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency', currency: 'CLP', minimumFractionDigits: 0,
    }).format(valor);
  }
}
