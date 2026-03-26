import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MovimientoStock, AjusteStock } from '../models/movimiento.model';

@Injectable({ providedIn: 'root' })
export class StockService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/stock`;

  listarMovimientos(filtros?: {
    producto_id?: number;
    tipo?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
  }) {
    let params = new HttpParams();
    if (filtros?.producto_id) params = params.set('producto_id', filtros.producto_id.toString());
    if (filtros?.tipo) params = params.set('tipo', filtros.tipo);
    if (filtros?.fecha_inicio) params = params.set('fecha_inicio', filtros.fecha_inicio);
    if (filtros?.fecha_fin) params = params.set('fecha_fin', filtros.fecha_fin);
    return this.http.get<MovimientoStock[]>(`${this.base}/movimientos`, { params });
  }

  ajustar(datos: AjusteStock) {
    return this.http.post<MovimientoStock>(`${this.base}/ajuste`, datos);
  }
}
