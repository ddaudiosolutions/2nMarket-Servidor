/* const transporter = require("./transporter");

const restorePasswordEmail = async (datos) => {
  const { nombre, email, id } = datos;
  console.log("DATOS MAIL", datos);
  const mailData = {
    from: "windymarket@windymarket.es",
    to: email,
    subject: "Recupera tu Contraseña",
    text: "Recupera tu Contraseña",
    html: `<p> Hola: ${nombre}, has solicitado reestablecer tu contraseña para tu cuenta en WindyMarket. </p>
        <p>Sigue el siguiente enlace para generar una nueva contraseña en: <a href="${process.env.FRONTEND_URL}/forgotpassword/${id}">Resetear Password WindyMarket</a></p>        
        <p>Si tu no has registrado una cuenta en WindyMarket, no hagas caso de este correo, debe haber sido un error. 
        Disculpa las molestias </p>`,
  };
  console.log("TRansporter0", transporter);
  await transporter.sendMail(mailData, (err, info) => {
    console.log("TRansporter1", transporter);
    if (err) {
      console.log("error : " + JSON.stringify(err));
      throw new Error(`${err}`);
    } else {
      return console.log(JSON.stringify(info));
    }
  });
};

module.exports = restorePasswordEmail;
 */

const util = require("util");
const transporter = require("./transporter"); // Assuming 'transporter' is properly defined.

const sendMailPromise = util.promisify(transporter.sendMail).bind(transporter);

const restorePasswordEmail = async (datos) => {
  try {
    const { nombre, email, id } = datos;
    console.log("DATOS MAIL", datos);

    const mailData = {
      from: "windymarket@windymarket.es",
      to: email,
      subject: "Recupera tu Contraseña",
      text: "Recupera tu Contraseña",
      html: `<p> Hola: ${nombre}, has solicitado reestablecer tu contraseña para tu cuenta en WindyMarket. </p>
        <p>Sigue el siguiente enlace para generar una nueva contraseña en: <a href="${process.env.FRONTEND_URL}/forgotpassword/${id}">Resetear Password WindyMarket</a></p>        
        <p>Si tu no has registrado una cuenta en WindyMarket, no hagas caso de este correo, debe haber sido un error. 
        Disculpa las molestias </p>`,
    };

    console.log("TRansporter0", transporter);
    const info = await sendMailPromise(mailData);
    console.log("TRansporter1", transporter);

    console.log(JSON.stringify(info));
    return info;
  } catch (err) {
    console.log("error : " + JSON.stringify(err));
    throw new Error(`${err}`);
  }
};

module.exports = restorePasswordEmail;
