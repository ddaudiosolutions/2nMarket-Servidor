const { Resend } = require("resend");
const User = require("../models/User");

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * POST /api/admin/emailMasivo
 * Crea y envía un Broadcast de Resend a toda la Audience.
 * Solo accesible por usuarios con isAdmin: true.
 *
 * Body: { subject: string, html: string }
 */
exports.emailMasivo = async (req, res) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ msg: "Acceso denegado" });
  }

  const { subject, html } = req.body;

  if (!subject || !html) {
    return res.status(400).json({ msg: "subject y html son obligatorios" });
  }

  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) {
    return res.status(500).json({ msg: "RESEND_AUDIENCE_ID no configurado en .env" });
  }

  try {
    // Crear el broadcast
    const { data: broadcastData, error: createError } = await resend.broadcasts.create({
      audienceId,
      from: "WindyMarket <noreply@windymarket.es>",
      replyTo: process.env.ADMIN_EMAIL,
      name: `Envío masivo - ${new Date().toISOString()}`,
      subject,
      html,
    });

    if (createError) {
      console.error("Error creando broadcast:", createError);
      return res.status(500).json({ msg: "Error creando el broadcast", error: createError });
    }

    // Enviar el broadcast
    const { data: sendData, error: sendError } = await resend.broadcasts.send(broadcastData.id);

    if (sendError) {
      console.error("Error enviando broadcast:", sendError);
      return res.status(500).json({ msg: "Broadcast creado pero error al enviar", broadcastId: broadcastData.id, error: sendError });
    }

    console.log("Broadcast enviado:", broadcastData.id);
    res.status(200).json({
      msg: "Broadcast enviado correctamente",
      broadcastId: broadcastData.id,
    });
  } catch (error) {
    console.error("Error en emailMasivo:", error);
    res.status(500).json({ msg: "Error interno al enviar el broadcast" });
  }
};

/**
 * POST /api/admin/syncAudience
 * Migración única: sincroniza todos los usuarios de MongoDB a la Audience de Resend.
 * Solo accesible por usuarios con isAdmin: true.
 */
exports.syncAudience = async (req, res) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ msg: "Acceso denegado" });
  }

  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) {
    return res.status(500).json({ msg: "RESEND_AUDIENCE_ID no configurado en .env" });
  }

  try {
    const usuarios = await User.find({}, "nombre email").lean();

    let sincronizados = 0;
    let errores = 0;

    for (const u of usuarios) {
      try {
        const { error } = await resend.contacts.create({
          audienceId,
          email: u.email,
          firstName: u.nombre || "",
          unsubscribed: false,
        });

        if (error) {
          // Contacto duplicado (ya existe) — no es un error real
          if (error.name === "validation_error" || error.statusCode === 422) {
            sincronizados++;
          } else {
            errores++;
            console.error(`Error sincronizando ${u.email}:`, error);
          }
        } else {
          sincronizados++;
        }
      } catch (err) {
        errores++;
        console.error(`Error sincronizando ${u.email}:`, err.message);
      }
    }

    res.status(200).json({
      msg: "Sincronización completada",
      total: usuarios.length,
      sincronizados,
      errores,
    });
  } catch (error) {
    console.error("Error en syncAudience:", error);
    res.status(500).json({ msg: "Error interno en la sincronización" });
  }
};
