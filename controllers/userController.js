const User = require("../models/User.js");
const Avatar = require("../models/Avatar.js");
const registerEmail = require('../helpers/registerEmail.js');
const bcryptjs = require("bcryptjs");
const { validationResult } = require("express-validator"); //usamos esto para validar lo que hemos programado en userRoutes con check
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;

exports.crearUsuario = async (req, res, next) => {
  //REVISAR SI HAY ERRORES
  console.log(req.body)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, nombre } = req.body; //destructuramos para llamar a los datos

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "El usuario ya existe" });
    }

    user = new User(req.body);

    //HASHEAR EL PASSWORD
    const salt = await bcryptjs.genSalt(10);
    user.password = await bcryptjs.hash(password, salt);

    //CREAMOS UN OBJETO VACIO EN EL ARRAY DE LAS IMAGESAVATAR
    user.imagesAvatar = {}
    //CREANDO EL USUARIO
   const userRegistered = await user.save();
   console.log(userRegistered)
    registerEmail({email, nombre, });

    res.status(200).send({ msg: "usuario creado correctamente" });    
  } catch (error) {
    res.status(400).json({ msg: "Error en el sistema" });
  }
};

exports.obtenerUsuario = async (req, res) => {
  try {
    const userGet = await User.findById(req.params.id);
    //console.log(userGet.imagesAvatar[0]._id)
    res.send(userGet);
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un Error");
  }
};

exports.editarUsuario = async (req, res) => {
  // console.log(req.params.id);
  // console.log(req.files);
  //console.log(req.body.nombre);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let dataBody = {
    nombre: req.body.nombre,
    email: req.body.email,
    telefono: req.body.telefono,
    direccion: req.body.direccion,        
    ...(typeof req.file !== "undefined" && {
      imagesAvatar: {
        url: req.file.path,
        filename: req.file.filename,
      },
    }),
  };
  console.log(dataBody)
  try {
    //REVISAR EL USUARIO
    const userTest = await User.findById(req.params.id);

    //SI EL USUARIO EXISTE O NO!!!
    if (!userTest) {
      console.log("El usuario no Existe para Editar");
      return res.status(404).send({ msg: "Usuario no encontrado" });
    }

    //VERIFICAR EL USUARIO
    if (userTest.id !== req.user.id) {
      return res.status(401).json({ msg: "No Estás Autorizado para Editar" });
    }
   // console.log(userTest.imagesAvatar[0]._id)
    //BORRAR EL AVATAR DE CLOUDINARY EN CASO DE SUBIR UNO NUEVO
    if (req.file && (userTest.imagesAvatar[0].filename)) {
      await cloudinary.uploader.destroy(
        userTest.imagesAvatar[0].filename,
        function (err, res) {
          if (err) {
            console.log(err);
            return res.status(400).json({
              ok: false,
              menssage: "Error deleting file",
              errors: err,
            });
          }
          console.log(res);
        }
      );
    }

    //ACTUALIZAR USUARIO
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: dataBody },
      { new: true }
    );
    // const imagesAvatar = {
    //     url: req.file.path,
    //     filename: req.file.filename,
    //   };
    // if(userTest.imagesAvatar[0].filename !== user.imagesAvatar[0].filename)
    // user.imagesAvatar = {
    //     url: req.file.path,
    //     filename: req.file.filename,
    //   };    

    // console.log(user.imagesAvatar);
     res.json({ user });
    // await user.save();
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un Error");
  }

  // cloudinary.uploader.destroy(
  //   imagesAvatar.filename,
  //   function (err, res) {
  //     if (err) {
  //       console.log(err);
  //       return res.status(400).json({
  //         ok: false,
  //         menssage: "Error deleting file",
  //         errors: err,
  //       });
  //     }
  //      console.log(res);
  //   }
  // )
};

exports.obtenerUsuarios = async (req, res) => {
  try {
    const usersGet = await User.find();
    res.send(usersGet);
  } catch (error) {
    console.log(error);
  }
};

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

exports.eliminarUsuario = async (req, res) => {
  //REVISAR SI HAY ERRORES
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  console.log(req.params.id)
  try {
    //REVISAR EL ID
    let usuario = await User.findById(req.params.id);
    console.log(usuario)

    if (usuario.imagesAvatar[0].filename) {
      await cloudinary.uploader.destroy(
        usuario.imagesAvatar[0].filename,
        function (err, res) {
          if (err) {
            console.log(err);
            return res.status(400).json({
              ok: false,
              menssage: "Error deleting file",
              errors: err,
            });
          }
          console.log(res);
        }
      );
    } else {
      console.log('no hay foto')
    }
    //SI EL USUARIO EXISTE O NO!!!
    if (!usuario) {
      return res.status(404).send({ msg: "Usuario no encontrado" });
    }

    //Verificar el USUARIO
    // if (usuario._id !== req.user.id) {
    //   return res.status(401).json({ msg: "No Autorizado para Eliminar" });
    // }

    //ELIMINAR EL USUARIO
    usuario = await User.findByIdAndDelete(req.params.id);
    
    //ITERAMOS SOBRE LAS IMAGENES PARA TOMAR EL NOMBRE DE CADA IMAGEN Y BORRARLA EN CLOUDINARY
    // for(let imagesAvatar of usuario.imagesAvatar){   
    //    cloudinary.uploader.destroy(
    //     imagesAvatar.filename,
    //     function (err, res) {
    //       if (err) {
    //         console.log(err);
    //         return res.status(400).json({
    //           ok: false,
    //           menssage: "Error deleting file",
    //           errors: err,
    //         });
    //       }
    //        console.log(res);
    //     }
    //   );}   

      
    

    res.json({ msg: "USUARIO ELIMINADO" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un Error");
  }
};
