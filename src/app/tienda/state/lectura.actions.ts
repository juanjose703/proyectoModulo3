import { createAction, props } from '@ngrx/store';
import { Pedido } from '../modelos';

export const leerAhora = createAction('[Favoritos] Leer ahora', props<{ pedido: Pedido; hora: string }>());
export const quitarDeLectura = createAction('[Inicio] Quitar de lectura', props<{ codigo: string }>());
export const vaciarLectura = createAction('[Inicio] Vaciar lectura');
