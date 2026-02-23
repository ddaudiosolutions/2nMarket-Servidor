const EnvioSolicitud = require('../models/EnvioSolicitud');
const {
  enviarEmailAdminNuevaSolicitud,
  enviarEmailClienteConfirmacion,
} = require('../helpers/envioSolicitudEmails');

// POST /api/envios/solicitudes
// Pública — cualquier usuario (incluido guest) puede crear una solicitud
const crearSolicitud = async (req, res) => {
  try {
    const {
      nombreRemi, telefonoRemi, emailRemi, direccionRemi, poblacion_CPRemi,
      nombreDesti, telefonoDesti, emailDesti, direccionDesti, poblacion_CPDesti,
      alto, ancho, largo, pesoVolumetrico, pesoKgs,
      balearicDelivery, precioEstimado,
      tipoRecogida, franjaHoraria,
    } = req.body;

    // Validaciones básicas de campos requeridos
    if (
      !nombreRemi || !telefonoRemi || !emailRemi || !direccionRemi || !poblacion_CPRemi ||
      !nombreDesti || !telefonoDesti || !emailDesti || !direccionDesti || !poblacion_CPDesti ||
      precioEstimado === undefined || !tipoRecogida
    ) {
      return res.status(400).json({ msg: 'Faltan campos obligatorios' });
    }

    if (tipoRecogida === 'domicilio' && !franjaHoraria) {
      return res.status(400).json({ msg: 'La franja horaria es obligatoria para recogida en domicilio' });
    }

    const solicitudData = {
      nombreRemi, telefonoRemi, emailRemi, direccionRemi, poblacion_CPRemi,
      nombreDesti, telefonoDesti, emailDesti, direccionDesti, poblacion_CPDesti,
      alto, ancho, largo, pesoVolumetrico, pesoKgs,
      balearicDelivery, precioEstimado,
      tipoRecogida,
      // Solo guardar franjaHoraria si es recogida a domicilio
      ...(tipoRecogida === 'domicilio' && franjaHoraria ? { franjaHoraria } : {}),
      // Asociar usuario si está autenticado
      usuarioId: req.user ? req.user.id : null,
    };

    const solicitud = new EnvioSolicitud(solicitudData);
    await solicitud.save();

    // Notificar al admin (sin bloquear la respuesta si falla el email)
    enviarEmailAdminNuevaSolicitud(solicitud).catch((err) =>
      console.error('Error enviando email admin nueva solicitud:', err)
    );

    return res.status(201).json(solicitud);
  } catch (error) {
    console.error('Error creando solicitud de envío:', error);
    return res.status(500).json({ msg: 'Error del servidor' });
  }
};

// GET /api/envios/solicitudes
// Solo admin
const obtenerSolicitudes = async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ msg: 'Acceso denegado' });
    }

    const solicitudes = await EnvioSolicitud.find().sort({ createdAt: -1 });
    return res.status(200).json(solicitudes);
  } catch (error) {
    console.error('Error obteniendo solicitudes de envío:', error);
    return res.status(500).json({ msg: 'Error del servidor' });
  }
};

// PUT /api/envios/solicitudes/:id/confirmar
// Admin introduce el precio real, cambia estado a 'confirmada' y envía email al cliente
const confirmarSolicitud = async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ msg: 'Acceso denegado' });
    }

    const { precioReal, notas } = req.body;

    if (precioReal === undefined || precioReal === null) {
      return res.status(400).json({ msg: 'El campo precioReal es obligatorio' });
    }

    const solicitud = await EnvioSolicitud.findByIdAndUpdate(
      req.params.id,
      { estado: 'confirmada', precioReal, ...(notas !== undefined ? { notas } : {}) },
      { new: true }
    );

    if (!solicitud) {
      return res.status(404).json({ msg: 'Solicitud no encontrada' });
    }

    // Enviar email de confirmación al cliente
    enviarEmailClienteConfirmacion(solicitud).catch((err) =>
      console.error('Error enviando email cliente confirmación:', err)
    );

    return res.status(200).json(solicitud);
  } catch (error) {
    console.error('Error confirmando solicitud de envío:', error);
    return res.status(500).json({ msg: 'Error del servidor' });
  }
};

// PUT /api/envios/solicitudes/:id/completar
// Marca la solicitud como completada (pegatinas enviadas, envío en marcha)
const completarSolicitud = async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ msg: 'Acceso denegado' });
    }

    const solicitud = await EnvioSolicitud.findByIdAndUpdate(
      req.params.id,
      { estado: 'completada' },
      { new: true }
    );

    if (!solicitud) {
      return res.status(404).json({ msg: 'Solicitud no encontrada' });
    }

    return res.status(200).json(solicitud);
  } catch (error) {
    console.error('Error completando solicitud de envío:', error);
    return res.status(500).json({ msg: 'Error del servidor' });
  }
};

module.exports = { crearSolicitud, obtenerSolicitudes, confirmarSolicitud, completarSolicitud };
