import { Injectable } from '@angular/core';
import { environment } from '../../config/environment';
import { localStorage } from './local-storage';

const CLAVE_NOMBRE = 'ajustes.nombreUsuario';
const CLAVE_URL = 'ajustes.urlServidor';
const NOMBRE_PREDETERMINADO = 'Invitado';

/** Devuelve la URL sin "/" final o lanza un Error si no es solo dominio y puerto. */
export function normalizarUrl(url: string): string {
  const base = (url ?? '').trim().replace(/\/+$/, '');
  if (!/^https?:\/\/[^/?#\s]+$/.test(base)) {
    throw new Error('La URL debe empezar con http(s):// y llevar solo el dominio y puerto, sin /pedidos ni parámetros.');
  }
  return base;
}

/**
 * Ajustes de la app guardados de forma persistente (ApplicationSettings):
 * nombre de usuario y URL del servidor (ngrok).
 */
@Injectable({ providedIn: 'root' })
export class AjustesService {
  obtenerNombreUsuario(): string {
    return localStorage.getItem(CLAVE_NOMBRE) || NOMBRE_PREDETERMINADO;
  }

  /** Guarda el nombre; devuelve false si no es válido (mínimo 2 caracteres). */
  guardarNombreUsuario(nombre: string): boolean {
    const limpio = (nombre ?? '').trim();
    if (limpio.length < 2) { return false; }
    localStorage.setItem(CLAVE_NOMBRE, limpio);
    return true;
  }

  /** URL guardada por el usuario o, si no hay, la de environment.ts. */
  obtenerUrlServidor(): string {
    return (localStorage.getItem(CLAVE_URL) || environment.apiUrl).trim();
  }

  /** Valida, guarda y devuelve la URL normalizada. Lanza Error si es inválida. */
  guardarUrlServidor(url: string): string {
    const normalizada = normalizarUrl(url);
    localStorage.setItem(CLAVE_URL, normalizada);
    return normalizada;
  }

  restaurarUrlServidor(): string {
    localStorage.removeItem(CLAVE_URL);
    return this.obtenerUrlServidor();
  }
}
