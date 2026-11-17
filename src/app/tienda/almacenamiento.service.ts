import { Injectable } from '@angular/core';
import { localStorage } from './local-storage';
import { Pedido } from './modelos';

const CLAVE_FAVORITOS = 'favoritos';

/** Persistencia de los pedidos favoritos. */
@Injectable({ providedIn: 'root' })
export class AlmacenamientoService {
  private leer(clave: string): unknown {
    try { return JSON.parse(localStorage.getItem(clave) ?? 'null'); }
    catch { return null; }
  }

  obtenerFavoritos(): Pedido[] {
    const valor = this.leer(CLAVE_FAVORITOS);
    if (!Array.isArray(valor)) { return []; }

    // Descarta datos corruptos y duplicados.
    return valor.filter((p, indice, todos) =>
      p && typeof p.codigo === 'string' &&
      typeof p.montoTotal === 'number' &&
      typeof p.direccion === 'string' &&
      typeof p.fechaEntregaSolicitada === 'string' &&
      todos.findIndex(otro => otro?.codigo === p.codigo) === indice);
  }

  guardarFavorito(pedido: Pedido): void {
    const favoritos = this.obtenerFavoritos();
    if (favoritos.some(item => item.codigo === pedido.codigo)) { return; }
    localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify([...favoritos, pedido]));
  }

  quitarFavorito(codigo: string): void {
    const restantes = this.obtenerFavoritos().filter(p => p.codigo !== codigo);
    localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(restantes));
  }
}
