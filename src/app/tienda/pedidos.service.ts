import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, timeout } from 'rxjs';
import { AjustesService, normalizarUrl } from './ajustes.service';
import { Pedido } from './modelos';

const CABECERAS = { Accept: 'application/json', 'ngrok-skip-browser-warning': '1' };

/**
 * ÚNICO lugar donde se hacen solicitudes HTTP al API Express.
 * Los componentes solo llaman a estos métodos y reaccionan al resultado.
 */
@Injectable({ providedIn: 'root' })
export class PedidosService {
  constructor(private http: HttpClient, private ajustes: AjustesService) {}

  /** GET {url}/pedidos?codigoTienda=..&q=.. (el filtrado ocurre en el servidor). */
  buscar(codigoTienda: string, texto = ''): Observable<Pedido[]> {
    const base = normalizarUrl(this.ajustes.obtenerUrlServidor());
    const params: Record<string, string> = { codigoTienda };
    if (texto.trim()) { params['q'] = texto.trim(); }

    return this.http.get<unknown>(base + '/pedidos', { params, headers: CABECERAS }).pipe(
      timeout(10000),
      map(respuesta => {
        if (!Array.isArray(respuesta) || !respuesta.every(p => p &&
          typeof p.codigo === 'string' && typeof p.montoTotal === 'number' &&
          typeof p.direccion === 'string' && typeof p.fechaEntregaSolicitada === 'string')) {
          throw new Error('El servidor no devolvió un listado válido de pedidos.');
        }
        return respuesta as Pedido[];
      }),
    );
  }

  /** GET {url}/salud: sirve para probar la URL configurada en Ajustes. */
  probarConexion(url?: string): Observable<boolean> {
    const base = normalizarUrl(url ?? this.ajustes.obtenerUrlServidor());
    return this.http.get<{ estado?: string }>(base + '/salud', { headers: CABECERAS }).pipe(
      timeout(5000),
      map(respuesta => respuesta?.estado === 'ok'),
    );
  }
}
