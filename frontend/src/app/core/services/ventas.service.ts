import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Venta, VentaCreate, ResumenReporte, VentaPorDia, TopProducto } from '../models/venta.model';

@Injectable({ providedIn: 'root' })
export class VentasService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/ventas`;

  crear(data: VentaCreate) {
    return this.http.post<Venta>(this.base, data);
  }

  listar(fechaInicio?: string, fechaFin?: string) {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fecha_inicio', fechaInicio);
    if (fechaFin) params = params.set('fecha_fin', fechaFin);
    return this.http.get<Venta[]>(this.base, { params });
  }

  obtener(id: number) {
    return this.http.get<Venta>(`${this.base}/${id}`);
  }

  resumen(fechaInicio?: string, fechaFin?: string) {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fecha_inicio', fechaInicio);
    if (fechaFin) params = params.set('fecha_fin', fechaFin);
    return this.http.get<ResumenReporte>(`${this.base}/reporte/resumen`, { params });
  }

  ventasPorDia(dias = 7) {
    return this.http.get<VentaPorDia[]>(`${this.base}/reporte/por-dia`, {
      params: new HttpParams().set('dias', dias.toString()),
    });
  }

  topProductos(limite = 5) {
    return this.http.get<TopProducto[]>(`${this.base}/reporte/top-productos`, {
      params: new HttpParams().set('limite', limite.toString()),
    });
  }
}
