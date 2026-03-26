import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  creado_en: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _usuario = new BehaviorSubject<Usuario | null>(null);
  usuario$ = this._usuario.asObservable();

  get token(): string | null {
    return localStorage.getItem('token');
  }

  get estaAutenticado(): boolean {
    return !!this.token;
  }

  get usuarioActual(): Usuario | null {
    return this._usuario.value;
  }

  get esAdmin(): boolean {
    return this._usuario.value?.rol === 'admin';
  }

  login(email: string, password: string) {
    const body = new URLSearchParams();
    body.set('username', email);
    body.set('password', password);

    return this.http.post<{ access_token: string; token_type: string }>(
      `${environment.apiUrl}/auth/login`,
      body.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    ).pipe(
      tap(resp => {
        localStorage.setItem('token', resp.access_token);
        this.cargarPerfil();
      })
    );
  }

  cargarPerfil() {
    this.http.get<Usuario>(`${environment.apiUrl}/auth/perfil`).subscribe({
      next: usuario => this._usuario.next(usuario),
    });
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    this._usuario.next(null);
    this.router.navigate(['/login']);
  }
}
