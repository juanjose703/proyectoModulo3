// Pruebas de la lógica de la app (sin emulador): transpila los .ts y los ejecuta con dependencias simuladas.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const rxjs = require('rxjs');

const disco = new Map();            // simula ApplicationSettings
const cache = new Map();
const root = path.resolve(__dirname, '../src');

// ---- Simulación mínima de @ngrx/store (mismo contrato que usa la app) ----
const ngrx = {
  props: () => ({}),
  createAction: type => { const creador = (carga = {}) => ({ ...carga, type }); creador.type = type; return creador; },
  on: (creador, fn) => ({ type: creador.type, fn }),
  createReducer: (inicial, ...ons) => (estado = inicial, accion) => {
    const coincide = ons.find(o => o.type === accion.type);
    return coincide ? coincide.fn(estado, accion) : estado;
  },
  createFeatureSelector: clave => estado => estado[clave],
  createSelector: (...args) => { const fn = args.pop(); return estado => fn(...args.map(s => s(estado))); },
  Store: class {},
};
class AlmacenFalso {
  constructor(reducers) {
    this.reducers = reducers;
    this.estado$ = new rxjs.BehaviorSubject(Object.fromEntries(
      Object.entries(reducers).map(([clave, r]) => [clave, r(undefined, { type: '@init' })])));
    this.acciones = [];
  }
  dispatch(accion) {
    this.acciones.push(accion);
    const actual = this.estado$.value;
    this.estado$.next(Object.fromEntries(Object.entries(this.reducers).map(([c, r]) => [c, r(actual[c], accion)])));
  }
  select(selector) { return this.estado$.pipe(rxjs.map(selector), rxjs.distinctUntilChanged()); }
}

function cargar(archivo) {
  const ruta = path.resolve(root, archivo);
  if (cache.has(ruta)) return cache.get(ruta);
  const exports = {};
  cache.set(ruta, exports);
  const codigo = ts.transpileModule(fs.readFileSync(ruta + '.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, experimentalDecorators: true },
  }).outputText;
  vm.runInNewContext(codigo, {
    exports,
    require: id => {
      if (id.startsWith('.')) return cargar(path.resolve(path.dirname(ruta), id));
      if (id === '@angular/core') return { Injectable: () => x => x, Component: () => x => x, Input: () => () => {} };
      if (id === '@nativescript/core') return {
        isAndroid: true,
        Application: {},
        ApplicationSettings: {
          hasKey: key => disco.has(key), getString: key => disco.get(key),
          setString: (key, value) => disco.set(key, value), remove: key => disco.delete(key),
        },
      };
      if (id === '@ngrx/store') return ngrx;
      if (id === 'rxjs') return rxjs;
      if (id === '@angular/common/http') return {};
      throw new Error('Dependencia no simulada: ' + id);
    },
  });
  return exports;
}

const { AjustesService, normalizarUrl } = cargar('app/tienda/ajustes.service');
const { AlmacenamientoService } = cargar('app/tienda/almacenamiento.service');
const { PedidosService } = cargar('app/tienda/pedidos.service');
const { PedidosComponent } = cargar('app/tienda/pedidos.component');
const { FavoritosComponent } = cargar('app/tienda/favoritos.component');
const { InicioComponent } = cargar('app/tienda/inicio.component');
const { AjustesComponent } = cargar('app/tienda/ajustes.component');
const { lecturaReducer, estadoInicial } = cargar('app/tienda/state/lectura.reducer');
const { leerAhora, quitarDeLectura, vaciarLectura } = cargar('app/tienda/state/lectura.actions');
const { environment } = cargar('config/environment');

// Los arreglos creados dentro del vm son de otro realm: se copian para compararlos con deepEqual.
const codigos = lista => Array.from(lista, x => x.pedido.codigo);
let notificaciones = 0;
const vista = { markForCheck: () => notificaciones++ };
const datos = [
  { codigo: 'T1-001', montoTotal: 100, direccion: 'Zona 1', fechaEntregaSolicitada: '2026-10-01' },
  { codigo: 'T1-002', montoTotal: 200, direccion: 'Zona 2', fechaEntregaSolicitada: '2026-10-02' },
];

// ---------- Ajustes (AppSettings): usuario y URL ----------
const ajustes = new AjustesService();
assert.equal(ajustes.obtenerNombreUsuario(), 'Invitado');
assert.equal(ajustes.guardarNombreUsuario(' Ana '), true);
assert.equal(new AjustesService().obtenerNombreUsuario(), 'Ana', 'el nombre persiste en una instancia nueva');
assert.equal(ajustes.guardarNombreUsuario('A'), false);
assert.equal(ajustes.obtenerNombreUsuario(), 'Ana');
assert.equal(ajustes.obtenerUrlServidor(), environment.apiUrl);
assert.equal(ajustes.guardarUrlServidor(' https://demo.ngrok-free.dev/ '), 'https://demo.ngrok-free.dev');
assert.equal(new AjustesService().obtenerUrlServidor(), 'https://demo.ngrok-free.dev');
assert.throws(() => ajustes.guardarUrlServidor('https://demo.ngrok-free.dev/pedidos?codigoTienda=1'), /solo el dominio/);
assert.equal(ajustes.obtenerUrlServidor(), 'https://demo.ngrok-free.dev');
assert.equal(ajustes.restaurarUrlServidor(), environment.apiUrl);
assert.throws(() => normalizarUrl('ftp://x'), /http/);

const pantallaAjustes = new AjustesComponent(ajustes, { probarConexion: () => rxjs.of(true) }, vista);
pantallaAjustes.cargar();
assert.equal(pantallaAjustes.nombreGuardado, 'Ana');
pantallaAjustes.nombre = 'Luis';
pantallaAjustes.guardarNombre();
assert.equal(ajustes.obtenerNombreUsuario(), 'Luis');
pantallaAjustes.nombre = '';
pantallaAjustes.guardarNombre();
assert.ok(pantallaAjustes.mensajeNombre.includes('al menos 2'));
assert.equal(ajustes.obtenerNombreUsuario(), 'Luis');
pantallaAjustes.url = 'dominio-malo';
pantallaAjustes.guardarUrl();
assert.ok(pantallaAjustes.mensajeUrl.includes('http'));
pantallaAjustes.probarConexion();
assert.ok(pantallaAjustes.mensajeUrl.includes('Conexión exitosa') || pantallaAjustes.mensajeUrl.includes('http'));
console.log('OK: ajustes persistentes (nombre y URL), validaciones y pantalla de Ajustes.');

// ---------- Favoritos (persistencia) ----------
const storage = new AlmacenamientoService();
storage.guardarFavorito(datos[0]);
storage.guardarFavorito({ ...datos[0] });
assert.equal(new AlmacenamientoService().obtenerFavoritos().length, 1);
disco.set('favoritos', '{JSON roto');
assert.equal(storage.obtenerFavoritos().length, 0);
disco.set('favoritos', JSON.stringify([datos[0], datos[0], null, {}]));
assert.equal(storage.obtenerFavoritos().length, 1);
disco.delete('favoritos');
console.log('OK: favoritos únicos y tolerancia a datos corruptos.');

// ---------- PedidosService: única capa HTTP ----------
let ultima;
const http = { get: (url, opciones) => { ultima = { url, opciones }; return rxjs.of(datos); } };
const servicio = new PedidosService(http, ajustes);
servicio.buscar('1', '  t1-002 ').subscribe(r => assert.equal(r.length, 2));
assert.equal(ultima.url, environment.apiUrl + '/pedidos');
assert.deepEqual({ ...ultima.opciones.params }, { codigoTienda: '1', q: 't1-002' });
servicio.buscar('2').subscribe();
assert.deepEqual({ ...ultima.opciones.params }, { codigoTienda: '2' }, 'sin texto no se envía q');
ajustes.guardarUrlServidor('https://otro.ngrok-free.dev');
servicio.buscar('3').subscribe();
assert.equal(ultima.url, 'https://otro.ngrok-free.dev/pedidos', 'usa la URL configurada en Ajustes');
ajustes.restaurarUrlServidor();
servicio.probarConexion().subscribe();
assert.equal(ultima.url, environment.apiUrl + '/salud');
assert.throws(() => new PedidosService(http, { obtenerUrlServidor: () => environment.apiUrl + '/pedidos?codigoTienda=1' }).buscar('1'), /solo el dominio/);
let errorInvalido;
new PedidosService({ get: () => rxjs.of({ error: 'sin listado' }) }, ajustes).buscar('1').subscribe({ error: e => errorInvalido = e });
assert.ok(errorInvalido.message.includes('listado válido'));
console.log('OK: PedidosService arma la URL y el querystring, usa la URL de Ajustes y valida la respuesta.');

// ---------- PedidosComponent: formulario de búsqueda ----------
const llamadas = [];
const falso = { buscar: (codigo, texto) => { llamadas.push([codigo, texto]); return rxjs.of(texto ? [datos[1]] : datos); } };
const listado = new PedidosComponent(falso, storage, vista);
listado.codigoTienda = '9';
listado.buscar();
assert.equal(llamadas.length, 0);
assert.ok(listado.mensaje.includes('Elige una tienda'));
listado.elegirTienda('1');
listado.buscar();
assert.deepEqual(llamadas[0], ['1', '']);
assert.equal(listado.resultados.length, 2);
listado.textoBusqueda = 'T1-002';
listado.buscar();
assert.deepEqual(llamadas[1], ['1', 'T1-002'], 'el texto viaja al servicio (filtro en el servidor)');
assert.equal(listado.resultados.length, 1);
listado.alternarFavorito(datos[1]);
assert.equal(listado.codigosFavoritos.has('T1-002'), true);
assert.equal(storage.obtenerFavoritos().length, 1);
listado.alternarFavorito(datos[1]);
assert.equal(listado.codigosFavoritos.has('T1-002'), false);
listado.limpiar();
assert.equal(listado.resultados.length, 0);

const vacio = new PedidosComponent({ buscar: () => rxjs.of([]) }, storage, vista);
vacio.buscar();
assert.ok(vacio.mensaje.includes('No hay pedidos'));

const pendiente = new rxjs.Subject();
const cancelable = new PedidosComponent({ buscar: () => pendiente }, storage, vista);
cancelable.buscar();
assert.equal(cancelable.cargando, true);
cancelable.limpiar();
pendiente.next(datos);
assert.equal(cancelable.resultados.length, 0);

const casos = [
  [{ status: 0 }, 'No se pudo conectar'],
  [{ status: 500 }, 'HTTP 500'],
  [new rxjs.TimeoutError(), '10 segundos'],
  [new Error('boom'), 'boom'],
];
for (const [fallo, texto] of casos) {
  const c = new PedidosComponent({ buscar: () => rxjs.throwError(() => fallo) }, storage, vista);
  c.buscar();
  assert.equal(c.cargando, false);
  assert.ok(c.mensaje.includes(texto), c.mensaje);
}
const urlMala = new PedidosComponent(new PedidosService(http, { obtenerUrlServidor: () => 'x/pedidos?codigoTienda=1' }), storage, vista);
urlMala.buscar();
assert.equal(urlMala.cargando, false);
assert.ok(urlMala.mensaje.includes('solo el dominio'));
assert.ok(notificaciones > 0, 'las respuestas notifican a la vista');
console.log('OK: búsqueda con filtro por querystring, favoritos, cancelación y mensajes de error.');

// ---------- Redux: reducer, FavoritosComponent -> store -> InicioComponent ----------
let estado = lecturaReducer(undefined, { type: '@init' });
assert.equal(estado.lecturas.length, 0);
estado = lecturaReducer(estado, leerAhora({ pedido: datos[0], hora: '10:00' }));
estado = lecturaReducer(estado, leerAhora({ pedido: datos[1], hora: '10:01' }));
estado = lecturaReducer(estado, leerAhora({ pedido: datos[0], hora: '10:02' }));
assert.deepEqual(codigos(estado.lecturas), ['T1-001', 'T1-002'], 'sin duplicados y el último arriba');
assert.equal(estado.lecturas[0].hora, '10:02');
assert.deepEqual(codigos(lecturaReducer(estado, quitarDeLectura({ codigo: 'T1-001' })).lecturas), ['T1-002']);
assert.equal(lecturaReducer(estado, vaciarLectura()).lecturas.length, 0);

const store = new AlmacenFalso({ lectura: lecturaReducer });
storage.guardarFavorito(datos[0]);
storage.guardarFavorito(datos[1]);
const pantallaFavoritos = new FavoritosComponent(storage, store);
pantallaFavoritos.cargar();
assert.equal(pantallaFavoritos.favoritos.length, 2);

const inicio = new InicioComponent(ajustes, store);
inicio.cargar();
assert.equal(inicio.nombre, ajustes.obtenerNombreUsuario());
const vistos = [];
const suscripcion = inicio.lecturas$.subscribe(l => vistos.push(codigos(l)));
assert.deepEqual(vistos, [[]], 'Inicio arranca vacío');

pantallaFavoritos.leerAhora(datos[1]);
assert.equal(store.acciones.at(-1).type, '[Favoritos] Leer ahora', 'se despacha el action');
assert.deepEqual(vistos.at(-1), ['T1-002'], 'Inicio se actualiza solo con select()');
assert.equal(pantallaFavoritos.codigosEnLectura.has('T1-002'), true, 'Favoritos también reacciona');
pantallaFavoritos.leerAhora(datos[0]);
assert.deepEqual(vistos.at(-1), ['T1-001', 'T1-002']);
inicio.quitar({ pedido: datos[0] });
assert.deepEqual(vistos.at(-1), ['T1-002']);
assert.equal(pantallaFavoritos.codigosEnLectura.has('T1-001'), false);
inicio.vaciar();
assert.deepEqual(vistos.at(-1), []);
suscripcion.unsubscribe();
pantallaFavoritos.ngOnDestroy();
pantallaFavoritos.quitar(datos[0]);
assert.equal(pantallaFavoritos.favoritos.length, 1);
console.log('OK: Redux — "Leer ahora" despacha el action y Inicio se actualiza reactivamente con select().');
