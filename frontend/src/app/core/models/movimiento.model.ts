export interface MovimientoStock {
  id: number;
  producto_id: number;
  producto_nombre?: string;
  tipo: 'venta' | 'ajuste_entrada' | 'ajuste_salida';
  cantidad: number;
  stock_antes: number;
  stock_despues: number;
  motivo?: string;
  usuario_id?: number;
  usuario_nombre?: string;
  creado_en: string;
}

export interface AjusteStock {
  producto_id: number;
  tipo: 'ajuste_entrada' | 'ajuste_salida';
  cantidad: number;
  motivo?: string;
}
