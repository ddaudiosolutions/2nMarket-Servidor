const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const restorePasswordEmail = async (datos) => {
  const { nombre, email, id } = datos;
  console.log("DATOS MAIL", datos);

  try {
    const { data, error } = await resend.emails.send({
      from: "WindyMarket <noreply@windymarket.es>",
      replyTo: process.env.ADMIN_EMAIL,
      to: email,
      subject: "Recupera tu Contraseña",
      html: `<p> Hola: ${nombre}, has solicitado reestablecer tu contraseña para tu cuenta en WindyMarket. </p>
        <p>Sigue el siguiente enlace para generar una nueva contraseña en: <a href="${process.env.FRONTEND_URL}/forgotpassword/${id}">Resetear Password WindyMarket</a></p>
        <p>Si tu no has registrado una cuenta en WindyMarket, no hagas caso de este correo, debe haber sido un error.
        Disculpa las molestias </p>`,
    });

    if (error) {
      console.error("Error enviando email recuperación contraseña:", error);
    } else {
      console.log("Email recuperación contraseña enviado:", data.id);
    }
  } catch (err) {
    console.error("Error enviando email recuperación contraseña:", err);
  }
};

module.exports = restorePasswordEmail;
