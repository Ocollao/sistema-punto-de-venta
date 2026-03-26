import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ClientesService } from '../../core/services/clientes.service';
import { ToastService } from '../../core/services/toast.service';
import { Cliente, ClienteForm } from '../../core/models/cliente.model';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, DatePipe],
  templateUrl: './clientes.component.html',
})
export class ClientesComponent implements OnInit {
  private svc   = inject(ClientesService);
  private toast = inject(ToastService);
  private fb    = inject(FormBuilder);

  clientes: Cliente[] = [];
  cargando     = false;
  modalAbierto = false;
  guardando    = false;
  clienteEditando: Cliente | null = null;
  modalEliminarAbierto = false;
  clienteAEliminar: Cliente | null = null;

  busquedaCtrl = new FormControl('');

  form = this.fb.group({
    nombre:   ['', Validators.required],
    rut:      [''],
    email:    ['', Validators.email],
    telefono: [''],
  });

  ngOnInit() {
    this.cargarClientes();
    this.busquedaCtrl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => this.cargarClientes());
  }

  cargarClientes() {
    this.cargando = true;
    this.svc.listar(this.busquedaCtrl.value || undefined).subscribe({
      next: c => { this.clientes = c; this.cargando = false; },
      error: () => { this.cargando = false; },
    });
  }

  abrirModal(cliente?: Cliente) {
    this.clienteEditando = cliente ?? null;
    if (cliente) {
      this.form.patchValue({
        nombre: cliente.nombre, rut: cliente.rut ?? '',
        email: cliente.email ?? '', telefono: cliente.telefono ?? '',
      });
    } else {
      this.form.reset();
    }
    this.modalAbierto = true;
  }

  cerrarModal() { this.modalAbierto = false; this.clienteEditando = null; }

  guardar() {
    if (this.form.invalid) return;
    this.guardando = true;
    const datos = this.form.value as ClienteForm;
    const esEdicion = !!this.clienteEditando;

    const op$ = esEdicion
      ? this.svc.actualizar(this.clienteEditando!.id, datos)
      : this.svc.crear(datos);

    op$.subscribe({
      next: () => {
        this.cerrarModal();
        this.cargarClientes();
        this.guardando = false;
        this.toast.exito(esEdicion ? 'Cliente actualizado correctamente' : 'Cliente registrado correctamente');
      },
      error: () => {
        this.guardando = false;
        this.toast.error('Error al guardar el cliente. Intenta nuevamente.');
      },
    });
  }

  eliminar(cliente: Cliente) {
    this.clienteAEliminar = cliente;
    this.modalEliminarAbierto = true;
  }

  confirmarEliminar() {
    if (!this.clienteAEliminar) return;
    const nombre = this.clienteAEliminar.nombre;
    this.svc.eliminar(this.clienteAEliminar.id).subscribe({
      next: () => {
        this.cargarClientes();
        this.toast.exito(`Cliente "${nombre}" eliminado`);
      },
      error: () => this.toast.error('Error al eliminar el cliente'),
    });
    this.modalEliminarAbierto = false;
    this.clienteAEliminar = null;
  }

  cancelarEliminar() {
    this.modalEliminarAbierto = false;
    this.clienteAEliminar = null;
  }
}
