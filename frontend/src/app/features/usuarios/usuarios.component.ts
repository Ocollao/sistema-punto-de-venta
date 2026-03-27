import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { UsuariosService } from '../../core/services/usuarios.service';
import { ToastService } from '../../core/services/toast.service';
import { Usuario } from '../../core/models/usuario.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, NgClass],
  templateUrl: './usuarios.component.html',
})
export class UsuariosComponent implements OnInit {
  private svc   = inject(UsuariosService);
  private toast = inject(ToastService);
  private fb    = inject(FormBuilder);

  usuarios: Usuario[] = [];
  cargando   = false;
  guardando  = false;
  mostrarModal = false;
  editando: Usuario | null = null;

  form = this.fb.group({
    nombre:   ['', Validators.required],
    email:    ['', [Validators.required, Validators.email]],
    password: [''],
    rol:      ['cajero', Validators.required],
  });

  ngOnInit() { this.cargar(); }

  cargar() {
    this.cargando = true;
    this.svc.listar().subscribe({
      next: u => { this.usuarios = u; this.cargando = false; },
      error: () => { this.cargando = false; },
    });
  }

  abrirCrear() {
    this.editando = null;
    this.form.reset({ nombre: '', email: '', password: '', rol: 'cajero' });
    this.form.get('email')!.enable();
    this.form.get('password')!.setValidators(Validators.required);
    this.form.get('password')!.updateValueAndValidity();
    this.mostrarModal = true;
  }

  abrirEditar(usuario: Usuario) {
    this.editando = usuario;
    this.form.patchValue({ nombre: usuario.nombre, email: usuario.email, password: '', rol: usuario.rol });
    this.form.get('email')!.disable();
    this.form.get('password')!.clearValidators();
    this.form.get('password')!.updateValueAndValidity();
    this.mostrarModal = true;
  }

  cerrarModal() { this.mostrarModal = false; }

  guardar() {
    if (this.form.invalid) return;
    this.guardando = true;
    const raw = this.form.getRawValue();

    if (this.editando) {
      const datos: Record<string, unknown> = { nombre: raw.nombre, rol: raw.rol };
      if (raw.password) datos['password'] = raw.password;
      this.svc.actualizar(this.editando.id, datos).subscribe({
        next: updated => {
          this.guardando = false;
          this.mostrarModal = false;
          this.usuarios = this.usuarios.map(u => u.id === updated.id ? updated : u);
          this.toast.exito('Usuario actualizado');
        },
        error: () => { this.guardando = false; this.toast.error('Error al actualizar'); },
      });
    } else {
      this.svc.crear({ nombre: raw.nombre!, email: raw.email!, password: raw.password!, rol: raw.rol! }).subscribe({
        next: nuevo => {
          this.guardando = false;
          this.mostrarModal = false;
          this.usuarios = [nuevo, ...this.usuarios];
          this.toast.exito('Usuario creado');
        },
        error: (e) => {
          this.guardando = false;
          this.toast.error(e.error?.detail ?? 'Error al crear usuario');
        },
      });
    }
  }

  toggleActivo(usuario: Usuario) {
    const accion = usuario.activo ? 'desactivar' : 'activar';
    this.svc.actualizar(usuario.id, { activo: !usuario.activo }).subscribe({
      next: updated => {
        this.usuarios = this.usuarios.map(u => u.id === updated.id ? updated : u);
        this.toast.exito(`Usuario ${accion === 'desactivar' ? 'desactivado' : 'activado'}`);
      },
      error: (e) => this.toast.error(e.error?.detail ?? `Error al ${accion} usuario`),
    });
  }

  etiquetaRol(rol: string): string {
    return rol === 'admin' ? 'Administrador' : 'Cajero';
  }
}
