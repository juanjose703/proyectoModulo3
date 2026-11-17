import { NgModule } from '@angular/core';
import { NativeScriptRouterModule } from '@nativescript/angular';
import { InicioComponent } from './inicio.component';
import { PedidosComponent } from './pedidos.component';
import { FavoritosComponent } from './favoritos.component';
import { AjustesComponent } from './ajustes.component';

@NgModule({
  imports: [NativeScriptRouterModule.forChild([
    { path: '', redirectTo: '/inicio', pathMatch: 'full' },
    { path: 'inicio', component: InicioComponent },
    { path: 'pedidos', component: PedidosComponent },
    { path: 'favoritos', component: FavoritosComponent },
    { path: 'ajustes', component: AjustesComponent },
    { path: '**', redirectTo: '/inicio' },
  ])],
  exports: [NativeScriptRouterModule],
})
export class TiendaRoutingModule {}
