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

      <h3>Cómo realizar el pago</h3>
      <p>Envía el importe de <strong>${precioReal}€</strong> por <strong>Bizum</strong> al número:</p>
      <h2>${process.env.BIZUM_PHONE}</h2>
      <p>Como concepto indica: <strong>TRINIsend ${emailRemi}</strong></p>

      <p>Una vez recibido el pago, te enviaremos las etiquetas de envío.</p>

      <br/>
      <p>WindyMarket / TRINIsend</p>
    `,
  });

  if (error) {
    console.error("Error enviando email cliente confirmación:", error);
  } else {
    console.log("Email cliente confirmación enviado:", data.id);
  }
};

/**
 * Email al admin avisando de que el pago ha sido marcado como recibido.
 */
const enviarEmailAdminPagoRecibido = async (solicitud) => {
  const { nombreRemi, emailRemi, telefonoRemi, precioReal, _id } = solicitud;

  const { data, error } = await resend.emails.send({
    from: "WindyMarket <noreply@windymarket.es>",
    to: process.env.ADMIN_EMAIL,
    subject: `✅ Pago recibido — ${nombreRemi} (${precioReal}€)`,
    html: `
      <h2>Pago confirmado — prepara las etiquetas</h2>
      <p><strong>ID solicitud:</strong> ${_id}</p>
      <ul>
        <li><strong>Remitente:</strong> ${nombreRemi}</li>
        <li><strong>Email:</strong> ${emailRemi}</li>
        <li><strong>Teléfono:</strong> ${telefonoRemi}</li>
        <li><strong>Importe cobrado:</strong> ${precioReal}€</li>
      </ul>
      <p>Accede al panel de administración para generar y enviar las etiquetas.</p>
    `,
  });

  if (error) {
    console.error("Error enviando email admin pago recibido:", error);
  } else {
    console.log("Email admin pago recibido enviado:", data.id);
  }
};

/**
 * Email al cliente con las etiquetas de envío adjuntas.
 * @param {Object} solicitud
 * @param {{ filename: string, content: Buffer }} attachment
 */
const enviarEmailClienteEtiquetas = async (solicitud, attachments) => {
  const { nombreRemi, emailRemi, nombreDesti } = solicitud;

  const { data, error } = await resend.emails.send({
    from: "WindyMarket <noreply@windymarket.es>",
    to: emailRemi,
    subject: "TRINIsend — Tus etiquetas de envío",
    html: `
      <p>Hola ${nombreRemi},</p>

      <p>¡Tu pago ha sido confirmado! Adjunto encontrarás las etiquetas de envío para tu paquete con destino a <strong>${nombreDesti}</strong>.</p>

      <p>Instrucciones:</p>
      <ol>
        <li>Imprime las etiquetas adjuntas.</li>
        <li>Pégalas bien visibles en el paquete.</li>
        <li>Lleva el paquete al punto de recogida o espera al repartidor si elegiste recogida en domicilio.</li>
      </ol>

      <p>Si tienes cualquier duda, responde a este email o contáctanos.</p>

      <br/>
      <p>WindyMarket / TRINIsend</p>
    `,
    attachments,
  });

  if (error) {
    console.error("Error enviando email etiquetas al cliente:", error);
  } else {
    console.log("Email etiquetas enviado al cliente:", data.id);
  }
};

module.exports = {
  enviarEmailAdminNuevaSolicitud,
  enviarEmailClienteConfirmacion,
  enviarEmailAdminPagoRecibido,
  enviarEmailClienteEtiquetas,
};
