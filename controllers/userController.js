const User = require("../models/User.js");
const Avatar = require('../models/Avatar.js')
const bcryptjs = require("bcryptjs");
const { validationResult } = require("express-validator"); //usamos esto para validar lo que hemos programado en userRoutes con check
const jwt = require("jsonwebtoken");

exports.crearUsuario = async (req, res, next) => { 
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
    
    res.status(200).send({msg:'usuario creado correctamente'});

    //CREAR Y FIRMAR EL JWT
    // const payload = {
    //   user: {
    //     id: user.id,
    //   },
    // };

    // //FIRMAR EL JWT
    // jwt.sign(
    //   payload,
    //   process.env.SECRETA,
    //   {
    //     expiresIn: 7200, //1hora convertido a segundos
    //   },
      // (error) => {
      //   if (error) throw error;
      //   res.json({msg: "Usuario Creado Correctamente" });
      //   // console.log(token)
      // }
    
  } catch (error) {
    res.status(400).json({ msg: "Error en el sistema" });
  }
};

exports.obtenerUsuario =  async (req,res) =>{
 
  try{
    const userGet = await User.findById(req.params.id)
    //console.log(userGet)
    res.send(userGet)
  }catch (error){
    console.log(error);
    res.status(500).send("Hubo un Error");
  }
}

exports.editarUsuario =  async (req,res) => {
  console.log(req.params.id)
  console.log(req.body.nombre)

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try{   
    //ACTUALIZAR USUARIO

    const user = await User.findByIdAndUpdate(
       req.params.id, 
      {$set: req.body},
      {new: true}
      );
    console.log({user})
    res.json({user})

  }catch (error){
    console.log(error);
    res.status(500).send("Hubo un Error");
  }
}

exports.obtenerUsuarios = async (req, res) => {
  try{
    const usersGet = await User.find()
    res.send(usersGet)

  }catch(error) {
    console.log(error)
  }
}


// exports.crearAvatar = async (req, res) => {

  
//   console.log(req.params.id)
  
//   try{
//     const avatar = new Avatar(req.body);
//     avatar.imagesAvatar = {
//       url: req.file.path,
//       filename: req.file.filename,
//     };

//   console.log(avatar)

//    //GUARDAR EL CREADOR VIA JWT
//    avatar.author = req.user.id; //REACTIVAR AL TENER EL STATE DEL USUARIO

//    //GUARDAMOS EL PROYECTO
//    await avatar.save();   
//    res.json(avatar);

//  } catch (error) {
//    console.log(error);
//    res.status(500).send({ error: "Hubo un Error" });
//  }
// }

// exports.obtenerAvatar = async (req,res)=> {
//   console.log(req.params.id)
//   try{

//     const avatarId = await Avatar.find({author: req.params.id})
//     res.send({avatarId})
//     console.log(avatarId)

//   } catch (error) {
//     console.log(error);
//     res.status(500).send("Hubo un Error");
//   }
// }