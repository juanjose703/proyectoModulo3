import { ChangeDetectorRef, Component } from '@angular/core';
import { AjustesService } from './ajustes.service';
import { PedidosService } from './pedidos.service';
import { abrirMenu } from './menu';

@Component({ selector: 'ns-ajustes', templateUrl: './ajustes.component.html', standalone: false })
export class AjustesComponent {
  nombreGuardado = '';   // lo que hay guardado (lectura persistente)
  nombre = '';           // lo que se está editando
  url = '';
  mensajeNombre = '';
  mensajeUrl = '';
  probando = false;
  abrirMenu = abrirMenu;

  constructor(private ajustes: AjustesService, private pedidos: PedidosService, private vista: ChangeDetectorRef) {}

  cargar(): void {
    this.nombreGuardado = this.ajustes.obtenerNombreUsuario();
    this.nombre = this.nombreGuardado;
    this.url = this.ajustes.obtenerUrlServidor();
    this.mensajeNombre = '';
    this.mensajeUrl = '';
  }

  guardarNombre(): void {
    if (!this.ajustes.guardarNombreUsuario(this.nombre)) {
      this.mensajeNombre = 'El nombre debe tener al menos 2 caracteres.';
      return;
    }
    this.nombreGuardado = this.ajustes.obtenerNombreUsuario();
    this.nombre = this.nombreGuardado;
    this.mensajeNombre = 'Nombre guardado.';
  }

  guardarUrl(): void {
    try {
      this.url = this.ajustes.guardarUrlServidor(this.url);
      this.mensajeUrl = 'URL guardada.';
    } catch (error) {
      this.mensajeUrl = (error as Error).message;
    }
  }

  restaurarUrl(): void {
    this.url = this.ajustes.restaurarUrlServidor();
    this.mensajeUrl = 'Se restauró la URL predeterminada.';
  }

  probarConexion(): void {
    if (this.probando) { return; }
    this.probando = true;
    this.mensajeUrl = 'Probando conexión...';
    let consulta;
    try { consulta = this.pedidos.probarConexion(this.url); }
    catch (error) {
      this.probando = false;
      this.mensajeUrl = (error as Error).message;
      return;
    }
    consulta.subscribe({
      next: ok => {
        this.probando = false;
        this.mensajeUrl = ok ? 'Conexión exitosa con el servidor.' : 'El servidor respondió, pero no es el API esperado.';
        this.vista.markForCheck();
      },
      error: () => {
        this.probando = false;
        this.mensajeUrl = 'No se pudo conectar. Revisa que el servidor y el túnel ngrok estén activos.';
        this.vista.markForCheck();
      },
    });
  }
}
