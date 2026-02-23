const express = require('express');
const router = express.Router();
const optionalAuth = require('../middleware/optionalAuth');
const auth = require('../middleware/auth');
const {
  crearSolicitud,
  obtenerSolicitudes,
  confirmarSolicitud,
  marcarPagado,
  completarSolicitud,
  upload,
} = require('../controllers/envioSolicitudController');

// POST   /api/envios/solicitudes          — pública (guest o usuario)
router.post('/', optionalAuth, crearSolicitud);

// GET    /api/envios/solicitudes          — solo admin
router.get('/', auth, obtenerSolicitudes);

// PUT    /api/envios/solicitudes/:id/confirmar  — solo admin
router.put('/:id/confirmar', auth, confirmarSolicitud);

// PUT    /api/envios/solicitudes/:id/pago        — solo admin
router.put('/:id/pago', auth, marcarPagado);

// PUT    /api/envios/solicitudes/:id/completar  — solo admin (multipart/form-data, campo: etiquetas)
router.put('/:id/completar', auth, upload.array('etiquetas'), completarSolicitud);

module.exports = router;
