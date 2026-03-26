import { Injectable, signal } from '@angular/core';

export type ToastTipo = 'exito' | 'error' | 'info';

export interface Toast {
  id: number;
  mensaje: string;
  tipo: ToastTipo;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private contador = 0;
  toasts = signal<Toast[]>([]);

  mostrar(mensaje: string, tipo: ToastTipo = 'exito', duracion = 3500) {
    const id = ++this.contador;
    this.toasts.update(t => [...t, { id, mensaje, tipo }]);
    setTimeout(() => this.cerrar(id), duracion);
  }

  exito(mensaje: string)  { this.mostrar(mensaje, 'exito'); }
  error(mensaje: string)  { this.mostrar(mensaje, 'error', 5000); }
  info(mensaje: string)   { this.mostrar(mensaje, 'info'); }

  cerrar(id: number) {
    this.toasts.update(t => t.filter(x => x.id !== id));
  }
}
