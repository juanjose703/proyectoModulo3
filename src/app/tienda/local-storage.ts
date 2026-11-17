import { ApplicationSettings } from '@nativescript/core';

/** Envoltorio con forma de localStorage sobre ApplicationSettings (persistente en Android e iOS). */
export const localStorage = {
  getItem(clave: string): string | null {
    return ApplicationSettings.hasKey(clave) ? ApplicationSettings.getString(clave) : null;
  },

  setItem(clave: string, valor: string): void {
    ApplicationSettings.setString(clave, valor);
  },

  removeItem(clave: string): void {
    ApplicationSettings.remove(clave);
  },
};
