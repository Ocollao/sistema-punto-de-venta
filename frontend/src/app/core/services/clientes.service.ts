import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Cliente, ClienteForm } from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/clientes`;

  listar(busqueda?: string) {
    let params = new HttpParams();
    if (busqueda) params = params.set('busqueda', busqueda);
    return this.http.get<Cliente[]>(this.base, { params });
  }

  crear(data: ClienteForm) {
    return this.http.post<Cliente>(this.base, data);
  }

  actualizar(id: number, data: Partial<ClienteForm>) {
    return this.http.put<Cliente>(`${this.base}/${id}`, data);
  }
}
