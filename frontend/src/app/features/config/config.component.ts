import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { ConfigService } from '../../core/services/config.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './config.component.html',
})
export class ConfigComponent implements OnInit {
  private svc   = inject(ConfigService);
  private auth  = inject(AuthService);
  private toast = inject(ToastService);
  private fb    = inject(FormBuilder);

  guardando     = false;
  subiendoLogo  = false;
  logoPreview: string | null = null;

  get esAdmin() { return this.auth.esAdmin; }

  form = this.fb.group({
    nombre:      ['', Validators.required],
    rut:         [''],
    direccion:   [''],
    telefono:    [''],
    email:       [''],
    mensaje_pie: [''],
  });

  ngOnInit() {
    this.svc.obtener().subscribe({
      next: (c) => {
        this.form.patchValue({
          nombre:      c.nombre ?? '',
          rut:         c.rut ?? '',
          direccion:   c.direccion ?? '',
          telefono:    c.telefono ?? '',
          email:       c.email ?? '',
          mensaje_pie: c.mensaje_pie ?? '',
        });
        if (c.logo_url) {
          this.logoPreview = `${environment.staticUrl}${c.logo_url}`;
        }
      },
    });
  }

  guardar() {
    if (this.form.invalid) return;
    this.guardando = true;
    const raw = this.form.value;
    const datos = {
      nombre:      raw.nombre      ?? undefined,
      rut:         raw.rut         ?? undefined,
      direccion:   raw.direccion   ?? undefined,
      telefono:    raw.telefono    ?? undefined,
      email:       raw.email       ?? undefined,
      mensaje_pie: raw.mensaje_pie ?? undefined,
    };
    this.svc.actualizar(datos).subscribe({
      next: () => {
        this.guardando = false;
        this.toast.exito('Configuración guardada correctamente');
      },
      error: () => {
        this.guardando = false;
        this.toast.error('Error al guardar la configuración');
      },
    });
  }

  seleccionarLogo(event: Event) {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;
    this.subiendoLogo = true;
    this.svc.subirLogo(file).subscribe({
      next: (c) => {
        this.subiendoLogo = false;
        this.logoPreview = c.logo_url
          ? `${environment.staticUrl}${c.logo_url}?t=${Date.now()}`
          : null;
        this.toast.exito('Logo actualizado');
      },
      error: () => {
        this.subiendoLogo = false;
        this.toast.error('Error al subir el logo');
      },
    });
  }

  quitarLogo() {
    this.svc.eliminarLogo().subscribe({
      next: () => {
        this.logoPreview = null;
        this.toast.exito('Logo eliminado');
      },
      error: () => this.toast.error('Error al eliminar el logo'),
    });
  }
}
