import { createReducer, on } from '@ngrx/store';
import { Lectura } from '../modelos';
import { leerAhora, quitarDeLectura, vaciarLectura } from './lectura.actions';

export interface EstadoLectura {
  lecturas: Lectura[];
}

export const estadoInicial: EstadoLectura = { lecturas: [] };

export const lecturaReducer = createReducer(
  estadoInicial,
  // El último "Leer ahora" queda arriba y no se repiten pedidos.
  on(leerAhora, (estado, { pedido, hora }) => ({
    lecturas: [{ pedido, hora }, ...estado.lecturas.filter(l => l.pedido.codigo !== pedido.codigo)],
  })),
  on(quitarDeLectura, (estado, { codigo }) => ({
    lecturas: estado.lecturas.filter(l => l.pedido.codigo !== codigo),
  })),
  on(vaciarLectura, () => estadoInicial),
);
