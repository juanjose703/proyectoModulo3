import { Application } from '@nativescript/core';
import { RadSideDrawer } from 'nativescript-ui-sidedrawer';

export function abrirMenu(): void {
  (Application.getRootView() as RadSideDrawer).showDrawer();
}
