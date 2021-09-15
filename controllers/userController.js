const User = require("../models/User.js");
const bcryptjs = require("bcryptjs");
const { validationResult } = require("express-validator"); //usamos esto para validar lo que hemos programado en userRoutes con check
const jwt = require("jsonwebtoken");

exports.crearUsuario = async (req, res) => {
  //REVISAR SI HAY ERRORES
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body; //destructuramos para llamar a los datos

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: "El usuario ya existe" });
    }

    user = new User(req.body);

    //HASHEAR EL PASSWORD
    const salt = await bcryptjs.genSalt(10);
    user.password = await bcryptjs.hash(password, salt);

    //CREANDO EL USUARIO

    await user.save();

    //CREAR Y FIRMAR EL JWT
    const payload = {
      user: {
        id: user.id,
      },
    };

    //FIRMAR EL JWT
    jwt.sign(
      payload,
      process.env.SECRETA,
      {
        expiresIn: 36000, //1hora convertido a segundos
      },
      (error, token) => {
        if (error) throw error;
        res.json({ token: token, msg: "Usuario Creado Correctamente" });
        // console.log(token)
      }
    );

    
  } catch (error) {    
    res.status(400).json({msg: "Error en el sistema"});
  }
  
};
