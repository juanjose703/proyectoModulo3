import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { defer, finalize, Subscription } from 'rxjs';
import { AlmacenamientoService } from './almacenamiento.service';
import { PedidosService } from './pedidos.service';
import { Pedido } from './modelos';
import { abrirMenu } from './menu';

@Component({ selector: 'ns-pedidos', templateUrl: './pedidos.component.html', standalone: false })
export class PedidosComponent implements OnDestroy {
  readonly tiendas = ['1', '2', '3'];
  codigoTienda = '1';
  textoBusqueda = '';
  cargando = false;
  mensaje = '';
  buscado = false;
  resultados: Pedido[] = [];
  codigosFavoritos = new Set<string>();
  abrirMenu = abrirMenu;
  private solicitud?: Subscription;

  constructor(private servicio: PedidosService, private almacenamiento: AlmacenamientoService,
    private vista: ChangeDetectorRef) {}

  actualizarFavoritos(): void {
    this.codigosFavoritos = new Set(this.almacenamiento.obtenerFavoritos().map(p => p.codigo));
  }

  elegirTienda(codigo: string): void {
    if (this.cargando) { return; }
    this.codigoTienda = codigo;
  }

  /** Botón "Buscar": el filtrado lo hace el API (querystring), vía PedidosService. */
  buscar(): void {
    if (this.cargando) { return; }
    const codigo = this.codigoTienda.trim();
    if (!this.tiendas.includes(codigo)) {
      this.mensaje = 'Elige una tienda: 1, 2 o 3.';
      return;
    }
    this.mensaje = '';
    this.cargando = true;
    this.solicitud = defer(() => this.servicio.buscar(codigo, this.textoBusqueda)).pipe(
      finalize(() => {
        this.cargando = false;
        this.vista.markForCheck();
      }),
    ).subscribe({
      next: pedidos => {
        this.resultados = pedidos;
        this.buscado = true;
        this.cargando = false;
        this.actualizarFavoritos();
        this.mensaje = pedidos.length ? '' : 'No hay pedidos que coincidan con la búsqueda.';
      },
      error: error => {
        this.cargando = false;
        if (error.name === 'TimeoutError') {
          this.mensaje = 'El servidor tardó más de 10 segundos. Vuelve a intentar.';
        } else if (error.status === 0) {
          this.mensaje = 'No se pudo conectar. Revisa la conexión del dispositivo y la URL en Ajustes.';
        } else if (error.status) {
          this.mensaje = 'No se pudieron obtener los pedidos (HTTP ' + error.status + '). Revisa la URL y el servidor.';
        } else {
          this.mensaje = 'No se pudieron obtener los pedidos. ' + error.message;
        }
      },
    });
  }

  limpiar(): void {
    this.solicitud?.unsubscribe();
    this.cargando = false;
    this.textoBusqueda = '';
    this.resultados = [];
    this.buscado = false;
    this.mensaje = '';
  }

  alternarFavorito(pedido: Pedido): void {
    if (this.codigosFavoritos.has(pedido.codigo)) { this.almacenamiento.quitarFavorito(pedido.codigo); }
    else { this.almacenamiento.guardarFavorito(pedido); }
    this.actualizarFavoritos();
  }

  ngOnDestroy(): void { this.solicitud?.unsubscribe(); }
}
