import { Component, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor, NgClass, DecimalPipe } from '@angular/common';
import { VentasService } from '../../core/services/ventas.service';
import { CierreService } from '../../core/services/cierre.service';
import { ToastService } from '../../core/services/toast.service';
import { CierreDiario } from '../../core/models/venta.model';
import { CierreCaja } from '../../core/models/cierre.model';

@Component({
  selector: 'app-cierre',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, NgClass, DecimalPipe],
  templateUrl: './cierre.component.html',
})
export class CierreComponent implements OnInit {
  private ventasSvc = inject(VentasService);
  private cierreSvc = inject(CierreService);
  private toast     = inject(ToastService);

  fechaCtrl            = new FormControl(this.hoyStr());
  montoInicialCtrl     = new FormControl<number | null>(null);
  efectivoDeclaradoCtrl = new FormControl<number | null>(null);
  notasCtrl            = new FormControl('');

  preview: CierreDiario | null = null;
  historial: CierreCaja[] = [];
  cargando  = false;
  guardando = false;

  ngOnInit() {
    this.cargarPreview();
    this.cargarHistorial();
  }

  hoyStr(): string {
    return new Date().toISOString().slice(0, 10);
  }

  ayer() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    this.fechaCtrl.setValue(d.toISOString().slice(0, 10));
    this.cargarPreview();
  }

  hoy() {
    this.fechaCtrl.setValue(this.hoyStr());
    this.cargarPreview();
  }

  cargarPreview() {
    const fecha = this.fechaCtrl.value || this.hoyStr();
    this.cargando = true;
    this.preview = null;
    this.ventasSvc.cierreDiario(fecha).subscribe({
      next: d => { this.preview = d; this.cargando = false; },
      error: () => { this.cargando = false; this.toast.error('Error al cargar datos del día'); },
    });
  }

  cargarHistorial() {
    this.cierreSvc.listar().subscribe({
      next: h => (this.historial = h),
    });
  }

  get efectivoVentas(): number {
    return this.preview?.por_metodo.find(m => m.metodo === 'efectivo')?.total ?? 0;
  }

  get efectivoEsperado(): number {
    return (this.montoInicialCtrl.value ?? 0) + this.efectivoVentas;
  }

  get diferencia(): number | null {
    const decl = this.efectivoDeclaradoCtrl.value;
    return decl !== null ? decl - this.efectivoEsperado : null;
  }

  guardar() {
    if (!this.preview || this.preview.cierre_guardado) return;
    this.guardando = true;
    const payload = {
      fecha: this.fechaCtrl.value || this.hoyStr(),
      monto_inicial: this.montoInicialCtrl.value ?? 0,
      efectivo_declarado: this.efectivoDeclaradoCtrl.value ?? undefined,
      notas: this.notasCtrl.value || undefined,
    };
    this.cierreSvc.crear(payload).subscribe({
      next: () => {
        this.guardando = false;
        this.toast.exito('Cierre guardado correctamente');
        this.cargarPreview();
        this.cargarHistorial();
      },
      error: (e) => {
        this.guardando = false;
        this.toast.error(e.error?.detail ?? 'Error al guardar el cierre');
      },
    });
  }

  imprimirInforme() {
    if (!this.preview) return;
    const p = this.preview;
    const monto = this.montoInicialCtrl.value ?? 0;
    const esp = this.efectivoEsperado;
    const decl = this.efectivoDeclaradoCtrl.value;
    const dif = this.diferencia;

    const metodos = p.por_metodo.map(m => `
      <tr>
        <td>${this.etiquetaMetodo(m.metodo)}</td>
        <td style="text-align:center">${m.cantidad}</td>
        <td style="text-align:right;font-weight:600">${this.fmt(m.total)}</td>
      </tr>`).join('');

    const topProd = p.top_productos.map((t, i) => `
      <tr>
        <td>${i + 1}. ${t.nombre}</td>
        <td style="text-align:center">${t.cantidad}</td>
        <td style="text-align:right">${this.fmt(t.total)}</td>
      </tr>`).join('');

    const cuadreFila = decl !== null
      ? `<div class="dif" style="color:${dif! >= 0 ? '#059669' : '#dc2626'}">
           <span>Diferencia</span><span>${dif! >= 0 ? '+' : ''}${this.fmt(dif!)}</span>
         </div>`
      : '';

    const html = `<!DOCTYPE html><html lang="es"><head>
      <meta charset="UTF-8"><title>Cierre de Caja – ${p.fecha}</title>
      <style>
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:Arial,sans-serif;max-width:420px;margin:24px auto;
             color:#1e293b;font-size:13px;padding:0 8px}
        h1{font-size:17px;font-weight:700;text-align:center;margin-bottom:4px}
        .sub{text-align:center;color:#64748b;font-size:11px;margin-bottom:12px}
        hr{border:none;border-top:1px dashed #cbd5e1;margin:10px 0}
        .sec{font-size:10px;color:#94a3b8;text-transform:uppercase;
             letter-spacing:.05em;margin:10px 0 4px;font-weight:700}
        .row{display:flex;justify-content:space-between;padding:4px 0;
             font-size:12px;border-bottom:1px solid #f1f5f9}
        .row-bold{font-weight:700;font-size:13px;color:#2563eb;
                  border-top:2px solid #e2e8f0;margin-top:4px;padding-top:6px}
        .dif{display:flex;justify-content:space-between;padding:6px 0;
             font-weight:700;font-size:13px}
        table{width:100%;border-collapse:collapse;font-size:12px}
        th{font-size:10px;color:#94a3b8;text-transform:uppercase;
           border-bottom:1px solid #e2e8f0;padding:4px 2px;text-align:left}
        th:nth-child(2){text-align:center}th:nth-child(3){text-align:right}
        td{padding:5px 2px;border-bottom:1px solid #f8fafc}
        td:nth-child(2){text-align:center}td:nth-child(3){text-align:right}
        .footer{text-align:center;font-size:10px;color:#94a3b8;
                margin-top:16px;padding-top:10px;border-top:1px dashed #cbd5e1}
        @media print{body{margin:0}@page{margin:.5cm}}
      </style>
    </head><body>
      <h1>Cierre de Caja</h1>
      <div class="sub">${p.fecha} · Generado ${new Date().toLocaleString('es-CL')}</div>
      <hr>
      <div class="sec">Resumen del día</div>
      <div class="row"><span>Total ventas</span><span>${p.total_ventas}</span></div>
      <div class="row"><span>Ticket promedio</span><span>${this.fmt(p.ticket_promedio)}</span></div>
      <div class="row"><span>Descuentos</span><span>–${this.fmt(p.total_descuentos)}</span></div>
      ${p.hora_pico ? `<div class="row"><span>Hora pico</span><span>${p.hora_pico.hora} (${p.hora_pico.cantidad} ventas)</span></div>` : ''}
      <div class="row row-bold"><span>INGRESOS NETOS</span><span>${this.fmt(p.ingresos_totales)}</span></div>
      <hr>
      <div class="sec">Por método de pago</div>
      <table><thead><tr><th>Método</th><th>Ventas</th><th>Total</th></tr></thead>
        <tbody>${metodos}</tbody></table>
      <hr>
      <div class="sec">Cuadre de efectivo</div>
      <div class="row"><span>Fondo inicial</span><span>${this.fmt(monto)}</span></div>
      <div class="row"><span>+ Ventas efectivo</span><span>${this.fmt(this.efectivoVentas)}</span></div>
      <div class="row row-bold"><span>TOTAL ESPERADO</span><span>${this.fmt(esp)}</span></div>
      ${decl !== null ? `<div class="row"><span>Efectivo declarado</span><span>${this.fmt(decl)}</span></div>${cuadreFila}` : ''}
      ${p.top_productos.length > 0 ? `<hr>
      <div class="sec">Top productos del día</div>
      <table><thead><tr><th>Producto</th><th>Cant.</th><th>Total</th></tr></thead>
        <tbody>${topProd}</tbody></table>` : ''}
      <div class="footer">Sistema POS</div>
    </body></html>`;

    const win = window.open('', '_blank', 'width=520,height=750');
    if (!win) { this.toast.error('Permite las ventanas emergentes para imprimir'); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  }

  fmt(valor: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency', currency: 'CLP', minimumFractionDigits: 0,
    }).format(valor);
  }

  etiquetaMetodo(m: string): string {
    const map: Record<string, string> = { efectivo: 'Efectivo', debito: 'Débito', credito: 'Crédito' };
    return map[m] ?? m;
  }
}
