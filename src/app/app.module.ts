import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptModule, provideNativeScriptHttpClient } from '@nativescript/angular';
import { NativeScriptUISideDrawerModule } from 'nativescript-ui-sidedrawer/angular';
import { provideStore } from '@ngrx/store';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { lecturaReducer } from './tienda/state/lectura.reducer';

@NgModule({
  bootstrap: [AppComponent],
  imports: [NativeScriptModule, AppRoutingModule, NativeScriptUISideDrawerModule],
  declarations: [AppComponent],
  providers: [
    provideNativeScriptHttpClient(),
    // Store de Redux (NgRx): el estado "lectura" vive aquí y lo comparten todas las pantallas.
    provideStore({ lectura: lecturaReducer }),
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class AppModule {}
