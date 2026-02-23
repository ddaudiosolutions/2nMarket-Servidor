const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const franjaLabel = {
  manana: "Mañana (9h–13h)",
  tarde: "Tarde (14h–18h)",
  dia_completo: "Día completo",
};

const pesoLabel = (pesoVolumetrico) => {
  if (pesoVolumetrico === -2)
    return "Económico — bulto largo/mástil (girth ≤ 2.90m)";
  if (pesoVolumetrico === -1) return "Por peso (accesorios, dim ≤ 1.20m)";
  return `Volumétrico (${pesoVolumetrico} kg vol.)`;
};

/**
 * Email al admin con todos los datos de la nueva solicitud.
 */
const enviarEmailAdminNuevaSolicitud = async (solicitud) => {
  const {
    nombreRemi,
    telefonoRemi,
    emailRemi,
    direccionRemi,
    poblacion_CPRemi,
    nombreDesti,
    telefonoDesti,
    emailDesti,
    direccionDesti,
    poblacion_CPDesti,
    alto,
    ancho,
    largo,
    pesoVolumetrico,
    pesoKgs,
    balearicDelivery,
    precioEstimado,
    tipoRecogida,
    franjaHoraria,
    _id,
  } = solicitud;

  const { data, error } = await resend.emails.send({
    from: "WindyMarket <noreply@windymarket.es>",
    to: process.env.ADMIN_EMAIL,
    subject: `Nueva solicitud de envío — ${nombreRemi} → ${nombreDesti}`,
    html: `
      <h2>Nueva solicitud de envío TRINIsend</h2>
      <p><strong>ID solicitud:</strong> ${_id}</p>

      <h3>Remitente</h3>
      <ul>
        <li><strong>Nombre:</strong> ${nombreRemi}</li>
        <li><strong>Teléfono:</strong> ${telefonoRemi}</li>
        <li><strong>Email:</strong> ${emailRemi}</li>
        <li><strong>Dirección:</strong> ${direccionRemi}</li>
        <li><strong>Población / CP:</strong> ${poblacion_CPRemi}</li>
      </ul>

      <h3>Destinatario</h3>
      <ul>
        <li><strong>Nombre:</strong> ${nombreDesti}</li>
        <li><strong>Teléfono:</strong> ${telefonoDesti}</li>
        <li><strong>Email:</strong> ${emailDesti}</li>
        <li><strong>Dirección:</strong> ${direccionDesti}</li>
        <li><strong>Población / CP:</strong> ${poblacion_CPDesti}</li>
      </ul>

      <h3>Paquete</h3>
      <ul>
        <li><strong>Dimensiones (alto × ancho × largo):</strong> ${alto}m × ${ancho}m × ${largo}m</li>
        <li><strong>Tipo tarifa:</strong> ${pesoLabel(pesoVolumetrico)}</li>
        <li><strong>Peso real (kg):</strong> ${pesoKgs}</li>
        <li><strong>Envío a Baleares:</strong> ${balearicDelivery ? "Sí" : "No"}</li>
        <li><strong>Precio estimado:</strong> ${precioEstimado}€</li>
      </ul>

      <h3>Recogida</h3>
      <ul>
        <li><strong>Tipo:</strong> ${tipoRecogida === "domicilio" ? "Recogida en domicilio" : "Punto de recogida"}</li>
        ${franjaHoraria ? `<li><strong>Franja horaria:</strong> ${franjaLabel[franjaHoraria] || franjaHoraria}</li>` : ""}
      </ul>

      <p>Accede al panel de administración para confirmar la solicitud e introducir el precio real.</p>
    `,
  });

  if (error) {
    console.error("Error enviando email admin solicitud:", error);
  } else {
    console.log("Email admin solicitud enviado:", data.id);
  }
};

/**
 * Email al cliente (remitente) confirmando el precio real.
 */
const enviarEmailClienteConfirmacion = async (solicitud) => {
  const {
    nombreRemi,
    emailRemi,
    tipoRecogida,
    franjaHoraria,
    precioReal,
    notas,
  } = solicitud;

  const recogidaTexto =
    tipoRecogida === "domicilio"
      ? `Recogida en domicilio — ${franjaLabel[franjaHoraria] || franjaHoraria}`
      : "Punto de recogida";

  const { data, error } = await resend.emails.send({
    from: "WindyMarket <noreply@windymarket.es>",
    to: emailRemi,
    subject: "Tu solicitud de envío WindyMarket — Precio confirmado",
    html: `
      <p>Hola ${nombreRemi},</p>

      <p>Tu solicitud de envío ha sido procesada.</p>

      <ul>
        <li><strong>Precio definitivo:</strong> ${precioReal}€ (IVA incluido)</li>
        <li><strong>Recogida:</strong> ${recogidaTexto}</li>
        ${notas ? `<li><strong>Nota:</strong> ${notas}</li>` : ""}
      </ul>

      <p>Para confirmar el envío, realiza el pago mediante Bizum o transferencia bancaria
      a los datos que te facilitaremos por teléfono o email.</p>

      <br/>
      <p> WindyMarket </p>
    `,
  });

  if (error) {
    console.error("Error enviando email cliente confirmación:", error);
  } else {
    console.log("Email cliente confirmación enviado:", data.id);
  }
};

module.exports = {
  enviarEmailAdminNuevaSolicitud,
  enviarEmailClienteConfirmacion,
};
