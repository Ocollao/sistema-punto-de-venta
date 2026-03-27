import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CierreCaja, CierreCajaCreate } from '../models/cierre.model';

@Injectable({ providedIn: 'root' })
export class CierreService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/cierre-caja`;

  listar(): Observable<CierreCaja[]> {
    return this.http.get<CierreCaja[]>(`${this.base}/`);
  }

  crear(datos: CierreCajaCreate): Observable<CierreCaja> {
    return this.http.post<CierreCaja>(`${this.base}/`, datos);
  }
}
