const User = require("../models/User.js");
const Avatar = require("../models/Avatar.js");
const registerEmail = require("../helpers/registerEmail.js");
const bcryptjs = require("bcryptjs");
const { validationResult } = require("express-validator"); //usamos esto para validar lo que hemos programado en userRoutes con check
const jwt = require("jsonwebtoken");

const cloudinary = require("cloudinary").v2;

exports.crearUsuario = async (req, res, next) => {
  //REVISAR SI HAY ERRORES
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
    direccion: req.body.direccion,
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
  //REVISAR SI HAY ERRORES
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    //REVISAR EL ID
    let usuario = await User.findById(req.params.id);

    if (usuario.imagesAvatar[0].filename) {
      await cloudinary.uploader.destroy(usuario.imagesAvatar[0].filename, function (err, res) {
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
    } else {
      console.log("no hay foto");
    }
    //SI EL USUARIO EXISTE O NO!!!
    if (!usuario) {
      return res.status(404).send({ msg: "Usuario no encontrado" });
    }

    //ELIMINAR EL USUARIO
    usuario = await User.findByIdAndDelete(req.params.id);

    res.json({ msg: "USUARIO ELIMINADO" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Hubo un Error");
  }
};
