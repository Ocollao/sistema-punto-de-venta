import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario, UsuarioCreate, UsuarioUpdate } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/usuarios`;

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.base}/`);
  }

  crear(datos: UsuarioCreate): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.base}/`, datos);
  }

  actualizar(id: number, datos: UsuarioUpdate): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.base}/${id}`, datos);
  }
}
