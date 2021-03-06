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
      return res.status(401).send({error: 'El usuario no existe' });
    }

    //EN CASO DE QUE EXISTE REVISAMOS EL PASSWORD
    const correctPassword = await bcryptjs.compare(password, user.password);
    if (!correctPassword) {
      return res.status(401).send({error: 'Password Incorrecto' });
    }

    //SI TODO ES CORRECTO (EMAIL Y PASSWORD), GENERAMOS EL JWT
    //CREAR Y FIRMAR EL JWT
    const payload = {
      user: {   
             id: user.id,  
             nombre: user.nombre           
      },
    };
    let usernombre = user.nombre
    let userId = user.id
   //console.log('hola' + ' ' + user.id + user.nombre)

    let token= jwt.sign( payload, process.env.SECRETA,
      {
        expiresIn: 43200, //12 horas convertido a segundos
      });

      // (error, token, ) => {
      //   if (error) throw error;
        res.status(200).send({accessToken: token, errors: "Usuario Loggeado Correctamente", nombre: usernombre, id: userId });

      //}
    //);
  } catch (error) {
    res.status(401).send({error:'Wrong user or Password'})
  }
};

//Obtiene que usuario esta autenticado
exports.usuarioAutenticado = async (req, res) => {
  try {
      const user = await User.findById(req.user.id).select('password').select('nombre');
     // console.log(user)
      res.json({user});
      
  } catch (error) {
      console.log(error);
      res.status(500).json({error: 'Hubo un error'});
  }
}
