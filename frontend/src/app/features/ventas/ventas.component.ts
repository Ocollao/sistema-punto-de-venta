import { Component, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor, NgClass, DatePipe } from '@angular/common';
import { VentasService } from '../../core/services/ventas.service';
import { ConfigService } from '../../core/services/config.service';
import { ToastService } from '../../core/services/toast.service';
import { Venta, CierreDiario } from '../../core/models/venta.model';
import { ConfigNegocio } from '../../core/models/config.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, NgClass, DatePipe],
  templateUrl: './ventas.component.html',
})
export class VentasComponent implements OnInit {
  private svc       = inject(VentasService);
  private configSvc = inject(ConfigService);
  private toast     = inject(ToastService);

  ventas: Venta[] = [];
  cargando = false;
  ventaDetalle: Venta | null = null;
  private config: ConfigNegocio | null = null;

  fechaInicioCtrl = new FormControl('');
  fechaFinCtrl    = new FormControl('');

  // ── Cierre del día ────────────────────────────────────────────
  mostrarCierre   = false;
  cargandoCierre  = false;
  cierreDiario: CierreDiario | null = null;
  fechaCierreCtrl = new FormControl(new Date().toISOString().slice(0, 10));

  ngOnInit() {
    this.cargarVentas();
    this.configSvc.obtener().subscribe({ next: c => (this.config = c) });
  }

  cargarVentas() {
    this.cargando = true;
    this.svc.listar(
      this.fechaInicioCtrl.value || undefined,
      this.fechaFinCtrl.value    || undefined,
    ).subscribe({
      next: v => { this.ventas = v; this.cargando = false; },
      error: () => { this.cargando = false; },
    });
  }

  verDetalle(venta: Venta) {
    this.svc.obtener(venta.id).subscribe({ next: v => (this.ventaDetalle = v) });
  }

  cerrarDetalle() { this.ventaDetalle = null; }

  // ── Cierre del día ────────────────────────────────────────────
  abrirCierre() {
    this.mostrarCierre = true;
    this.cargarCierre();
  }

  cerrarCierre() {
    this.mostrarCierre = false;
    this.cierreDiario = null;
  }

  cargarCierre() {
    this.cargandoCierre = true;
    const fecha = this.fechaCierreCtrl.value || new Date().toISOString().slice(0, 10);
    this.svc.cierreDiario(fecha).subscribe({
      next: c => { this.cierreDiario = c; this.cargandoCierre = false; },
      error: () => { this.cargandoCierre = false; this.toast.error('Error al cargar cierre'); },
    });
  }

  imprimirCierre() {
    if (!this.cierreDiario) return;
    const c = this.cierreDiario;
    const cfg = this.config;

    const filas = c.por_metodo.map(m => `
      <tr>
        <td>${this.etiquetaMetodo(m.metodo)}</td>
        <td style="text-align:center">${m.cantidad}</td>
        <td style="text-align:right;font-weight:600">${this.formatearMonto(m.total)}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html><html lang="es"><head>
      <meta charset="UTF-8">
      <title>Cierre de Caja – ${c.fecha}</title>
      <style>
        * { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:Arial,sans-serif; max-width:420px; margin:24px auto;
               color:#1e293b; font-size:13px; padding:0 8px; }
        .header { text-align:center; margin-bottom:14px; }
        .biz { font-size:17px; font-weight:700; margin:4px 0; }
        .titulo { font-size:14px; font-weight:700; color:#2563eb; margin:10px 0 4px; }
        .fecha { color:#64748b; font-size:11px; }
        hr { border:none; border-top:1px dashed #cbd5e1; margin:12px 0; }
        .card { display:flex; justify-content:space-between; padding:8px 0;
                border-bottom:1px solid #f1f5f9; font-size:13px; }
        .card-label { color:#64748b; }
        .card-val { font-weight:700; color:#1e293b; }
        table { width:100%; border-collapse:collapse; margin-top:8px; }
        th { font-size:10px; color:#94a3b8; text-transform:uppercase;
             border-bottom:1px solid #e2e8f0; padding:5px 3px; text-align:left; }
        th:nth-child(2) { text-align:center; }
        th:nth-child(3) { text-align:right; }
        td { padding:6px 3px; border-bottom:1px solid #f8fafc; }
        td:nth-child(2) { text-align:center; }
        td:nth-child(3) { text-align:right; }
        .total-row { display:flex; justify-content:space-between; padding:10px 3px;
                     font-size:15px; font-weight:700; color:#2563eb;
                     border-top:2px solid #e2e8f0; margin-top:6px; }
        .footer { text-align:center; font-size:11px; color:#94a3b8;
                  margin-top:18px; padding-top:12px; border-top:1px dashed #cbd5e1; }
        @media print { body { margin:0; } @page { margin:0.5cm; } }
      </style>
    </head><body>
      <div class="header">
        <div class="biz">${cfg?.nombre ?? 'Sistema POS'}</div>
        <div class="fecha">Informe de Cierre de Caja</div>
      </div>
      <hr>
      <div class="titulo">Cierre del día ${c.fecha}</div>
      <div class="card"><span class="card-label">Total ventas</span><span class="card-val">${c.total_ventas}</span></div>
      <div class="card"><span class="card-label">Ingresos brutos</span><span class="card-val">${this.formatearMonto(c.ingresos_totales + c.total_descuentos)}</span></div>
      <div class="card"><span class="card-label">Descuentos aplicados</span><span class="card-val" style="color:#059669">−${this.formatearMonto(c.total_descuentos)}</span></div>
      <hr>
      <div class="titulo">Desglose por método de pago</div>
      <table>
        <thead><tr><th>Método</th><th>Ventas</th><th>Total</th></tr></thead>
        <tbody>${filas}</tbody>
      </table>
      <div class="total-row"><span>TOTAL NETO</span><span>${this.formatearMonto(c.ingresos_totales)}</span></div>
      <div class="footer">Generado el ${new Date().toLocaleString('es-CL')}</div>
    </body></html>`;

    const win = window.open('', '_blank', 'width=520,height=750');
    if (!win) { this.toast.error('Permite las ventanas emergentes para imprimir'); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  }

  // ── Exportar CSV ──────────────────────────────────────────────
  exportarCSV() {
    if (this.ventas.length === 0) {
      this.toast.info('No hay ventas para exportar');
      return;
    }

    const cabecera = ['N° Boleta', 'Fecha', 'Método pago', 'Subtotal', 'Descuento', 'Total', 'Estado'];
    const filas = this.ventas.map(v => [
      v.numero_boleta,
      new Date(v.creado_en).toLocaleString('es-CL'),
      this.etiquetaMetodo(v.metodo_pago),
      v.subtotal,
      v.descuento,
      v.total,
      v.estado,
    ]);

    const csv = [cabecera, ...filas]
      .map(f => f.map(c => `"${c}"`).join(';'))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `ventas_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast.exito(`${this.ventas.length} ventas exportadas`);
  }

  // ── Imprimir boleta ───────────────────────────────────────────
  imprimirBoleta() {
    if (!this.ventaDetalle) return;
    const v = this.ventaDetalle;
    const c = this.config;

    const logoHtml = c?.logo_url
      ? `<img src="${environment.staticUrl}${c.logo_url}" alt="Logo"
             style="max-height:70px;max-width:180px;object-fit:contain;margin-bottom:8px"/>`
      : '';

    const infoNegocio = [
      c?.rut ? `RUT: ${c.rut}` : '',
      c?.direccion ?? '',
      [c?.telefono ? `Tel: ${c.telefono}` : '', c?.email ?? ''].filter(Boolean).join(' · '),
    ].filter(Boolean).join('<br>');

    const items = v.detalles.map(d => `
      <tr>
        <td>${d.producto_nombre ?? 'Producto #' + d.producto_id}</td>
        <td style="text-align:center">${d.cantidad}</td>
        <td style="text-align:right">${this.formatearMonto(d.precio_unitario)}</td>
        <td style="text-align:right;font-weight:600">${this.formatearMonto(d.subtotal)}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html><html lang="es"><head>
      <meta charset="UTF-8">
      <title>Boleta ${v.numero_boleta}</title>
      <style>
        *    { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:Arial,sans-serif; max-width:420px; margin:24px auto;
               color:#1e293b; font-size:13px; padding:0 8px; }
        .header  { text-align:center; margin-bottom:14px; }
        .biz     { font-size:17px; font-weight:700; margin:4px 0 2px; }
        .biz-sub { color:#64748b; font-size:11px; line-height:1.7; }
        hr       { border:none; border-top:1px dashed #cbd5e1; margin:12px 0; }
        .meta    { margin-bottom:12px; }
        .boleta-n { font-size:14px; font-weight:700; color:#2563eb; }
        .boleta-d { color:#64748b; font-size:11px; margin-top:2px; }
        table  { width:100%; border-collapse:collapse; }
        th     { font-size:10px; color:#94a3b8; text-transform:uppercase;
                 border-bottom:1px solid #e2e8f0; padding:5px 3px; text-align:left; }
        th:nth-child(2) { text-align:center; }
        th:nth-child(3), th:nth-child(4) { text-align:right; }
        td     { padding:6px 3px; border-bottom:1px solid #f8fafc; vertical-align:middle; }
        td:nth-child(2) { text-align:center; }
        td:nth-child(3), td:nth-child(4) { text-align:right; }
        .totals { margin-top:10px; }
        .tline  { display:flex; justify-content:space-between;
                  padding:3px 3px; font-size:12px; color:#64748b; }
        .tfinal { display:flex; justify-content:space-between; padding:8px 3px;
                  font-size:15px; font-weight:700; color:#2563eb;
                  border-top:2px solid #e2e8f0; margin-top:4px; }
        .footer { text-align:center; font-size:11px; color:#94a3b8;
                  margin-top:18px; padding-top:12px; border-top:1px dashed #cbd5e1; }
        @media print { body { margin:0; } @page { margin:0.5cm; } }
      </style>
    </head><body>
      <div class="header">
        ${logoHtml}
        <div class="biz">${c?.nombre ?? 'Sistema POS'}</div>
        ${infoNegocio ? `<div class="biz-sub">${infoNegocio}</div>` : ''}
      </div>
      <hr>
      <div class="meta">
        <div class="boleta-n">Boleta N° ${v.numero_boleta}</div>
        <div class="boleta-d">
          ${new Date(v.creado_en).toLocaleString('es-CL')} &nbsp;·&nbsp;
          ${this.etiquetaMetodo(v.metodo_pago)}
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th style="text-align:center">Cant.</th>
            <th style="text-align:right">P.Unit.</th>
            <th style="text-align:right">Subtotal</th>
          </tr>
        </thead>
        <tbody>${items}</tbody>
      </table>
      <div class="totals">
        <div class="tline"><span>Subtotal</span><span>${this.formatearMonto(v.subtotal)}</span></div>
        ${v.descuento > 0
          ? `<div class="tline" style="color:#059669">
               <span>Descuento</span><span>−${this.formatearMonto(v.descuento)}</span>
             </div>`
          : ''}
        <div class="tfinal"><span>TOTAL</span><span>${this.formatearMonto(v.total)}</span></div>
      </div>
      <div class="footer">${c?.mensaje_pie ?? '¡Gracias por su compra!'}</div>
    </body></html>`;

    const win = window.open('', '_blank', 'width=520,height=750');
    if (!win) { this.toast.error('Permite las ventanas emergentes para imprimir'); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  }

  // ── Helpers ───────────────────────────────────────────────────
  formatearMonto(valor: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency', currency: 'CLP', minimumFractionDigits: 0,
    }).format(valor);
  }

  etiquetaMetodo(metodo: string): string {
    const mapa: Record<string, string> = { efectivo: 'Efectivo', debito: 'Débito', credito: 'Crédito' };
    return mapa[metodo] ?? metodo;
  }
}
