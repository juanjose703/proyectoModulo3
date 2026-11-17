import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EstadoLectura } from './lectura.reducer';

export const selectLectura = createFeatureSelector<EstadoLectura>('lectura');

export const selectLecturas = createSelector(selectLectura, estado => estado.lecturas);

export const selectCodigosEnLectura = createSelector(
  selectLecturas,
  lecturas => new Set(lecturas.map(l => l.pedido.codigo)),
);
