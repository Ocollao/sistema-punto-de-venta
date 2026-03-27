import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ConfigNegocio, ConfigNegocioUpdate } from '../models/config.model';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/config`;

  obtener() {
    return this.http.get<ConfigNegocio>(`${this.base}/`);
  }

  actualizar(datos: ConfigNegocioUpdate) {
    return this.http.put<ConfigNegocio>(`${this.base}/`, datos);
  }

  subirLogo(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<ConfigNegocio>(`${this.base}/logo`, fd);
  }

  eliminarLogo() {
    return this.http.delete<void>(`${this.base}/logo`);
  }
}
