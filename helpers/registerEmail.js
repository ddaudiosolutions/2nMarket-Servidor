const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const registerEmail = async (datos) => {
  const { nombre, email, token } = datos;

  const { data, error } = await resend.emails.send({
    from: "WindyMarket <noreply@windymarket.es>",
    to: email,
    subject: "Comprueba tu cuenta en WindyMarket",
    html: `<p> Hola: ${nombre}, comprueba tu cuenta en WindyMarket. </p>
        <p>Te has registrado en WindyMarket, Gracias por registrarte en WindyMarket: <a href="${process.env.FRONTEND_URL}/confirmar/${token}">WindyMarket</a></p>
        <p>Entra en tu perfil para terminar de completar tus datos</p>
        <p>Si tu no has registrado una cuenta en WindyMarket, no hagas caso de este correo, debe haber sido un error.
        Disculpa las molestias </p>`,
  });

  if (error) {
    console.error("Error enviando email de registro:", error);
  } else {
    console.log("Email de registro enviado:", data.id);
  }
};

module.exports = registerEmail;
