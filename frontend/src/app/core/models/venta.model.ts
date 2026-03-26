export interface DetalleVenta {
  id: number;
  producto_id: number;
  producto_nombre?: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Venta {
  id: number;
  numero_boleta: string;
  subtotal: number;
  descuento: number;
  total: number;
  metodo_pago: string;
  estado: string;
  usuario_id: number;
  cliente_id?: number;
  creado_en: string;
  detalles: DetalleVenta[];
}

export interface ItemCarritoPayload {
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
}

export interface VentaCreate {
  items: ItemCarritoPayload[];
  descuento: number;
  metodo_pago: string;
  cliente_id?: number;
}

export interface ResumenReporte {
  total_ventas: number;
  ingresos_totales: number;
  ticket_promedio: number;
  productos_vendidos: number;
}

export interface VentaPorDia {
  fecha: string;
  total_ventas: number;
  ingresos: number;
}

export interface TopProducto {
  nombre: string;
  cantidad_vendida: number;
  ingresos: number;
}
