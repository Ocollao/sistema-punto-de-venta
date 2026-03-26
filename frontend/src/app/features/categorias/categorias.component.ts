import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { CategoriasService } from '../../core/services/categorias.service';
import { Categoria, CategoriaForm } from '../../core/models/categoria.model';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, DatePipe],
  templateUrl: './categorias.component.html',
})
export class CategoriasComponent implements OnInit {
  private svc = inject(CategoriasService);
  private fb  = inject(FormBuilder);

  categorias: Categoria[] = [];
  cargando     = false;
  modalAbierto = false;
  guardando    = false;
  categoriaEditando: Categoria | null = null;

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

    const op$ = this.categoriaEditando
      ? this.svc.actualizar(this.categoriaEditando.id, datos)
      : this.svc.crear(datos);

    op$.subscribe({
      next: () => { this.cerrarModal(); this.cargarCategorias(); this.guardando = false; },
      error: () => { this.guardando = false; },
    });
  }

  eliminar(cat: Categoria) {
    if (!confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) return;
    this.svc.eliminar(cat.id).subscribe({ next: () => this.cargarCategorias() });
  }
}
