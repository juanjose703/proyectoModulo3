const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../app.cjs');

let servidor;
let base;

test.before(async () => {
  await new Promise(resolve => { servidor = app.listen(0, '127.0.0.1', resolve); });
  base = 'http://127.0.0.1:' + servidor.address().port;
});
test.after(() => servidor.close());

const pedir = async ruta => {
  const respuesta = await fetch(base + ruta);
  return { estado: respuesta.status, cuerpo: await respuesta.json() };
};

test('GET /salud responde ok', async () => {
  const { estado, cuerpo } = await pedir('/salud');
  assert.equal(estado, 200);
  assert.equal(cuerpo.estado, 'ok');
});

test('GET /pedidos devuelve los pedidos de la tienda', async () => {
  const { estado, cuerpo } = await pedir('/pedidos?codigoTienda=3');
  assert.equal(estado, 200);
  assert.equal(cuerpo.length, 4);
});

test('filtra por texto (q) en código y dirección, sin importar mayúsculas', async () => {
  const porCodigo = await pedir('/pedidos?codigoTienda=1&q=t1-002');
  assert.deepEqual(porCodigo.cuerpo.map(p => p.codigo), ['T1-002']);
  const porDireccion = await pedir('/pedidos?codigoTienda=3&q=AVENIDA%201');
  assert.deepEqual(porDireccion.cuerpo.map(p => p.codigo), ['T3-001']);
  const sinResultados = await pedir('/pedidos?codigoTienda=1&q=zzz');
  assert.deepEqual(sinResultados.cuerpo, []);
});

test('filtra por montoMinimo y combina filtros', async () => {
  const { cuerpo } = await pedir('/pedidos?codigoTienda=3&montoMinimo=300');
  assert.deepEqual(cuerpo.map(p => p.codigo), ['T3-003', 'T3-004']);
  const combinado = await pedir('/pedidos?codigoTienda=3&montoMinimo=300&q=T3-004');
  assert.deepEqual(combinado.cuerpo.map(p => p.codigo), ['T3-004']);
});

test('valida los parámetros', async () => {
  assert.equal((await pedir('/pedidos')).estado, 400);
  assert.equal((await pedir('/pedidos?codigoTienda=9')).estado, 400);
  assert.equal((await pedir('/pedidos?codigoTienda=constructor')).estado, 400);
  assert.equal((await pedir('/pedidos?codigoTienda=1&montoMinimo=abc')).estado, 400);
});
