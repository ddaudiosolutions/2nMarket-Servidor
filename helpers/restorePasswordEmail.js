const transporter = require('./transporter');

const restorePasswordEmail = async (datos) => {
  const { nombre, email, token, id } = datos

  const info = await transporter.sendMail({
    from: 'windymarket@windymarket.es',
    to: email,
    subject: "Recupera tu Contraseña",
    text: 'Recupera tu Contraseña',
    html: `<p> Hola: ${nombre}, has solicitado reestablecer tu contraseña para tu cuenta en WindyMarket. </p>
        <p>Sigue el siguiente enlace para generar una nueva contraseña en: <a href="${process.env.FRONTEND_URL}/forgotpassword/${id}">Resetear Password WindyMarket</a></p>        
        <p>Si tu no has registrado una cuenta en WindyMarket, no hagas caso de este correo, debe haber sido un error. 
        Disculpa las molestias </p>`
  });

  console.log('mensaje: %s', info.messageId)
}

module.exports = restorePasswordEmail