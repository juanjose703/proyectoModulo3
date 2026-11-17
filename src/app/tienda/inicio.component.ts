import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AjustesService } from './ajustes.service';
import { Lectura } from './modelos';
import { abrirMenu } from './menu';
import { quitarDeLectura, vaciarLectura } from './state/lectura.actions';
import { selectLecturas } from './state/lectura.selectors';

@Component({ selector: 'ns-inicio', templateUrl: './inicio.component.html', standalone: false })
export class InicioComponent {
  nombre = '';
  // Se actualiza solo: cada despacho de "Leer ahora" emite un nuevo valor.
  lecturas$: Observable<Lectura[]>;
  abrirMenu = abrirMenu;

  constructor(private ajustes: AjustesService, private store: Store) {
    this.lecturas$ = this.store.select(selectLecturas);
  }

  cargar(): void {
    this.nombre = this.ajustes.obtenerNombreUsuario();
  }

  quitar(lectura: Lectura): void {
    this.store.dispatch(quitarDeLectura({ codigo: lectura.pedido.codigo }));
  }

  vaciar(): void {
    this.store.dispatch(vaciarLectura());
  }
}
