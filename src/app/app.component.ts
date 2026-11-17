import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { RouterExtensions } from '@nativescript/angular';
import { Application } from '@nativescript/core';
import { RadSideDrawer } from 'nativescript-ui-sidedrawer';
import { filter } from 'rxjs';

@Component({ selector: 'ns-app', templateUrl: './app.component.html', standalone: false })
export class AppComponent {
  urlActual = '/inicio';

  constructor(private router: RouterExtensions, enrutador: Router) {
    enrutador.events.pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(e => this.urlActual = (e as NavigationEnd).urlAfterRedirects);
  }

  esActiva(ruta: string): boolean {
    return this.urlActual === ruta;
  }

  navegar(ruta: string): void {
    this.router.navigate([ruta], { clearHistory: true });
    (Application.getRootView() as RadSideDrawer).closeDrawer();
  }
}
