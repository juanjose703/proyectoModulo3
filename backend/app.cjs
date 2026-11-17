const express = require('express');
const app = express();

// Datos de ejemplo: pedidos agrupados por código de tienda.
const pedidosPorTienda = {
  '1': [
    { codigo: 'T1-001', montoTotal: 100, direccion: 'Zona 1, avenida 1', fechaEntregaSolicitada: '2026-10-01' },
    { codigo: 'T1-002', montoTotal: 200, direccion: 'Zona 2, avenida 2', fechaEntregaSolicitada: '2026-10-02' },
    { codigo: 'T1-003', montoTotal: 300, direccion: 'Zona 3, avenida 3', fechaEntregaSolicitada: '2026-10-03' },
  ],
  '2': [
    { codigo: 'T2-001', montoTotal: 150, direccion: 'Zona 4, calle 1', fechaEntregaSolicitada: '2026-10-04' },
    { codigo: 'T2-002', montoTotal: 250, direccion: 'Zona 5, calle 2', fechaEntregaSolicitada: '2026-10-05' },
  ],
  '3': [
    { codigo: 'T3-001', montoTotal: 175, direccion: 'Zona 6, avenida 1', fechaEntregaSolicitada: '2026-10-06' },
    { codigo: 'T3-002', montoTotal: 275, direccion: 'Zona 7, avenida 2', fechaEntregaSolicitada: '2026-10-07' },
    { codigo: 'T3-003', montoTotal: 375, direccion: 'Zona 8, avenida 3', fechaEntregaSolicitada: '2026-10-08' },
    { codigo: 'T3-004', montoTotal: 475, direccion: 'Zona 9, avenida 4', fechaEntregaSolicitada: '2026-10-09' },
  ],
};

const normalizar = texto =>
  String(texto).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

// Comprueba que el servidor está activo (la app lo usa para "Probar conexión").
app.get('/salud', (req, res) => {
  res.json({ estado: 'ok' });
});

// GET /pedidos?codigoTienda=1            -> todos los pedidos de la tienda
// GET /pedidos?codigoTienda=1&q=zona 2   -> filtra por código o dirección
// GET /pedidos?codigoTienda=3&montoMinimo=300 -> filtra por monto total
app.get('/pedidos', (req, res) => {
  const { codigoTienda, q, montoMinimo } = req.query;

  if (typeof codigoTienda !== 'string' || !Object.hasOwn(pedidosPorTienda, codigoTienda)) {
    return res.status(400).json({ mensaje: 'El codigo de tienda debe ser 1, 2 o 3.' });
  }

  let pedidos = pedidosPorTienda[codigoTienda];

  if (typeof q === 'string' && q.trim()) {
    const texto = normalizar(q);
    pedidos = pedidos.filter(p =>
      normalizar(p.codigo).includes(texto) || normalizar(p.direccion).includes(texto));
  }

  if (montoMinimo !== undefined) {
    const minimo = Number(montoMinimo);
    if (typeof montoMinimo !== 'string' || montoMinimo.trim() === '' || !Number.isFinite(minimo)) {
      return res.status(400).json({ mensaje: 'montoMinimo debe ser un número.' });
    }
    pedidos = pedidos.filter(p => p.montoTotal >= minimo);
  }

  res.json(pedidos);
});

module.exports = app;
