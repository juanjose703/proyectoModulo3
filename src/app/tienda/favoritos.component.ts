import { Component, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { AlmacenamientoService } from './almacenamiento.service';
import { Pedido } from './modelos';
import { abrirMenu } from './menu';
import { leerAhora } from './state/lectura.actions';
import { selectCodigosEnLectura } from './state/lectura.selectors';

@Component({ selector: 'ns-favoritos', templateUrl: './favoritos.component.html', standalone: false })
export class FavoritosComponent implements OnDestroy {
  favoritos: Pedido[] = [];
  codigosEnLectura = new Set<string>();
  abrirMenu = abrirMenu;
  private readonly suscripcion: Subscription;

  constructor(private almacenamiento: AlmacenamientoService, private store: Store) {
    // El botón se desactiva solo cuando el pedido ya está en el store.
    this.suscripcion = this.store.select(selectCodigosEnLectura).subscribe(codigos => this.codigosEnLectura = codigos);
  }

  cargar(): void {
    this.favoritos = this.almacenamiento.obtenerFavoritos();
  }

  quitar(pedido: Pedido): void {
    this.almacenamiento.quitarFavorito(pedido.codigo);
    this.cargar();
  }

  /** "Leer ahora": despacha un action al store de Redux. */
  leerAhora(pedido: Pedido): void {
    this.store.dispatch(leerAhora({ pedido, hora: new Date().toLocaleTimeString() }));
  }

  ngOnDestroy(): void { this.suscripcion.unsubscribe(); }
}
