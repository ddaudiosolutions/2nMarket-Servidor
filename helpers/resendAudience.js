const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Añade un usuario a la Audience de Resend al registrarse.
 * Falla silenciosamente para no bloquear el registro.
 */
const addContactToAudience = async (email, nombre) => {
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) return;

  try {
    const { error } = await resend.contacts.create({
      audienceId,
      email,
      firstName: nombre || "",
      unsubscribed: false,
    });

    if (error) {
      console.error("Error añadiendo contacto a Resend Audience:", error);
    } else {
      console.log("Contacto añadido a Resend Audience:", email);
    }
  } catch (err) {
    console.error("Error añadiendo contacto a Resend Audience:", err.message);
  }
};

/**
 * Marca un usuario como unsubscribed en la Audience al eliminarse.
 * Falla silenciosamente.
 */
const unsubscribeContactFromAudience = async (email) => {
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) return;

  try {
    // Buscamos el contacto por email para obtener su ID
    const { data, error } = await resend.contacts.list({ audienceId });

    if (error || !data) return;

    const contact = data.data?.find((c) => c.email === email);
    if (!contact) return;

    await resend.contacts.update({
      audienceId,
      id: contact.id,
      unsubscribed: true,
    });

    console.log("Contacto desuscrito de Resend Audience:", email);
  } catch (err) {
    console.error("Error desuscribiendo contacto de Resend Audience:", err.message);
  }
};

module.exports = { addContactToAudience, unsubscribeContactFromAudience };
