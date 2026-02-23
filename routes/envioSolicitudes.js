const express = require('express');
const router = express.Router();
const optionalAuth = require('../middleware/optionalAuth');
const auth = require('../middleware/auth');
const {
  crearSolicitud,
  obtenerSolicitudes,
  confirmarSolicitud,
  completarSolicitud,
} = require('../controllers/envioSolicitudController');

// POST   /api/envios/solicitudes          — pública (guest o usuario)
router.post('/', optionalAuth, crearSolicitud);

// GET    /api/envios/solicitudes          — solo admin
router.get('/', auth, obtenerSolicitudes);

// PUT    /api/envios/solicitudes/:id/confirmar  — solo admin
router.put('/:id/confirmar', auth, confirmarSolicitud);

// PUT    /api/envios/solicitudes/:id/completar  — solo admin
router.put('/:id/completar', auth, completarSolicitud);

module.exports = router;
