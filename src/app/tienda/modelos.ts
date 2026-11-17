export interface Pedido {
  codigo: string;
  montoTotal: number;
  direccion: string;
  fechaEntregaSolicitada: string;
}

/** Un pedido que el usuario marcó con "Leer ahora" (se guarda en el store de Redux). */
export interface Lectura {
  pedido: Pedido;
  hora: string;
}
