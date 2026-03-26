import { Component, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor, NgClass, DatePipe } from '@angular/common';
import { VentasService } from '../../core/services/ventas.service';
import { ToastService } from '../../core/services/toast.service';
import { Venta } from '../../core/models/venta.model';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, NgClass, DatePipe],
  templateUrl: './ventas.component.html',
})
export class VentasComponent implements OnInit {
  private svc   = inject(VentasService);
  private toast = inject(ToastService);

  ventas: Venta[] = [];
  cargando = false;
  ventaDetalle: Venta | null = null;

  fechaInicioCtrl = new FormControl('');
  fechaFinCtrl    = new FormControl('');

  ngOnInit() { this.cargarVentas(); }

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

    const items = v.detalles.map(d => `
      <tr>
        <td style="padding:6px 0;border-bottom:1px solid #f1f5f9">${d.producto_nombre ?? 'Producto #' + d.producto_id}</td>
        <td style="text-align:center;padding:6px 4px;border-bottom:1px solid #f1f5f9">${d.cantidad}</td>
        <td style="text-align:right;padding:6px 0;border-bottom:1px solid #f1f5f9">${this.formatearMonto(d.precio_unitario)}</td>
        <td style="text-align:right;padding:6px 0;border-bottom:1px solid #f1f5f9;font-weight:600">${this.formatearMonto(d.subtotal)}</td>
      </tr>`).join('');

    const descuento = v.descuento > 0
      ? `<tr><td colspan="3" style="text-align:right;padding:4px 0;color:#059669">Descuento</td>
         <td style="text-align:right;padding:4px 0;color:#059669">−${this.formatearMonto(v.descuento)}</td></tr>`
      : '';

    const html = `<!DOCTYPE html><html lang="es"><head>
      <meta charset="UTF-8">
      <title>Boleta ${v.numero_boleta}</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 420px; margin: 32px auto; color: #1e293b; font-size: 13px; }
        h1   { font-size: 20px; margin: 0 0 4px; }
        .sub { color: #64748b; font-size: 12px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th    { text-align: left; font-size: 11px; color: #94a3b8; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; }
        th:nth-child(2) { text-align: center; }
        th:nth-child(3), th:nth-child(4) { text-align: right; }
        .total-row td { font-size: 15px; font-weight: 700; color: #2563eb; border-top: 2px solid #e2e8f0; padding-top: 8px; }
        .footer { margin-top: 24px; text-align: center; font-size: 11px; color: #94a3b8; }
        @media print { body { margin: 0; } }
      </style>
    </head><body>
      <h1>Sistema POS</h1>
      <div class="sub">
        Boleta N° ${v.numero_boleta} &nbsp;·&nbsp;
        ${new Date(v.creado_en).toLocaleString('es-CL')} &nbsp;·&nbsp;
        ${this.etiquetaMetodo(v.metodo_pago)}
      </div>
      <table>
        <thead>
          <tr>
            <th>Producto</th><th style="text-align:center">Cant.</th>
            <th style="text-align:right">P. Unit.</th><th style="text-align:right">Subtotal</th>
          </tr>
        </thead>
        <tbody>${items}</tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="text-align:right;padding:8px 0;color:#64748b">Subtotal</td>
            <td style="text-align:right;padding:8px 0;color:#64748b">${this.formatearMonto(v.subtotal)}</td>
          </tr>
          ${descuento}
          <tr class="total-row">
            <td colspan="3" style="text-align:right">TOTAL</td>
            <td style="text-align:right">${this.formatearMonto(v.total)}</td>
          </tr>
        </tfoot>
      </table>
      <div class="footer">¡Gracias por su compra!</div>
    </body></html>`;

    const win = window.open('', '_blank', 'width=500,height=700');
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
