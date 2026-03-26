import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Categoria, CategoriaForm } from '../models/categoria.model';

@Injectable({ providedIn: 'root' })
export class CategoriasService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/categorias`;

  listar() {
    return this.http.get<Categoria[]>(this.base);
  }

  crear(data: CategoriaForm) {
    return this.http.post<Categoria>(this.base, data);
  }

  actualizar(id: number, data: Partial<CategoriaForm>) {
    return this.http.put<Categoria>(`${this.base}/${id}`, data);
  }

  eliminar(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
