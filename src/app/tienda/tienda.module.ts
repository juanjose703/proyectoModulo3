import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule, NativeScriptFormsModule } from '@nativescript/angular';
import { TiendaRoutingModule } from './tienda-routing.module';
import { BarraNavegacionComponent } from './barra-navegacion.component';
import { InicioComponent } from './inicio.component';
import { PedidosComponent } from './pedidos.component';
import { FavoritosComponent } from './favoritos.component';
import { AjustesComponent } from './ajustes.component';

@NgModule({
  imports: [NativeScriptCommonModule, NativeScriptFormsModule, TiendaRoutingModule],
  declarations: [BarraNavegacionComponent, InicioComponent, PedidosComponent, FavoritosComponent, AjustesComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class TiendaModule {}
