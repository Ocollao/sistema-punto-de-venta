import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { CategoriasService } from '../../core/services/categorias.service';
import { ToastService } from '../../core/services/toast.service';
import { Categoria, CategoriaForm } from '../../core/models/categoria.model';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, DatePipe],
  templateUrl: './categorias.component.html',
})
export class CategoriasComponent implements OnInit {
  private svc   = inject(CategoriasService);
  private toast = inject(ToastService);
  private fb    = inject(FormBuilder);

  categorias: Categoria[] = [];
  cargando     = false;
  modalAbierto = false;
  guardando    = false;
  categoriaEditando: Categoria | null = null;
  modalEliminarAbierto = false;
  categoriaAEliminar: Categoria | null = null;

  form = this.fb.group({
    nombre:      ['', Validators.required],
    descripcion: [''],
  });

  ngOnInit() { this.cargarCategorias(); }

  cargarCategorias() {
    this.cargando = true;
    this.svc.listar().subscribe({
      next: c => { this.categorias = c; this.cargando = false; },
      error: () => { this.cargando = false; },
    });
  }

  abrirModal(cat?: Categoria) {
    this.categoriaEditando = cat ?? null;
    if (cat) {
      this.form.patchValue({ nombre: cat.nombre, descripcion: cat.descripcion ?? '' });
    } else {
      this.form.reset();
    }
    this.modalAbierto = true;
  }

  cerrarModal() { this.modalAbierto = false; this.categoriaEditando = null; }

  guardar() {
    if (this.form.invalid) return;
    this.guardando = true;
    const datos = this.form.value as CategoriaForm;
    const esEdicion = !!this.categoriaEditando;

    const op$ = esEdicion
      ? this.svc.actualizar(this.categoriaEditando!.id, datos)
      : this.svc.crear(datos);

    op$.subscribe({
      next: () => {
        this.cerrarModal();
        this.cargarCategorias();
        this.guardando = false;
        this.toast.exito(esEdicion ? 'Categoría actualizada correctamente' : 'Categoría creada correctamente');
      },
      error: () => {
        this.guardando = false;
        this.toast.error('Error al guardar la categoría. Intenta nuevamente.');
      },
    });
  }

  eliminar(cat: Categoria) {
    this.categoriaAEliminar = cat;
    this.modalEliminarAbierto = true;
  }

  confirmarEliminar() {
    if (!this.categoriaAEliminar) return;
    const nombre = this.categoriaAEliminar.nombre;
    this.svc.eliminar(this.categoriaAEliminar.id).subscribe({
      next: () => {
        this.cargarCategorias();
        this.toast.exito(`Categoría "${nombre}" eliminada`);
      },
      error: () => this.toast.error('Error al eliminar la categoría'),
    });
    this.modalEliminarAbierto = false;
    this.categoriaAEliminar = null;
  }

  cancelarEliminar() {
    this.modalEliminarAbierto = false;
    this.categoriaAEliminar = null;
  }
}
