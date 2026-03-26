import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Producto, ProductoForm } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/productos`;

  listar(filtros?: { busqueda?: string; categoria_id?: number; stock_bajo?: boolean }) {
    let params = new HttpParams();
    if (filtros?.busqueda) params = params.set('busqueda', filtros.busqueda);
    if (filtros?.categoria_id) params = params.set('categoria_id', filtros.categoria_id.toString());
    if (filtros?.stock_bajo) params = params.set('stock_bajo', 'true');
    return this.http.get<Producto[]>(this.base, { params });
  }

  crear(data: ProductoForm) {
    return this.http.post<Producto>(this.base, data);
  }

  actualizar(id: number, data: Partial<ProductoForm>) {
    return this.http.put<Producto>(`${this.base}/${id}`, data);
  }

  eliminar(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  subirImagen(id: number, file: File) {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<Producto>(`${this.base}/${id}/imagen`, fd);
  }
}
