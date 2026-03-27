export interface CierreCajaCreate {
  fecha: string;
  monto_inicial: number;
  efectivo_declarado?: number;
  notas?: string;
}

export interface CierreCaja {
  id: number;
  fecha: string;
  total_ventas: number;
  ingresos_totales: number;
  total_descuentos: number;
  efectivo_total: number;
  debito_total: number;
  credito_total: number;
  monto_inicial: number;
  efectivo_esperado: number;
  efectivo_declarado?: number;
  diferencia?: number;
  notas?: string;
  usuario_id: number;
  creado_en: string;
}
