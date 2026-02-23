const mongoose = require('mongoose');

const envioSolicitudSchema = new mongoose.Schema(
  {
    // ── Remitente ──────────────────────────────
    nombreRemi:       { type: String, required: true },
    telefonoRemi:     { type: String, required: true },
    emailRemi:        { type: String, required: true },
    direccionRemi:    { type: String, required: true },
    poblacion_CPRemi: { type: String, required: true },

    // ── Destinatario ───────────────────────────
    nombreDesti:       { type: String, required: true },
    telefonoDesti:     { type: String, required: true },
    emailDesti:        { type: String, required: true },
    direccionDesti:    { type: String, required: true },
    poblacion_CPDesti: { type: String, required: true },

    // ── Paquete ────────────────────────────────
    alto:            { type: Number, default: 0 },
    ancho:           { type: Number, default: 0 },
    largo:           { type: Number, default: 0 },
    // -2 = económico (girth), -1 = por kg, >0 = volumétrico
    pesoVolumetrico: { type: Number, default: 0 },
    pesoKgs:         { type: Number, default: 0 },
    balearicDelivery:{ type: Boolean, default: false },
    precioEstimado:  { type: Number, required: true },

    // ── Recogida ───────────────────────────────
    tipoRecogida: {
      type: String,
      enum: ['domicilio', 'punto'],
      required: true,
    },
    franjaHoraria: {
      type: String,
      enum: ['manana', 'tarde', 'dia_completo'],
      // Solo obligatorio si tipoRecogida === 'domicilio'
    },

    // ── Gestión admin ──────────────────────────
    estado: {
      type: String,
      enum: ['pendiente', 'confirmada', 'completada'],
      default: 'pendiente',
    },
    precioReal: { type: Number },
    notas:      { type: String },

    // ── Usuario (opcional, puede ser guest) ────
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EnvioSolicitud', envioSolicitudSchema);
