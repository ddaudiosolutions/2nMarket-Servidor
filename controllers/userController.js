const User = require("../models/User.js");
const Avatar = require("../models/Avatar.js");
const registerEmail = require("../helpers/registerEmail.js");
const bcryptjs = require("bcryptjs");
const { validationResult } = require("express-validator"); //usamos esto para validar lo que hemos programado en userRoutes con check
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const transporter = require("../helpers/transporter.js");
const fs = require("fs");
const { obtenerProductosAuthorDeleteUser, eliminarProductoUserDelete} = require("./productController.js")

exports.crearUsuario = async (req, res, next) => {
  //REVISAR SI HAY ERRORES
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
console.log('req', req.body)
  const { email, password, nombre } = req.body; //destructuramos para llamar a los datos

  try {
    let user = await User.findOne({ email });
    if (user) {
      console.log('usuario Existe')
      return res.status(403).send({ message: "El usuario ya existe" });
    }

    user = new User(req.body);

    //HASHEAR EL PASSWORD
    const salt = await bcryptjs.genSalt(10);
    user.password = await bcryptjs.hash(password, salt);

    //CREAMOS UN OBJETO VACIO EN EL ARRAY DE LAS IMAGESAVATAR
    user.imagesAvatar = {};
    //CREANDO EL USUARIO
    const userRegistered = await user.save();

    //Enviar Email de confiramción
    registerEmail({ email, nombre, token: userRegistered._id });

    res.status(200).send({ msg: "usuario creado correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "Error en el sistema" });
  }
};

exports.obtenerUsuario = async (req, res) => {
  try {
        const userGet = await User.findById(req.params.id);
        return res.status(200).send(userGet);
  } catch (error) {
        console.log(error);
    return res.status(500).send("Hubo un Error");
  }
};

exports.editarUsuario = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  let dataBody = {
    nombre: req.body.nombre,
    email: req.body.email,
    telefono: req.body.telefono,
    showPhone: req.body.showPhone,
    direccion: req.body.direccion,
    poblacion_CP: req.body.poblacion_CP,
    ...(typeof req.file !== "undefined" && {
      imagesAvatar: {
        url: req.file.path,
        filename: req.file.filename,
      },
    }),
  };

  try {
    //REVISAR EL USUARIO
    const userTest = await User.findById(req.params.id);

    //SI EL USUARIO EXISTE O NO!!!
    if (!userTest) {
      return res.status(404).send({ msg: "Usuario no encontrado" });
    }

    //VERIFICAR EL USUARIO
    if (userTest.id !== req.user.id) {
      return res.status(401).json({ msg: "No Estás Autorizado para Editar" });
    }

    //BORRAR EL AVATAR DE CLOUDINARY EN CASO DE SUBIR UNO NUEVO
    if (req.file && userTest.imagesAvatar[0].filename) {
      await cloudinary.uploader.destroy(userTest.imagesAvatar[0].filename, function (err, res) {
        if (err) {
          console.log(err);
          return res.status(400).json({
            ok: false,
            menssage: "Error deleting file",
            errors: err,
          });
        }
        console.log(res);
      });
    }

    //ACTUALIZAR USUARIO
    const user = await User.findByIdAndUpdate(req.params.id, { $set: dataBody }, { new: true });
    res.json({ user });
    // await user.save();
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un Error");
  }
};

exports.obtenerUsuarios = async (req, res) => {
  try {
    const usersGet = await User.find();
    res.send(usersGet);
  } catch (error) {
    console.log(error);
  }
};

exports.eliminarUsuario = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }

  try {
    const usuario = await User.findById(req.params.id);
    if (!usuario) {
        return res.status(404).send({ msg: "Usuario no encontrado" });
    }

    // Aquí asumimos que obtenerProductosAuthorDeleteUser devuelve un objeto con una propiedad 'prodAuth' que es un array de productos
    const { prodAuth } = await obtenerProductosAuthorDeleteUser(req.params.id);

    // Aquí mapeamos los productos a promesas de eliminación y esperamos a que todas se resuelvan
    await Promise.all(prodAuth.map(producto => eliminarProductoUserDelete(producto._id)));

    if (usuario.imagesAvatar[0] && usuario.imagesAvatar[0].filename) {
      await new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(usuario.imagesAvatar[0].filename, function (err, result) {
          if (err) reject(err);
          console.log(result);
          resolve();
        });
      });
    }

    await User.findByIdAndDelete(req.params.id);    
    res.status(200).send({ msg: "USUARIO ELIMINADO" });
  } catch (err) {
    res.status(500).send("Hubo un Error");
  }
};


exports.correoEntreUsuarios = async (req, res) => {
  const { productId, sellerEmail, sellerName, senderEmail, message, senderUserName } = req.body;
 
  try {
    // Configuración del correo electrónico
    const mailOptions = {
      from: process.env.EMAIL_USER, // Cambia esto con tu dirección de correo
      to: sellerEmail, // Cambia esto para enviar al vendedor
      subject: `Consulta sobre el producto ${productId}`,
      html: `<p>Hola,${sellerName}</p>
            <p>${senderUserName} está interesado en tu producto https://www.windymarket.es/productos/${productId}</p>
            <h3>Su Mensaje:</h3>
            <h4>${message}</h4>
            <p><strong>Recuerda que para contactar con el interesado NO debes contestar a este correo directamente.</strong></p>
            <p><strong>Contacta con ${senderUserName} a través de su Correo: <h3>${senderEmail}</h3></strong></p>`,
    };

    // Enviar el correo electrónico
    await transporter.sendMail(mailOptions);

    // Respuesta exitosa
    res.status(200).send("Correo enviado correctamente");
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    res.status(500).send("Error al enviar el correo");
  }
};

exports.mailingUsuarios = async (req, res) => {
  User.find({}, "email -_id") // Selecciona solo el campo email y excluye el campo _id
    .then((usuarios) => {
      // Extraer solo los emails en un array
      const emails = usuarios.map((usuario) => usuario.email);

      // Convertir el array en una cadena JSON
      const jsonEmails = JSON.stringify(emails);

      // Escribir los datos en un archivo .json
      fs.writeFileSync("./storage/emailsDeUsuarios.json", jsonEmails);
      res.status(200).send({ msg: `Emails exportados exitosamente ${emails.length}` });
    })
    .catch((error) => {
      console.error("Error al exportar emails: ", error);
    });
};
