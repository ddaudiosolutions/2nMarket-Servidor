const User = require("../models/User.js");
const bcryptjs = require("bcryptjs");
const { validationResult } = require("express-validator"); //usamos esto para validar lo que hemos programado en userRoutes con check
const jwt = require("jsonwebtoken");

exports.autenticarUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // EXTRAER MAIL Y PASSWORD DEL USUARIO
  const { email, password } = req.body;

  try {
    //REVISAR QUE SEA USUARIO REGISTRADO
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "El usuario no existe" });
    }

    //EN CASO DE QUE EXISTE REVISAMOS EL PASSWORD
    const correctPassword = await bcryptjs.compare(password, user.password);
    if (!correctPassword) {
      return res.status(499).json({ msg: "Password Incorrecto" });
    }

    //SI TODO ES CORRECTO (EMAIL Y PASSWORD), GENERAMOS EL JWT
    //CREAR Y FIRMAR EL JWT
    const payload = {
      user: {
        id: user.id,
      },
    };
    
    jwt.sign(
      payload,
      process.env.SECRETA,
      {
        expiresIn: 36000, //1hora convertido a segundos
      },
      (error, token) => {
        if (error) throw error;
        res.json({ token: token, msg: "Usuario Creado Correctamente" });
      }
    );
  } catch (error) {
    console.log(error);
  }
};
