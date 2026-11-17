import { Component, Input } from '@angular/core';

export type Seccion = 'inicio' | 'pedidos' | 'favoritos' | 'ajustes';

/** Barra de pestañas compartida por todas las pantallas (resalta la sección activa). */
@Component({ selector: 'ns-barra-navegacion', templateUrl: './barra-navegacion.component.html', standalone: false })
export class BarraNavegacionComponent {
  @Input() activa: Seccion = 'inicio';
}
