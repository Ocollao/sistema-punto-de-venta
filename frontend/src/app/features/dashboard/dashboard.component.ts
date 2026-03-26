import { Component, inject, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { forkJoin } from 'rxjs';
import { VentasService } from '../../core/services/ventas.service';
import { ProductosService } from '../../core/services/productos.service';
import { ResumenReporte, VentaPorDia, TopProducto } from '../../core/models/venta.model';
import { Producto } from '../../core/models/producto.model';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf, NgFor, NgClass],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private ventasSvc = inject(VentasService);
  private productosSvc = inject(ProductosService);

  @ViewChild('lineCanvas') lineCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barCanvas')  barCanvas!: ElementRef<HTMLCanvasElement>;

  resumen: ResumenReporte | null = null;
  topProductos: TopProducto[] = [];
  stockBajo: Producto[] = [];
  cargando = true;

  private lineChart?: Chart;
  private barChart?: Chart;
  private datosPorDia: VentaPorDia[] = [];

  ngOnInit() {
    forkJoin({
      resumen:     this.ventasSvc.resumen(),
      porDia:      this.ventasSvc.ventasPorDia(7),
      top:         this.ventasSvc.topProductos(5),
      stockBajo:   this.productosSvc.listar({ stock_bajo: true }),
    }).subscribe({
      next: ({ resumen, porDia, top, stockBajo }) => {
        this.resumen      = resumen;
        this.datosPorDia  = porDia;
        this.topProductos = top;
        this.stockBajo    = stockBajo;
        this.cargando     = false;
        setTimeout(() => this.crearGraficos(), 0);
      },
      error: () => { this.cargando = false; },
    });
  }

  ngAfterViewInit() {}

  crearGraficos() {
    this.crearGraficoLinea();
    this.crearGraficoBarra();
  }

  crearGraficoLinea() {
    if (!this.lineCanvas) return;
    const labels  = this.datosPorDia.map(d => this.formatearFecha(d.fecha));
    const ingresos = this.datosPorDia.map(d => d.ingresos);

    this.lineChart?.destroy();
    this.lineChart = new Chart(this.lineCanvas.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Ingresos',
          data: ingresos,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.08)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#3b82f6',
          pointRadius: 5,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (v) => this.formatearMonto(Number(v)),
              font: { size: 11 },
            },
            grid: { color: '#f1f5f9' },
          },
          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
        },
      },
    });
  }

  crearGraficoBarra() {
    if (!this.barCanvas || this.topProductos.length === 0) return;
    const labels    = this.topProductos.map(p => p.nombre);
    const cantidades = this.topProductos.map(p => p.cantidad_vendida);

    this.barChart?.destroy();
    this.barChart = new Chart(this.barCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Unidades vendidas',
          data: cantidades,
          backgroundColor: [
            'rgba(59,130,246,0.85)',
            'rgba(99,102,241,0.85)',
            'rgba(168,85,247,0.85)',
            'rgba(236,72,153,0.85)',
            'rgba(249,115,22,0.85)',
          ],
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } } },
          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
        },
      },
    });
  }

  formatearMonto(valor: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency', currency: 'CLP', minimumFractionDigits: 0,
    }).format(valor);
  }

  formatearFecha(fecha: string): string {
    const d = new Date(fecha + 'T00:00:00');
    return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
  }

  ngOnDestroy() {
    this.lineChart?.destroy();
    this.barChart?.destroy();
  }
}
