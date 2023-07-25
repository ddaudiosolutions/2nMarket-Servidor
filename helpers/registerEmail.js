const transporter = require('./transporter');

const registerEmail = async (datos) => {

  const { nombre, email, token } = datos

  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Comprueba tu cuenta en WindyMarket",
    text: 'Comprueba tu cuenta en WindyMarket',
    html: `<p> Hola: ${nombre}, comprueba tu cuenta en WindyMarket. </p>
        <p>Te has registrado en WindyMarket, Gracias por registrarte en WindyMarket: <a href="${process.env.FRONTEND_URL}/confirmar/${token}">WindyMarket</a></p>        
        <p>Entra en tu perfil para terminar de completar tus datos</p>        
        <p>Si tu no has registrado una cuenta en WindyMarket, no hagas caso de este correo, debe haber sido un error. 
        Disculpa las molestias </p>`
  });

  console.log('mensaje: %s', info.messageId)
}

module.exports = registerEmail