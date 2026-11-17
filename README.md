# Mis Pedidos

App móvil (NativeScript + Angular) para buscar pedidos de una tienda en un API Express, guardarlos como favoritos,
marcarlos con **Leer ahora** (estado compartido con Redux/NgRx) y configurar el usuario y la URL del servidor.

## Versiones

Angular declara Node ^22.22.3 || ^24.15.0 || >=26.0.0.

    npm install -g nativescript@9.1.1
    ns doctor

Android: compile/target SDK **35**, Build Tools **35**, mínimo Android API **24**.

## Cómo ejecutarla

1. **Backend** (Express):

        cd backend
        npm install
        npm start            # puerto 3000
        npm test             # pruebas del API

2. **Túnel** (para que el celular/emulador llegue al backend):

        ngrok http 3000

3. **App**: en `src/config/environment.ts` poner el dominio del túnel (solo dominio y puerto, sin `/pedidos` ni parámetros).
   También se puede cambiar **sin recompilar** desde la pestaña **Ajustes** (hay botón “Probar conexión”).

        npm install
        ns run android       # o: ns run ios
        npm test             # pruebas de la lógica de la app (sin emulador)

## Consigna del módulo

| # | Requisito | Dónde verlo |
|---|-----------|-------------|
| 1 | Express con webservice GET filtrado por querystring | `backend/app.cjs`: `GET /pedidos?codigoTienda=1&q=zona&montoMinimo=200` (más `GET /salud`). Pruebas en `backend/tests/app.test.cjs` |
| 2 | Listado con formulario de búsqueda (caja de texto + botón) y filtrado funcionando | `src/app/tienda/pedidos.component.*`: elegir tienda, escribir texto y pulsar **Buscar**; el filtro lo aplica el servidor |
| 3 | Variable de configuración con la URL de ngrok; la búsqueda se conecta por HTTP desde un Service | `src/config/environment.ts` (valor por defecto) + ajuste editable en **Ajustes**; `PedidosService.buscar()` arma `{url}/pedidos?...` |
| 4 | Service de Angular que hace la solicitud HTTP | `src/app/tienda/pedidos.service.ts` (único lugar con `HttpClient`; los componentes no hacen HTTP) |
| 5 | Sección Settings que lee el nombre de usuario persistente | `ajustes.component.*` + `ajustes.service.ts` (`ApplicationSettings` a través de `local-storage.ts`); el nombre también saluda en **Inicio** |
| 6 | Pantalla para editar el nombre y persistirlo | `ajustes.component.*` → “Cambiar nombre de usuario” → `AjustesService.guardarNombreUsuario()` |
| 7 | Ícono para guardar favorito en el listado de búsqueda | Estrella ☆/★ en cada resultado de `pedidos.component.html` |
| 8 | Favoritos listados en su sección | `favoritos.component.*` (datos de `almacenamiento.service.ts`) |
| 9 | “Leer ahora” en favoritos que despacha un action a Redux | `favoritos.component.ts` → `store.dispatch(leerAhora({ pedido, hora }))`; `state/lectura.actions.ts` y `state/lectura.reducer.ts` |
| 10 | Pantalla principal con los elementos de “Leer ahora”, actualizada reactivamente con `select` | `inicio.component.*`: `store.select(selectLecturas)` + `async`; store registrado en `app.module.ts` con `provideStore` |

## Estructura

    backend/
    ├── app.cjs  server.cjs  tests/app.test.cjs
    src/
    ├── config/environment.ts               # URL por defecto del API (ngrok)
    └── app/
        ├── app.module.ts                   # provideStore({ lectura: lecturaReducer })
        └── tienda/
            ├── inicio.component.*          # lista reactiva de "Leer ahora"
            ├── pedidos.component.*         # formulario de búsqueda + favoritos
            ├── favoritos.component.*       # "Leer ahora" -> dispatch
            ├── ajustes.component.*         # usuario y URL del servidor
            ├── barra-navegacion.component.*# pestañas compartidas
            ├── pedidos.service.ts          # HTTP
            ├── ajustes.service.ts          # AppSettings: usuario y URL
            ├── almacenamiento.service.ts   # AppSettings: favoritos
            └── state/                      # actions, reducer y selectors de Redux
